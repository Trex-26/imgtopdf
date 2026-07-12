import { useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function DownloadPanel() {
  const { pdfBlob, pdfUrl, status, error, resetResult, clearImages } = useApp()

  const filename = useMemo(() => {
    const ts = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')
    return `img2pdf-${ts}.pdf`
  }, [pdfBlob])

  // Clean up object URL when component unmounts or a new PDF replaces it.
  useEffect(() => {
    return () => {
      // no-op — the reducer already revokes the URL on replacement.
    }
  }, [pdfUrl])

  if (status === 'error') {
    return (
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">Conversion failed</p>
            <p className="text-sm text-red-700 mt-0.5 break-words">
              {error || 'Something went wrong.'}
            </p>
            <button
              type="button"
              onClick={resetResult}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status !== 'ready' || !pdfBlob || !pdfUrl) return null

  return (
    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
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
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-900">Your PDF is ready</p>
          <p className="text-xs text-emerald-700">{formatBytes(pdfBlob.size)}</p>
        </div>
        <a
          href={pdfUrl}
          download={filename}
          className="rounded-lg px-4 py-2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-colors"
        >
          Download
        </a>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={clearImages}
          className="text-xs text-emerald-700 hover:text-emerald-900 underline"
        >
          Start over
        </button>
      </div>
    </div>
  )
}
