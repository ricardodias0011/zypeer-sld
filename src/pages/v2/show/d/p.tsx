import { isDesktop } from '@/lib/utils';
import { useSlideStore, type Slide } from '@/stores/slideStore';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import useQuery from '@/hooks/useQuery';
import { SlideCard } from '../../slide';

export const PresentationViewDownloadItem = ({ slides }: { slides: Slide[] }) => {

  const { query } = useQuery();
  const indexItem = query.get("item")
  const {
    currentSlideId,
    setCurrentSlide,
    togglePresentationMode,
    nextSlide,
    previousSlide
  } = useSlideStore();

  const slideRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intentBarRef = useRef<SVGCircleElement>(null);

  const intentProgressRef = useRef(0);

  const [currentScale, setCurrentScale] = useState<number | null>(null);
  const [isFullscreen] = useState(false);

  const sortedCards = useMemo(() => [...slides].sort((a, b) => a.order - b.order), [slides]);

  const currentSlide = useMemo(() =>
    sortedCards.find(s => s.id === currentSlideId) || sortedCards[0],
    [sortedCards, currentSlideId]
  );

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
      if (Number(indexItem)) {
        setCurrentSlide(sortedCards[Number(indexItem)].id);
      } else {
        setCurrentSlide(sortedCards[0].id);
      }
    }
  }, [currentSlideId, sortedCards, setCurrentSlide]);

  useEffect(() => {
    if (Number(indexItem) && sortedCards.length > 0) {
      setCurrentSlide(sortedCards[Number(indexItem)].id);
    } else {
      if (slides?.length > 0) setCurrentSlide(slides[0].id);
    }
  }, [slides, indexItem])

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
      <div className='on-download' id="on-download" />
    </div>
  );
};