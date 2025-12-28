import { Button } from '@/components/v2/ui/button';
import { cn } from '@/lib/utils';
import { SlideCard } from '@/pages/v2/slide';
import { PresentationsService } from '@/services/presentations';
import { useSlideStore, type Slide } from '@/stores/slideStore';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

const SlideThumbnail = ({ slide }: { slide: Slide }) => {
  const { currentSlideId, setCurrentSlide, deleteSlide, duplicateSlide } = useSlideStore();

  const slideRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const mainEl = slideRef.current;
    if (!mainEl) return;

    const handleResize = () => {
      const targetWidth = 1024;
      const viewportWidth = 260;

      if (viewportWidth < targetWidth) {
        const scale = viewportWidth / (targetWidth + 32);
        (mainEl.style as any).zoom = scale;
      } else {
        (mainEl.style as any).zoom = 1;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);

  }, []);

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
        'group relative rounded-lg border-2 cursor-pointer transition-all', 'border-gray-300 hover:border-primary/50 bg-card'
      )}
      onClick={() => {
        setCurrentSlide(slide.id)
      }}
    >
      <div className="bg-gray-100 rounded overflow-hidden mb-2" ref={slideRef} >
        {slide ?
          <SlideCard
            readOnly
            key={slide.id}
            slide={slide}
            onUpdate={() => { }}
            onDelete={() => { }}
          /> : <></>
        }
      </div>
      <div className="text-sm font-medium z-50 absolute bottom-2 left-2 text-foreground truncate p-2 bg-gray-200 w-8 h-8 rounded-md text-center">
        {slide.order + 1}
      </div>

      <div className="flex gap-1 absolute z-50 bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="default"
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
          variant="default"
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

export const SlidesPanel = ({ id }: { id?: string }) => {
  const [slides, setSlides] = useState<Slide[]>([]);

  const getPresentations = () => {
    PresentationsService.list(id)
      .then(({ data }) => {
        setSlides(data?.presentations || []);
      })
  }

  const { reorderSlides, addSlide } = useSlideStore();
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSlides.findIndex(s => s.id === active.id);
      const newIndex = sortedSlides.findIndex(s => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  };

  // useEffect(() => {
  //   if (id) {
  //     const interval = setInterval(() => {
  //       getPresentations();
  //     }, 10000);
  //     return () => clearInterval(interval);
  //   }
  // }, [id])

  return (
    <div className="w-64 hidden md:flex bg-white border-r border-gray-300 overflow-y-auto">
      <div className="p-4 w-full">
        <div className='px-2 w-full'>
          <Button onClick={() => {
            addSlide('type-1');
          }} className='mb-4 w-full px-1 py-1 pr-0' variant={'secondary'}>Novo</Button>
        </div>
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
