import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useApp } from '../context/AppContext'
import { useImageIngestion } from '../hooks/useImageProcessing'
import { ACCEPTED_MIME, MAX_FILES, validateFile } from '../lib/fileValidation'
import Spinner from './Spinner'

export default function Dropzone() {
  const { addImages, images } = useApp()
  const { ingest } = useImageIngestion()
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onDrop = useCallback(
    async (accepted, rejected) => {
      setError(null)
      if (rejected?.length) {
        setError(rejected[0].errors?.[0]?.message ?? 'Some files were rejected.')
      }
      const valid = []
      for (const file of accepted) {
        const msg = validateFile(file)
        if (msg) {
          setError((prev) => prev ?? msg)
          continue
        }
        if (images.length + valid.length >= MAX_FILES) {
          setError(`You can add up to ${MAX_FILES} images at once.`)
          break
        }
        valid.push(file)
      }
      if (!valid.length) return
      setBusy(true)
      try {
        const records = await ingest(valid)
        addImages(records)
      } catch (e) {
        setError(e?.message ?? 'Could not read one of the files.')
      } finally {
        setBusy(false)
      }
    },
    [addImages, images.length, ingest],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME.reduce((acc, m) => ({ ...acc, [m]: [] }), {}),
    multiple: true,
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={[
          'w-full rounded-2xl border-2 border-dashed transition-all',
          'flex flex-col items-center justify-center gap-3 px-6 py-12 sm:py-16',
          'cursor-pointer select-none',
          isDragActive && !isDragReject
            ? 'border-blue-500 bg-blue-50/60'
            : isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30',
        ].join(' ')}
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            open()
          }
        }}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
          {busy ? (
            <Spinner size={22} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-medium">
            {busy
              ? 'Processing…'
              : isDragActive
                ? 'Drop your images here'
                : 'Drag & drop images, or click to browse'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            JPG, PNG, WebP, GIF, HEIC · up to {MAX_FILES} images · 25 MB each
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
