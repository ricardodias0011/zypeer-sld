import Textarea from '@/components/v2/textArea';
import { Button } from '@/components/v2/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import { cn, isMobile } from '@/lib/utils';
import { useSlideStore, type Slide, type SlideContentType } from '@/stores/slideStore';
import { Image, Palette, Plus, Text, Trash2 } from 'lucide-react';
import React, { memo, useState } from 'react';
import { v4 } from 'uuid';
import { ImageCard } from './image';
import StylePopover from './settingsPanel';

export type SlideType = 'title' | 'content' | 'imageWithText';
interface SlideEditor extends Slide {
  readOnly?: boolean;
  onUpdate?: (d: string, field: keyof Slide, value: SlideContentType[]) => void;
  contentSlide?: SlideContentType;
}

interface SlideCardProps {
  slide: SlideEditor;
  onUpdate: (d: string, field: keyof Slide, value: SlideContentType[] | string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  addText: (slide: SlideEditor) => void;
  addImage: (slide: SlideEditor) => void;
}


interface ImageWithTextSlideProps {
  slide: Slide;
  isVertical: boolean;
  mobile: boolean;
  ht: string;
  readOnly?: boolean;
}

export const SlideCard = memo(({ slide, onUpdate, onDelete, readOnly, addText, addImage }: SlideCardProps) => {
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
  }) => {
    console.log(slide);
    return (
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
            ht,
            slide.type === 'Quote' ? 'border-l-4 border-primary' : 'border-l-4 border-primary'
          )}
        >
          {
            slide.content?.filter(a => a.type === 'text').map((t) => (
              <Textarea {...slide} contentSlide={t as SlideContentType} readOnly={readOnly} onUpdate={onUpdate} />
            ))
          }
        </div>
        {
          slide.content?.filter(a => a.type === 'image').map((t) => (
            <ImageCard slide={slide} slideContent={t} onDelete={() => { }} onUpdate={onUpdate} />
          ))
        }
        {/* {slide.layout !== 'empty' ? <ImageCard slide={slide} onDelete={() => { }} onUpdate={onUpdate} /> : null} */}
      </div>
    )
  };
  const RenderInputs = memo(() => {
    switch (slide.type) {
      case 'title':
      case 'content':
        return (
          <div className="p-6">
            {
              slide.content?.filter(a => a.type === 'text').map((t) => (
                <Textarea {...slide} contentSlide={t as SlideContentType} readOnly={readOnly} onUpdate={onUpdate} />
              ))
            }
          </div>
        );
      case 'Quote':
        return (
          <ImageWithTextSlide
            slide={slide}
            isVertical={isVertical}
            mobile={mobile}
            ht={ht}
            readOnly={readOnly}
          />
        );
      case 'imageWithText':
        return (
          <ImageWithTextSlide
            slide={slide}
            isVertical={isVertical}
            mobile={mobile}
            ht={ht}
            readOnly={readOnly}
          />
        );

      default:
        return null;
    }
  });

  return (
    <div
      style={{
        backgroundColor: slide.bgcolor
      }}
      className={cn(readOnly ? 'h-full' : '', "overflow-hidden rounded-xl mb-6 transition-all duration-300 hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500")}>
      <div className={readOnly ? 'h-full' : ''}>
        <RenderInputs />
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
          <Popover>
            <PopoverTrigger>
              <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-1 -ml-1 rounded"
              >
                <Plus size={22} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => addText(slide)}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Text className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-medium">Texto</span>
                </Button>
                <Button
                  onClick={() => addImage(slide)}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">Imagem</span>
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <span className="text-emerald-600 text-xl leading-none">“</span>
                  <span className="text-gray-700 font-medium">Citação</span>
                </Button>

                <Button
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <div className="w-5 h-5 text-orange-600 grid grid-cols-2 gap-0.5">
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                  </div>
                  <span className="text-gray-700 font-medium">Colunas</span>
                </Button>

              </div>
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
  const { slides, updateSlide, deleteSlide, addSlide } = useSlideStore();


  const handleDeleteSlide = (id: string) => {
    deleteSlide(id);
  };

  const handleUpdateSlide = React.useCallback(
    (id: string, field: keyof Slide, value: SlideContentType[] | string) => {
      updateSlide(id, {
        [field]: value,
      });
    },
    [updateSlide]
  );

  const addText = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        content: [
          ...slide.content,
          {
            type: 'text',
            text: 'Novo texto',
            id: v4().slice(0, 10),
          },
        ],
      });
    },
    [updateSlide]
  );

  const addImage = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        type: 'imageWithText',
        content: [
          ...slide.content,
          {
            type: 'image',
            text: '',
            id: v4().slice(0, 10),
          },
        ],
      });
    },
    [updateSlide]
  );

  return (
    <div className='w-6xl'>
      {slides?.map((slide, _index) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          onUpdate={handleUpdateSlide}
          onDelete={handleDeleteSlide}
          addText={addText}
          addImage={addImage}
        />
      ))}
      {/* <AddSlideToolbar onAddSlide={handleAddSlide} /> */}
    </div>
  );
};

export default memo(App);