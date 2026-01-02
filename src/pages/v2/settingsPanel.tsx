import { cn } from '@/lib/utils';
import type { LayoutType } from '@/types/slide-v2';
import React, { useEffect, useRef, useState } from 'react';
import { LuChevronDown, LuPalette, LuZap } from 'react-icons/lu';

type SettingsPanelProps = {
  initialColor?: string;
  onChangeLayout: (value: LayoutType) => void;
  layout: LayoutType;
  onChangeBgColor: (value: string) => void;
  onChangeAnimate: (value: string) => void;
  animate?: string;
};

const layouts = [
  { id: 'half-right', type: 'half-right' },
  { id: 'bottom', type: 'bottom' },
];

const animations = [
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'fade-right', label: 'Fade Right' },
  { id: 'fade-left', label: 'Fade Left' },
  { id: 'fade-up', label: 'Fade Up' }
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialColor = '#201E25',
  onChangeLayout,
  layout,
  onChangeBgColor,
  onChangeAnimate,
  animate
}) => {
  const [cardColor, setCardColor] = useState<string>(initialColor);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleColorChange = (newColor: string) => {
    setCardColor(newColor);
  };

  useEffect(() => {
    setCardColor(initialColor);
  }, [initialColor]);

  useEffect(() => {
    if (initialColor === cardColor) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChangeBgColor(cardColor);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cardColor, onChangeBgColor]);

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-2">
        {layouts.map((_layout) => {
          const isSelected = layout === _layout.id;
          const iconBoxBase = 'w-6 h-4 rounded-sm border flex overflow-hidden';
          const iconBorder = isSelected ? 'border-blue-400' : 'border-gray-300';
          const iconFill = isSelected ? 'bg-blue-400' : 'bg-gray-300';
          const typeRight = _layout.id.includes('right') ? 'flex-row-reverse' : '';
          const buttonBase = 'p-2! border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
          const buttonState = isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50';

          return (
            <button
              key={_layout.id}
              className={cn(buttonBase, buttonState)}
              onClick={() => onChangeLayout(_layout.id as LayoutType)}
            >
              <div className={`${iconBoxBase} ${iconBorder} ${typeRight}`}>
                {_layout.type === 'half-right' && <div className={`w-1/2 ${iconFill}`}></div>}
                {_layout.type === 'bottom' && <div className={`h-1/2 mt-2 w-full ${iconFill}`}></div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-800">
          <LuZap className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Animação</span>
        </div>
        <div className="relative">
          <select
            value={animate}
            onChange={(e) => onChangeAnimate(e.target.value)}
            className="w-full appearance-none py-2 px-3 text-gray-800 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {animations.map((anim) => (
              <option key={anim.id} value={anim.id} className='text-gray-800'>
                {anim.label}
              </option>
            ))}
          </select>
          <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-800">
          <LuPalette className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Cor do cartão</span>
        </div>
        <div className="flex items-center gap-2! py-1.5 px-2 border border-gray-300 rounded-lg bg-white text-sm">
          <input
            type="color"
            value={cardColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-10 h-8 rounded border cursor-pointer"
          />
          <span className="font-mono text-gray-900 font-medium flex-1">
            {cardColor.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;