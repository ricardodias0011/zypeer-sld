import { cn } from '@/lib/utils';
import { AssetsService } from '@/services/assets';
import type { LayoutType } from '@/types/slide-v2';
import { ImageUpscale } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { LuChevronDown, LuImage, LuPalette, LuX, LuZap } from 'react-icons/lu';
import { TfiLayoutMediaCenter, TfiLayoutMediaLeft, TfiLayoutMediaRight } from 'react-icons/tfi';
import { toast } from 'sonner';

type SettingsPanelProps = {
  initialColor?: string;
  onChangeLayout: (value: LayoutType) => void;
  layout: LayoutType;
  onChangeBgColor: (value: string) => void;
  onChangeAnimate: (value: string) => void;
  onChangeBackgroundImage: (value: string) => void;
  backgroundImage?: string;
  animate?: string;
};

const animations = [
  { id: 'fade-in', label: 'Fade In' },
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
  onChangeBackgroundImage,
  backgroundImage,
  animate
}) => {
  const [cardColor, setCardColor] = useState<string>(initialColor);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingUpload, setLoadingUpload] = useState(false);

  const positionOptions: {
    value: LayoutType;
    label: string;
    icon: React.ElementType;
  }[] = [
      { value: 'empty', label: 'Centro', icon: TfiLayoutMediaCenter },
      { value: 'half-left', label: 'Esquerda', icon: TfiLayoutMediaLeft },
      { value: 'half-right', label: 'Direita', icon: TfiLayoutMediaRight },
    ];

  const handleColorChange = (newColor: string) => {
    setCardColor(newColor);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoadingUpload(true);
        const { data } = await AssetsService.upload(file, "assets");
        let link = data?.link || URL.createObjectURL(file);
        onChangeBackgroundImage(link);
      }
      catch (e) {
        toast.error("Não foi possível carregar imagem.");
      }
      finally {
        setLoadingUpload(false);
      }

    }
  };

  useEffect(() => {
    setCardColor(initialColor);
  }, [initialColor]);

  useEffect(() => {
    if (initialColor === cardColor) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      onChangeBgColor(cardColor);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cardColor, onChangeBgColor]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-800">
          <LuImage className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Imagem de Fundo</span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={loadingUpload}
          accept="image/*"
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <button
            disabled={loadingUpload}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            {loadingUpload ? 'Carregando...' : backgroundImage ? 'Trocar Imagem' : 'Selecionar Imagem'}
          </button>
          {backgroundImage && (
            <button
              onClick={() => onChangeBackgroundImage('')}
              className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <LuX size={18} />
            </button>
          )}
        </div>
        {backgroundImage && (
          <div className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={backgroundImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-800">
          <ImageUpscale className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Posição da imagem de Fundo</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {positionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChangeLayout(option.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-2 transition-colors',
                layout === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              <option.icon size={20} />
              <span className="font-medium text-sm">{option.label}</span>
            </button>
          ))}
        </div>
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
        <div className="flex items-center gap-2 py-1.5 px-2 border border-gray-300 rounded-lg bg-white text-sm">
          <input
            type="color"
            value={cardColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-10 h-8 rounded border cursor-pointer"
          />
          <input
            value={cardColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="font-mono text-gray-900 font-medium flex-1 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;