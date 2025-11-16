import { Button } from '@/components/v2/ui/button';
import { cn } from '@/lib/utils';
import { useSlideStore, type Slide } from '@/stores/slideStore';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Trash2 } from 'lucide-react';

const SlideThumbnail = ({ slide }: { slide: Slide }) => {
  const { currentSlideId, setCurrentSlide, deleteSlide, duplicateSlide } = useSlideStore();
  const isActive = currentSlideId === slide.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative p-3 rounded-lg border-2 cursor-pointer transition-all',
        isActive
          ? 'border-blue-400 bg-card-hover'
          : 'border-gray-300 hover:border-primary/50 bg-card'
      )}
      onClick={() => setCurrentSlide(slide.id)}
    >
      <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
        {slide.cards?.[0]?.imageUrl && (
          <img
            src={slide.cards[0].imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground mb-1">
        Slide
      </div>

      <div className="text-sm font-medium text-foreground truncate mb-2">
        {slide.title}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            duplicateSlide(slide.id);
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            deleteSlide(slide.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const SlidesPanel = () => {
  const { slides, reorderSlides } = useSlideStore();
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSlides.findIndex(s => s.id === active.id);
      const newIndex = sortedSlides.findIndex(s => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-300 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Slides</h2>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedSlides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedSlides.map(slide => (
                <SlideThumbnail key={slide.id} slide={slide} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
