import { Button } from '@/components/v2/ui/button';
import { cn } from '@/lib/utils';
import { useSlideStore } from '@/stores/slideStore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';

export const PresentationMode = () => {
  const {
    slides,
    currentSlideId,
    setCurrentSlide,
    togglePresentationMode,
    nextSlide,
    previousSlide
  } = useSlideStore();

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

  const sortedCards = [...currentSlide.cards].sort((a, b) => a.order - b.order);

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

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div
          className="w-full max-w-6xl rounded-lg p-12 min-h-[600px]"
          style={{
            backgroundColor: currentSlide.backgroundColor || 'transparent',
            backgroundImage: currentSlide.backgroundImage
              ? `url(${currentSlide.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {currentSlide.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={currentSlide.featuredImage}
                alt="Featured"
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="space-y-6">
            {sortedCards.map(card => {
              const widthClasses = {
                small: 'max-w-2xl',
                medium: 'max-w-4xl',
                large: 'max-w-6xl',
              };

              const alignmentClasses = {
                left: 'mr-auto',
                center: 'mx-auto',
                right: 'ml-auto',
              };

              return (
                <div
                  key={card.id}
                  className={cn(
                    'rounded-lg transition-all text-xl',
                    widthClasses[card.width],
                    alignmentClasses[card.alignment],
                    card.hasMargins && 'p-8'
                  )}
                  style={{
                    backgroundColor: card.backgroundColor,
                  }}
                >
                  {card.type === 'text' && (
                    <div className="text-foreground whitespace-pre-wrap">
                      {card.content}
                    </div>
                  )}

                  {card.type === 'image' && (
                    <div className="space-y-4">
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt="Content"
                          className="w-full rounded-lg"
                        />
                      )}
                      {card.content && (
                        <div className="text-foreground whitespace-pre-wrap">
                          {card.content}
                        </div>
                      )}
                    </div>
                  )}

                  {card.type === 'list' && (
                    <div className="text-foreground whitespace-pre-wrap">
                      {card.content}
                    </div>
                  )}

                  {card.type === 'split' && (
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-foreground whitespace-pre-wrap">
                        {card.content}
                      </div>
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt="Split content"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-panel/80 backdrop-blur">
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
