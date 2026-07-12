// Accept all the formats the app can turn into PDF pages.
// `accept` strings are passed straight through to react-dropzone.
export const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

// Heuristic detection — some OS file pickers report an empty `type` for HEIC.
export function isHeicFile(file) {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  return /\.(heic|heif)$/i.test(file.name || '')
}

// 25 MB per image is generous; pdf-lib holds the full document in memory.
export const MAX_FILE_SIZE = 25 * 1024 * 1024
// Soft cap so a runaway batch doesn't lock the tab.
export const MAX_FILES = 100

export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return `“${file.name}” is larger than 25 MB.`
  }
  const okMime = ACCEPTED_MIME.includes(file.type)
  const okHeic = isHeicFile(file)
  if (!okMime && !okHeic) {
    return `“${file.name}” is not a supported image format.`
  }
  return null
}
