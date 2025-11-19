import { Button } from '@/components/v2/ui/button';
import { useSlideStore } from '@/stores/slideStore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SlideCard } from './slide';

export const PresentationMode = () => {
  const {
    slides,
    currentSlideId,
    setCurrentSlide,
    togglePresentationMode,
    nextSlide,
    previousSlide
  } = useSlideStore();

  const slideRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const mainEl = slideRef.current;
    if (!mainEl) return;

    const handleResize = () => {
      const targetWidth = 1024;
      const viewportWidth = document.body.clientWidth;

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

  const currentSlide = slides.find(s => s.id === currentSlideId) || slides[0];
  const currentIndex = slides.findIndex(s => s.id === currentSlide?.id);

  useEffect(() => {
    if (!currentSlideId && slides.length > 0) {
      setCurrentSlide(slides[0].id);
    }
  }, [currentSlideId, slides, setCurrentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePresentationMode();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePresentationMode, nextSlide, previousSlide]);

  if (!currentSlide) return null;

  const sortedCards = slides.sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePresentationMode}
          className="bg-card/80 backdrop-blur hover:bg-card"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div
          className="w-full rounded-lg min-h-[600px]"
          style={{
            backgroundColor: currentSlide.bgcolor || 'transparent',
            backgroundImage: currentSlide.backgroundImage
              ? `url(${currentSlide.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >

          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 rounded overflow-hidden" ref={slideRef} >
              <SlideCard
                addText={() => { }}
                addImage={() => { }}
                readOnly
                key={currentSlide.id}
                slide={currentSlide}
                onUpdate={() => { }}
                onDelete={() => { }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex absolute bottom-0 items-center justify-between p-4 bg-panel/80 backdrop-blur">
        <Button
          variant="ghost"
          onClick={previousSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {slides.length}
        </div>

        <Button
          variant="ghost"
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
