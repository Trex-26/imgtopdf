import { useApp } from '../context/AppContext'

const SIZES = [
  { value: 'A4', label: 'A4', sub: '210 × 297 mm' },
  { value: 'Letter', label: 'Letter', sub: '8.5 × 11 in' },
]

const ORIENTATIONS = [
  {
    value: 'portrait',
    label: 'Portrait',
    icon: (
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
    ),
  },
  {
    value: 'landscape',
    label: 'Landscape',
    icon: (
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
    ),
  },
]

export default function PageSettings() {
  const { settings, updateSettings } = useApp()

  return (
    <section className="w-full grid sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">Page size</p>
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((s) => {
            const active = settings.pageSize === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => updateSettings({ pageSize: s.value })}
                className={[
                  'rounded-lg border px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
                aria-pressed={active}
              >
                <div className="text-sm font-medium text-slate-900">{s.label}</div>
                <div className="text-[11px] text-slate-500">{s.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">Orientation</p>
        <div className="grid grid-cols-2 gap-2">
          {ORIENTATIONS.map((o) => {
            const active = settings.orientation === o.value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => updateSettings({ orientation: o.value })}
                className={[
                  'rounded-lg border px-3 py-2.5 flex items-center gap-2 transition-colors',
                  active
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300',
                ].join(' ')}
                aria-pressed={active}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={active ? 'text-blue-600' : 'text-slate-500'}
                >
                  {o.icon}
                </svg>
                <span className="text-sm font-medium text-slate-900">{o.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
