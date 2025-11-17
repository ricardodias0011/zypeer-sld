import TailwindAdvancedEditor from '@/components/v2';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import { cn, isMobile } from '@/lib/utils';
import { useSlideStore, type Slide } from '@/stores/slideStore';
import { Palette, Trash2 } from 'lucide-react';
import React, { memo, useState } from 'react';
import { ImageCard } from './image';
import StylePopover from './settingsPanel';

export type SlideType = 'title' | 'content' | 'imageWithText';

const Textarea: React.FC<Slide> = (props) => {
  return (
    <div className='flex my-8'>
      <TailwindAdvancedEditor slide={props} />
    </div>
  );
};

interface SlideCardProps {
  slide: Slide;
  onUpdate: (id: string, field: keyof Slide, value: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}


interface ImageWithTextSlideProps {
  slide: Slide;
  isVertical: boolean;
  mobile: boolean;
  ht: string;
  readOnly?: ConstrainBooleanParameters;
}

export const SlideCard = memo(({ slide, onUpdate, onDelete, readOnly }: SlideCardProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const mobile = isMobile();

  const ht = ['top', 'bottom'].includes(slide?.layout) ? 'h-1/2' : 'h-full';

  const isVertical = ['top', 'bottom'].includes(slide?.layout);

  const ImageWithTextSlide: React.FC<ImageWithTextSlideProps> = ({
    slide,
    isVertical,
    mobile,
    ht,
    readOnly
  }) => (
    <div
      style={{
        gridTemplate: '"body accent" minmax(24em, auto) / 62.5% 37.5%',
      }}
      className={cn(
        !isVertical ? 'grid' : 'flex',
        'gap-4 relative min-h-[25rem]',
        mobile
          ? 'flex-col sm:flex-row'
          : isVertical
            ? `${slide.layout === 'bottom' ? 'flex-col' : 'flex-col-reverse'} max-h-96`
            : slide.layout.includes('left')
              ? 'flex-row-reverse'
              : 'flex-row',
        readOnly ? 'h-full' : '',
      )}
    >
      <div
        className={cn(
          'flex-1 p-6 z-30 w-full',
          ht
          // slide.layout === 'full' ? 'absolute' : ''
        )}
      >
        <Textarea {...slide} readOnly={readOnly} />
      </div>
      {slide.layout !== 'empty' ? <ImageCard slide={slide} onDelete={() => { }} onUpdate={onUpdate} ht={ht} /> : null}
    </div>
  );

  // Sua função principal, agora mais limpa
  const renderInputs = () => {
    switch (slide.type) {
      // 1. Casos 'title' e 'content' combinados
      case 'title':
      case 'content':
        return (
          <div className="p-6">
            <Textarea {...slide} />
          </div>
        );

      // 2. 'imageWithText' usa seu próprio componente
      case 'imageWithText':
        return (
          <ImageWithTextSlide
            slide={slide}
            isVertical={isVertical}
            mobile={mobile}
            ht={ht}
            readOnly={readOnly}
            TextareaComponent={Textarea}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: slide.bgcolor
      }}
      className={cn(readOnly ? 'h-full' : '', "overflow-hidden rounded-xl mb-6 transition-all duration-300 hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500")}>
      <div className={readOnly ? 'h-full' : ''}>
        {renderInputs()}
      </div>
      {readOnly ? null : <div className="border-t border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl relative">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger>
              <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-1 -ml-1 rounded"
              >
                <Palette size={22} />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <StylePopover
                onChangeBgColor={e => {
                  onUpdate(slide.id, 'bgcolor', e)
                }}
                layout={slide.layout}
                onChangeLayout={e => {
                  onUpdate(slide.id, 'layout', e)
                }}
                initialColor={slide.bgcolor}
              // currentType={slide.type}
              // onClose={() => setIsPopoverOpen(false)}
              // onTypeChange={(newType) => {
              //   onUpdate(slide.id, 'type', newType);
              //   setIsPopoverOpen(false);
              // }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* {isPopoverOpen && (
          
        )} */}
        <button
          onClick={() => onDelete(slide.id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
          title="Excluir Card"
        >
          <Trash2 size={18} />
        </button>
      </div>}
    </div>
  );
});


const App: React.FC = () => {
  // const [slides, setSlides] = useState<Slide[]>([]);
  const { slides, addSlide } = useSlideStore();

  const handleAddSlide = (type: SlideType) => {
  };

  const handleDeleteSlide = (id: string) => {

  };

  const handleUpdateSlide = (id: string, field: keyof Slide, value: string) => {

  };

  return (
    <div className='w-6xl'>
      {slides?.map((slide, index) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          onUpdate={handleUpdateSlide}
          onDelete={handleDeleteSlide}
        />
      ))}
      {/* <AddSlideToolbar onAddSlide={handleAddSlide} /> */}
    </div>
  );
};

export default memo(App);