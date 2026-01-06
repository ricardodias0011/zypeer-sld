import { isDesktop } from '@/lib/utils';
import { useSlideStore, type Slide } from '@/stores/slideStore';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SlideCard } from './slide';
import { Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intentBarRef = useRef<SVGCircleElement>(null);

  const intentProgressRef = useRef(0);
  const intentDirectionRef = useRef<'up' | 'down' | null>(null);
  const intentLockedRef = useRef(false);
  const intentTimeoutRef = useRef<number | null>(null);

  const [currentScale, setCurrentScale] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sortedCards = useMemo(() => [...slides].sort((a, b) => a.order - b.order), [slides]);

  const currentSlide = useMemo(() =>
    sortedCards.find(s => s.id === currentSlideId) || sortedCards[0],
    [sortedCards, currentSlideId]
  );

  const currentIndex = useMemo(() =>
    sortedCards.findIndex(s => s.id === currentSlide?.id),
    [sortedCards, currentSlide]
  );

  const progress = useMemo(() =>
    ((currentIndex + 1) / sortedCards.length) * 100,
    [currentIndex, sortedCards.length]
  );

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetIntent = useCallback(() => {
    intentProgressRef.current = 0;
    intentDirectionRef.current = null;
    if (intentTimeoutRef.current) {
      clearTimeout(intentTimeoutRef.current);
      intentTimeoutRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!isDesktop()) return
      const targetWidth = 1024;
      const viewportWidth = document.body.clientWidth;
      const scale = viewportWidth < targetWidth
        ? viewportWidth / (targetWidth + 32)
        : 1 + (targetWidth / (viewportWidth + 32));
      if (slideRef.current) {
        (slideRef.current.style as any).zoom = scale;
      }
      setCurrentScale(scale);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [slides]);

  useEffect(() => {
    if (!currentSlideId && sortedCards.length > 0) {
      setCurrentSlide(sortedCards[0].id);
    }
  }, [currentSlideId, sortedCards, setCurrentSlide]);

  useEffect(() => {
    if (slides?.length > 0) setCurrentSlide(slides[0].id);
  }, [slides])

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
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': togglePresentationMode(); break;
        case 'ArrowRight':
        case ' ': e.preventDefault(); nextSlide(); break;
        case 'ArrowLeft': e.preventDefault(); previousSlide(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, previousSlide, togglePresentationMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (intentLockedRef.current) {
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const atTop = scrollTop <= 1;
      const isDown = e.deltaY > 0;
      const isUp = e.deltaY < 0;

      if (!((isDown && atBottom) || (isUp && atTop))) {
        resetIntent();
        return;
      }

      e.preventDefault();
      const direction = isDown ? 'down' : 'up';

      if (intentDirectionRef.current && intentDirectionRef.current !== direction) {
        resetIntent();
      }

      intentDirectionRef.current = direction;
      intentProgressRef.current = Math.min(intentProgressRef.current + Math.min(Math.abs(e.deltaY) / 6, 10), 100);

      if (intentTimeoutRef.current) clearTimeout(intentTimeoutRef.current);
      intentTimeoutRef.current = window.setTimeout(resetIntent, 1000);

      if (intentProgressRef.current >= 100) {
        intentLockedRef.current = true;
        resetIntent();
        direction === 'down' ? nextSlide() : previousSlide();
        setTimeout(() => { intentLockedRef.current = false; }, 500);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [nextSlide, previousSlide, resetIntent, slides]);

  useEffect(() => {
    let rafId: number;
    const sync = () => {
      if (intentBarRef.current) {
        intentBarRef.current.style.strokeDashoffset = `${intentProgressRef.current - 100}`;
        intentBarRef.current.parentElement!.style.opacity = intentProgressRef.current > 0 ? '1' : '0';
      }
      rafId = requestAnimationFrame(sync);
    };
    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!currentSlide) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden cursor-none! group">
      <div className="absolute top-5 left-5 w-full z-50 bg-muted/30 flex items-center justify-end gap-4 px-10">
        <div className="relative size-14">
          <svg className="size-full -rotate-90 bg-white/80 p-2 rounded-xl" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" strokeWidth="2"></circle>
            <circle
              ref={intentBarRef}
              cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-600 dark:text-blue-500" strokeWidth="2"
              strokeDasharray="100" strokeDashoffset="0" strokeLinecap="round"></circle>
          </svg>
        </div>

        <div className=" flex gap-4 items-center bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg pointer-events-auto">
          <button onClick={previousSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="size-6 text-gray-700" />
          </button>
          <button onClick={nextSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="size-6 text-gray-700" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={toggleFullScreen} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isFullscreen ? <Minimize className="size-5 text-gray-700" /> : <Maximize className="size-5 text-gray-700" />}
          </button>
        </div>
      </div>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed w-8 h-8 border-2 bg-gradient-to-r to-blue-500 from-blue-800 rounded-full z-50 transition-transform duration-100 ease-out mix-blend-difference group-hover:scale-150"
      />

      <div className="flex-1 relative flex items-center justify-center">
        <div
          ref={scrollContainerRef}
          className="w-full h-screen overflow-y-auto"
          style={{
            backgroundColor: currentSlide.bgcolor || 'transparent',
            ...(currentSlide.layout === 'empty' && currentSlide.backgroundImage ? {
              backgroundImage: `url(${currentSlide.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {})
          }}
        >
          <div className="overflow-visible" ref={slideRef} >
            <SlideCard
              readOnly
              key={currentSlide.id}
              currentScale={currentScale}
              activeAnimate={true}
              isFullscreen={isFullscreen}
              slide={currentSlide}
              onUpdate={() => { }}
              onDelete={() => { }}
            />
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