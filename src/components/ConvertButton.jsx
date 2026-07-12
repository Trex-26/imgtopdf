import { useApp } from '../context/AppContext'
import { buildPdf } from '../lib/pdf'
import Spinner from './Spinner'

export default function ConvertButton() {
  const { images, settings, status, progress, startConversion, reportProgress, succeedConversion, failConversion } =
    useApp()

  const disabled = !images.length || status === 'converting'
  const showProgress = status === 'converting' && progress.total > 0
  const pct = showProgress
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  async function handleConvert() {
    if (disabled) return
    startConversion(images.length)
    try {
      const blob = await buildPdf(images, settings, (p) => reportProgress(p.current, p.total))
      succeedConversion(blob)
    } catch (e) {
      console.error(e)
      failConversion(e?.message ?? 'Conversion failed.')
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleConvert}
        disabled={disabled}
        className={[
          'w-full rounded-xl px-5 py-3 font-medium text-white shadow-sm transition-colors',
          'flex items-center justify-center gap-2',
          disabled
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        ].join(' ')}
      >
        {status === 'converting' ? (
          <>
            <Spinner size={16} />
            Converting…
          </>
        ) : (
          <>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Convert to PDF
          </>
        )}
      </button>
      {showProgress && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5 text-center">
            {progress.current} / {progress.total} images
          </p>
        </div>
      )}
    </div>
  )
}
