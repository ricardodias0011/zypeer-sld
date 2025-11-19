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
    <div className='flex my-8'>
      <TailwindAdvancedEditor contentSlide={props.contentSlide} onUpdate={props?.onUpdate || (() => { })} slide={props} />
    </div>
  );
});

export default Textarea; 