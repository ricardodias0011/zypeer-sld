import TailwindAdvancedEditor from '@/components/v2';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import { cn, isMobile } from '@/lib/utils';
import { useSlideStore } from '@/stores/slideStore';
import type { LayoutType } from '@/types/slide-v2';
import { Tooltip } from '@radix-ui/themes';
import { FileText, Image as ImageIcon, Palette, Replace, Scale, Sparkles, Trash2, Type } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import StylePopover from './settingsPanel';

export type SlideType = 'title' | 'content' | 'imageWithText';

export interface Slide {
  id: string;
  type: SlideType;
  layout: LayoutType;
  title: string;
  content: string;
  imageUrl: string;
  bgcolor: string;
}

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
}

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface ImagePreviewProps {
  slide: Slide;
  ht: string;
}

interface ImageToolbarProps {
  onGenerateAI: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReplace: (e: React.MouseEvent) => void;
  onAdjust: (e: React.MouseEvent) => void;
}

interface ImageWithTextSlideProps {
  slide: Slide;
  isVertical: boolean;
  mobile: boolean;
  ht: string;
  TextareaComponent: React.ComponentType<TextareaProps>; // Passando o componente Textarea
}

const SlideCard: React.FC<SlideCardProps> = ({ slide, onUpdate, onDelete }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const mobile = isMobile();

  const ht = ['top', 'bottom'].includes(slide.layout) ? 'h-1/2' : 'h-full';

  const isVertical = ['top', 'bottom'].includes(slide.layout);

  const ImageToolbar = ({ onGenerateAI, onDelete, onReplace, onAdjust }: ImageToolbarProps) => (
    <div className="absolute bottom-2 right-1/2 z-40 flex! items-center gap-4 rounded-lg bg-white p-2 shadow-md translate-x-1/2">
      <Tooltip content="Gerar outra imagem com IA">
        <button
          onClick={onGenerateAI}
          className="rounded p-1.5 text-gray-700 hover:bg-gray-100"
        >
          <Sparkles size={20} />
        </button>
      </Tooltip>
      <Tooltip content="Substituir">
        <button
          onClick={onReplace}
          className="rounded p-1.5 text-gray-700 hover:bg-gray-100"
        >
          <Replace size={20} />
        </button>
      </Tooltip>
      <Tooltip content="Ajustar tamanho">
        <button
          onClick={onAdjust}
          className="rounded p-1.5 text-gray-700 hover:bg-gray-100"
        >
          <Scale size={20} />
        </button>
      </Tooltip>
      <Tooltip content="Excluir imagem">
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={20} />
        </button>
      </Tooltip>
    </div>
  );

  // Componente de Preview da Imagem (com a lógica da barra)
  const ImagePreview: React.FC<ImagePreviewProps> = ({ slide, ht }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);

    // Funções de placeholder
    const handleGenerateAI = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Gerar IA');
    };
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Excluir');
    };
    const handleReplace = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Substituir');
    };
    const handleAdjust = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('Ajustar');
    };

    return (
      <div
        className={cn(
          'relative mt-2 flex-1 cursor-pointer sm:mt-0 w-full',
          ht,
          slide.layout === 'full' ? 'absolute opacity-35' : '',
          isToolbarVisible ? 'border-4 border-blue-400' : ''
        )}
        onClick={() => setIsToolbarVisible((prev) => !prev)} // Alterna a visibilidade
      >
        {isToolbarVisible && (
          <ImageToolbar
            onGenerateAI={handleGenerateAI}
            onDelete={handleDelete}
            onReplace={handleReplace}
            onAdjust={handleAdjust}
          />
        )}
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt="Preview"
            className="object-cover h-full w-full bg-gray-100"
            onError={(e) => (e.currentTarget.src = '')}
          />
        ) : (
          <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-500">
            <ImageIcon size={40} />
          </div>
        )}
      </div>
    );
  };

  // Componente extraído para 'imageWithText'
  const ImageWithTextSlide: React.FC<ImageWithTextSlideProps> = ({
    slide,
    isVertical,
    mobile,
    ht,
    TextareaComponent,
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
              : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex-1 p-6 z-30 w-full',
          ht
          // slide.layout === 'full' ? 'absolute' : ''
        )}
      >
        <Textarea {...slide} />
      </div>
      {slide.layout !== 'empty' ? <ImagePreview slide={slide} ht={ht} /> : null}
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
      className={cn("overflow-hidden rounded-xl mb-6 transition-all duration-300 hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500")}>
      <div className="">
        {renderInputs()}
      </div>
      <div className="border-t border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl relative">
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
      </div>
    </div>
  );
};

interface AddSlideToolbarProps {
  onAddSlide: (type: SlideType) => void;
}

const AddSlideToolbar: React.FC<AddSlideToolbarProps> = ({ onAddSlide }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
      <div className="max-w-3xl mx-auto p-4 flex justify-center items-center gap-3 sm:gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">Adicionar Card:</span>
        <button
          onClick={() => onAddSlide('title')}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all font-medium text-sm sm:text-base"
          title="Adicionar card de Título"
        >
          <Type size={16} /> <span className="hidden sm:inline">Título</span>
        </button>
        <button
          onClick={() => onAddSlide('content')}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all font-medium text-sm sm:text-base"
          title="Adicionar card de Conteúdo"
        >
          <FileText size={16} /> <span className="hidden sm:inline">Conteúdo</span>
        </button>
        <button
          onClick={() => onAddSlide('imageWithText')}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-all font-medium text-sm sm:text-base"
          title="Adicionar card de Imagem"
        >
          <ImageIcon size={16} /> <span className="hidden sm:inline">Imagem</span>
        </button>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  // const [slides, setSlides] = useState<Slide[]>([]);
  const { slides, addCard } = useSlideStore();

  const handleAddSlide = (type: SlideType) => {
  };

  const handleDeleteSlide = (id: string) => {

  };

  const handleUpdateSlide = (id: string, field: keyof Slide, value: string) => {

  };

  useEffect(() => {
    addCard(slides?.[0].id, 'imageWithText')
  }, [])


  return (
    <div className='w-6xl'>
      {slides?.[0].cards.map((slide, index) => (
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

export default App;