import TailwindAdvancedEditor from '@/components/v2';
import type { Slide, SlideContentType } from '@/stores/slideStore';
import React from 'react';
interface SlideEditor {
  readOnly?: boolean;
  onUpdate?: (d: string, field: keyof Slide, value: SlideContentType[]) => void;
  contentSlide?: SlideContentType;
  onDelete: (id: string) => void;
  slide: Slide;
}

const Textarea: React.FC<SlideEditor> = React.memo((props) => {
  return (
    <div className='flex my-2'>
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