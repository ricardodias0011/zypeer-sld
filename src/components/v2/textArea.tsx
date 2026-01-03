import TailwindAdvancedEditor from '@/components/v2';
import type { Slide, SlideContentType } from '@/stores/slideStore';
import React from 'react';
import { toast } from 'sonner';
interface SlideEditor {
  readOnly?: boolean;
  onUpdate?: (d: string, field: keyof Slide, value: SlideContentType[]) => void;
  contentSlide?: SlideContentType;
  onDelete: (id: string) => void;
  slide: Slide;
}

const Textarea: React.FC<SlideEditor> = React.memo((props) => {
  return (
    <div className='flex my-1 relative'>
      {props.readOnly ?
        <div className='h-full w-full left-0 top-0 absolute z-50' onClick={() => {
          toast.warning("Para editar compartilhe um link para você mesmo abrir no desktop.")
        }} />
        : null}
      <TailwindAdvancedEditor onDelete={props.onDelete} contentSlide={props.contentSlide} onUpdate={props?.onUpdate || (() => { })} slide={props.slide} />
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps?.contentSlide?.id === nextProps?.contentSlide?.id &&
    nextProps.readOnly === nextProps.readOnly
  );
});

export default Textarea; 