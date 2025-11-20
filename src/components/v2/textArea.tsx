import TailwindAdvancedEditor from '@/components/v2';
import type { Slide, SlideContentType } from '@/stores/slideStore';
import React from 'react';
interface SlideEditor extends Slide {
  readOnly?: boolean;
  onUpdate?: (d: string, field: keyof Slide, value: SlideContentType[]) => void;
  contentSlide?: SlideContentType;
}

const Textarea: React.FC<SlideEditor> = React.memo((props) => {
  return (
    <div className='flex my-4'>
      <TailwindAdvancedEditor contentSlide={props.contentSlide} onUpdate={props?.onUpdate || (() => { })} slide={props} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Retorna true se as props são iguais (não precisa re-renderizar)
  return (
    prevProps.id === nextProps.id &&
    prevProps.contentSlide?.id === nextProps.contentSlide?.id &&
    prevProps.contentSlide?.text === nextProps.contentSlide?.text &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.bgcolor === nextProps.bgcolor &&
    prevProps.layout === nextProps.layout &&
    prevProps.type === nextProps.type
  );
});

export default Textarea; 