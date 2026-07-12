export default function Header() {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
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
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 16l5-5 4 4 3-3 6 6" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-lg tracking-tight">img2pdf</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          100% in your browser · nothing is uploaded
        </span>
      </div>
    </header>
  )
}
