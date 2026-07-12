import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Thumbnail({ image, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group flex-shrink-0 w-28 sm:w-32"
    >
      <div
        className={[
          'rounded-xl border bg-white shadow-sm overflow-hidden',
          isDragging ? 'border-blue-400 shadow-md' : 'border-slate-200',
        ].join(' ')}
      >
        <div className="aspect-square bg-slate-50 relative">
          <img
            src={image.thumbnailUrl}
            alt={image.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {image.isHeic && (
            <span className="absolute top-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-600 text-white">
              HEIC
            </span>
          )}
          <span className="absolute bottom-1.5 left-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-900/80 text-white">
            {index + 1}
          </span>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="px-2 py-1.5 text-[11px] text-slate-600 truncate cursor-grab active:cursor-grabbing"
          title={image.name}
        >
          {image.name}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        aria-label={`Remove ${image.name}`}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
