import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useApp } from '../context/AppContext'
import Thumbnail from './Thumbnail'

export default function ImageThumbnailList() {
  const { images, reorderImages, removeImage } = useApp()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!images.length) return null

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderImages(arrayMove(images, oldIndex, newIndex))
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-700">
          {images.length} {images.length === 1 ? 'image' : 'images'}
          <span className="text-slate-400 font-normal"> · drag to reorder</span>
        </h2>
        <button
          type="button"
          onClick={removeImage /* no-op, here as anchor; not used */}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((i) => i.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
            {images.map((image, index) => (
              <Thumbnail
                key={image.id}
                image={image}
                index={index}
                onRemove={removeImage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}
