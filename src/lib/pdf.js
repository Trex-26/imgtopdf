import { PDFDocument } from 'pdf-lib'

// Page sizes in PDF points (1pt = 1/72 inch).
const PAGE_SIZES = {
  A4: { portrait: [595.28, 841.89], landscape: [841.89, 595.28] },
  Letter: { portrait: [612, 792], landscape: [792, 612] },
}

const MARGIN = 24 // points of whitespace on every edge

function resolvePageSize(settings) {
  const entry = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4
  return entry[settings.orientation] || entry.portrait
}

// Decode any browser-decodable image (jpg/png/webp/gif) into a JPEG Blob
// via canvas. This keeps a single embedJpg() code path downstream —
// pdf-lib's embedJpg can't handle WebP/GIF natively.
function decodeToJpegBlob(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas 2D context unavailable.'))
        return
      }
      // White fill so transparent PNGs don't render with a black background.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) {
            reject(new Error('Canvas export failed.'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.92,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image could not be decoded.'))
    }
    img.src = url
  })
}

async function fileToBytes(file) {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Build a PDF from a list of image records.
 * @param {Array} images  - records from AppContext (must have `.file`).
 * @param {{pageSize: 'A4'|'Letter', orientation: 'portrait'|'landscape'}} settings
 * @param {(p:{current:number,total:number}) => void} onProgress
 * @returns {Promise<Blob>}
 */
export async function buildPdf(images, settings, onProgress) {
  if (!images.length) throw new Error('Add at least one image before converting.')

  const doc = await PDFDocument.create()
  doc.setTitle('img2pdf export')
  doc.setProducer('img2pdf')
  doc.setCreator('img2pdf')

  const [pageW, pageH] = resolvePageSize(settings)
  const availW = pageW - MARGIN * 2
  const availH = pageH - MARGIN * 2
  const total = images.length

  for (let i = 0; i < total; i++) {
    const { file, name } = images[i]
    const isPng = file.type === 'image/png' || /\.png$/i.test(name)
    const isWebpOrGif =
      file.type === 'image/webp' ||
      file.type === 'image/gif' ||
      /\.webp$/i.test(name) ||
      /\.gif$/i.test(name)

    let embedded
    if (isPng) {
      const bytes = await fileToBytes(file)
      embedded = await doc.embedPng(bytes)
    } else {
      // pdf-lib's embedJpg only handles actual JPEG. WebP/GIF need a
      // canvas round-trip to JPEG first.
      const jpegBlob = isWebpOrGif ? await decodeToJpegBlob(file) : file
      const bytes = await fileToBytes(jpegBlob)
      embedded = await doc.embedJpg(bytes)
    }

    const page = doc.addPage([pageW, pageH])
    // "contain" fit — letterbox so the image is never cropped or stretched.
    const scale = Math.min(availW / embedded.width, availH / embedded.height)
    const drawW = embedded.width * scale
    const drawH = embedded.height * scale
    page.drawImage(embedded, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2,
      width: drawW,
      height: drawH,
    })

    onProgress?.({ current: i + 1, total })
  }

  const out = await doc.save()
  return new Blob([out], { type: 'application/pdf' })
}

/**
 * Variant used when HEIC files are present. The dropzone path normally
 * transcodes HEIC up-front, but if a record slipped through with the
 * original HEIC blob, this is the fallback.
 */
export async function buildPdfWithHeicFallback(images, settings, onProgress) {
  const normalized = await Promise.all(
    images.map(async (record) => {
      if (!record.isHeic && record.file.type !== 'image/heic' && record.file.type !== 'image/heif') {
        return record
      }
      const { default: heic2any } = await import('heic2any')
      const converted = await heic2any({
        blob: record.file,
        toType: 'image/jpeg',
        quality: 0.92,
      })
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted
      const jpegFile = new File(
        [jpegBlob],
        record.name.replace(/\.(heic|heif)$/i, '.jpg'),
        { type: 'image/jpeg' },
      )
      return { ...record, file: jpegFile }
    }),
  )
  return buildPdf(normalized, settings, onProgress)
}
