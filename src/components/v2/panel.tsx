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
import { v4 } from 'uuid';
import Alert from './ui/alert';

const SlideThumbnail = ({ slide, duplicateSlide, handleDeleteSlide }: { slide: Slide, duplicateSlide: (id: string) => void, handleDeleteSlide: (id: string) => void }) => {
  const { setCurrentSlide } = useSlideStore();
  const slideRef = useRef<HTMLDivElement>(null);

  const [currentScale, setCurrentScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const mainEl = slideRef.current;
    if (!mainEl) return;

    const handleResize = () => {
      const targetWidth = 1024;
      const viewportWidth = 260;
      const scale = viewportWidth < targetWidth ? viewportWidth / (targetWidth + 32) : 1;
      (mainEl.style as any).zoom = scale;
      setCurrentScale(scale);
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
    isDragging
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all',
        'border-gray-600 hover:border-primary/50 bg-card'
      )}
      onClick={() => setCurrentSlide(slide.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="bg-gray-100 rounded overflow-hidden"
        ref={slideRef}
      >
        {slide && (
          <SlideCard
            readOnly
            currentScale={currentScale}
            slide={slide}
            onUpdate={() => { }}
            onDelete={() => { }}
          />
        )}
      </div>

      <div className="text-sm font-medium z-10 absolute bottom-2 left-2 text-foreground p-2 bg-gray-200/80 w-8 h-8 rounded-md text-center">
        {slide.order + 1}
      </div>

      <div className="flex gap-1 absolute z-50 bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            duplicateSlide(slide.id);
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Alert
          title="Deseja deletar?"
          description="Essa ação não poderá ser desfeita."
          buttonHandleAccept={() => handleDeleteSlide(slide.id)}
        >
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Alert>

      </div>


    </div>
  );
};

const Skeleton = () => (
  <div className="animate-pulse flex flex-col gap-4 w-full h-full max-h-36 my-4">
    <div className="bg-gray-300 h-full w-full rounded-lg" />
  </div>
);


export const SlidesPanel = ({ slides, id, updatePresentation, loading, loadingCount, dataPresentation }: {
  slides: Slide[],
  id?: string,
  updatePresentation: (a: Slide[]) => void;
  loading: boolean,
  loadingCount: number,
  dataPresentation: any
}) => {

  const { reorderSlides, addSlide } = useSlideStore();
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const updateIncloud = (_slides: Slide[]) => {
    if (!id) return;
    PresentationsService.update({
      presentations: _slides
    }, id || "")
      .then(() => {
      })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSlides.findIndex(s => s.id === active.id);
      const newIndex = sortedSlides.findIndex(s => s.id === over.id);
      reorderSlides(oldIndex, newIndex);
    }
  };

  const handleDeleteSlide = (id: string) => {
    const update_slide = slides?.filter(slide => slide.id !== id);
    updateIncloud(update_slide || []);
    updatePresentation(update_slide || []);
  };

  const duplicateSlide = (slideId: string) => {
    const slideToDuplicate = slides.find(s => s.id === slideId);
    if (!slideToDuplicate) return;
    const newSlide = { ...slideToDuplicate, id: v4().slice(0, 8), order: slides.length };
    const updatedSlides = [...slides, newSlide];
    updateIncloud(updatedSlides);
    updatePresentation(updatedSlides);
  };



  return (
    <div className={cn(dataPresentation?.thumbnailId === "v2-default" ? "bg-neutral-900 border-r border-gray-900" : "bg-gray-100 border-r border-gray-300 ", "w-64 hidden md:flex overflow-y-auto")}>
      <div className="p-4 w-full">
        <div className='px-2 w-full'>
          <Button onClick={() => {
            let currentSlides = slides;
            const newSlide = addSlide('type-1');
            currentSlides.push(newSlide as unknown as Slide);
            updateIncloud(currentSlides);
          }} className='mb-4 w-full px-1 py-1 pr-0' variant={'default'}>Novo</Button>
        </div>
        {loading ? (
          Array.from({ length: loadingCount ? Number(loadingCount) : 5 }).map((_, i) => (
            <Skeleton key={i} />
          ))
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedSlides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedSlides.map(slide => (
                  <SlideThumbnail
                    key={slide.id} slide={slide} duplicateSlide={duplicateSlide} handleDeleteSlide={handleDeleteSlide} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

      </div>
    </div>
  );
};
