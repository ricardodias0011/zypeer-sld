import { useSlideStore, type Slide } from '@/stores/slideStore';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SlideCard } from './slide';

export const PresentationMode = ({ slides }: { slides: Slide[] }) => {
  const {
    currentSlideId,
    setCurrentSlide,
    togglePresentationMode,
    nextSlide,
    previousSlide
  } = useSlideStore();

  const slideRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const scrollAccumulator = useRef(0);
  const sortedCards = slides.sort((a, b) => a.order - b.order);
  const currentSlide = sortedCards.find(s => s.id === currentSlideId) || sortedCards[0];
  const currentIndex = sortedCards.findIndex(s => s.id === currentSlide?.id);
  const progress = ((currentIndex + 1) / sortedCards.length) * 100;

  useLayoutEffect(() => {
    const mainEl = slideRef.current;
    if (!mainEl) return;
    const handleResize = () => {
      const targetWidth = 1024;
      const viewportWidth = document.body.clientWidth;
      const scale = viewportWidth < targetWidth
        ? viewportWidth / (targetWidth + 32)
        : 1 + (targetWidth / (viewportWidth + 32));
      (mainEl.style as any).zoom = scale;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentSlideId && sortedCards.length > 0) {
      setCurrentSlide(sortedCards[0].id);
    }
  }, [currentSlideId, sortedCards, setCurrentSlide]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = slideRef.current;
      if (!el) return;

      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
      const isAtTop = el.scrollTop <= 0;

      scrollAccumulator.current += e.deltaY;

      if (scrollAccumulator.current > 0 && !isAtBottom) {
        scrollAccumulator.current = 0;
        return;
      }

      if (scrollAccumulator.current < 0 && !isAtTop) {
        scrollAccumulator.current = 0;
        return;
      }

      if (Math.abs(scrollAccumulator.current) > 1200) {
        if (scrollAccumulator.current > 0) nextSlide();
        else previousSlide();
        scrollAccumulator.current = 0;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePresentationMode();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlide, previousSlide, togglePresentationMode]);

  if (!currentSlide) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden cursor-none! group">
      <div
        ref={cursorRef}
        className="pointer-events-none z fixed w-8 h-8 border-2 bg-gradient-to-r to-blue-500 from-blue-800 rounded-full z-[60] transition-transform duration-100 ease-out mix-blend-difference group-hover:scale-150" />

      <div className="flex-1 relative flex items-center justify-center">
        <div
          className={`w-full h-screen overflow-scroll`}
          style={{
            backgroundColor: currentSlide.bgcolor || 'transparent',
            backgroundImage: currentSlide.backgroundImage
              ? `url(${currentSlide.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="overflow-visible" ref={slideRef} >
            <SlideCard
              readOnly
              key={currentSlide.id}
              activeAnimate={true}
              slide={currentSlide}
              onUpdate={() => { }}
              onDelete={() => { }}
            />
          </div>
          <div className='absolute top-0 left-0 w-full h-full'>

          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-4 right-6 text-xs font-mono opacity-50">
        {currentIndex + 1} / {sortedCards.length}
      </div>
    </div>
  );
};