import { cn } from '@/lib/utils';
import type { LayoutType } from '@/types/slide-v2';
import React, { useState } from 'react';
// Importação do color picker e seu tipo
import { ChromePicker as Chrome } from 'react-color';
import { LuBan, LuChevronDown, LuImage, LuPalette } from 'react-icons/lu';

type SettingsPanelProps = {
  initialColor?: string;
  onChangeLayout: (value: LayoutType) => void;
  layout: LayoutType;
  // Corrigido o tipo da prop para string
  onChangeBgColor: (value: string) => void;
};

const layouts = [
  { id: 'empty', type: 'empty' },
  { id: 'half-left', type: 'half-left' },
  { id: 'half-right', type: 'half-right' },
  { id: 'full', type: 'full' },
  { id: 'top', type: 'top' },
  { id: 'bottom', type: 'bottom' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialColor = '#201E25',
  onChangeLayout,
  layout,
  // Adicionada a prop na desestruturação
  onChangeBgColor,
}) => {
  // Corrigido para incluir o setter do estado
  const [cardColor, setCardColor] = useState<string>(initialColor);

  // Função para lidar com a mudança de cor
  const handleColorChange = (newColor: any) => {
    const newHex = newColor.hex;
    setCardColor(newHex); // Atualiza o estado local
    onChangeBgColor(newHex); // Notifica o componente pai
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between gap-2">
        {layouts.map((_layout) => {
          const isSelected = layout === _layout.id;

          const iconBoxBase = 'w-6 h-4 rounded-sm border flex overflow-hidden';
          const iconBorder = isSelected ? 'border-blue-600' : 'border-gray-400';
          const iconFill = isSelected ? 'bg-blue-600' : 'bg-gray-400';

          const typeRight = _layout.id.includes('right') ? 'flex-row-reverse' : '';

          const buttonBase =
            'p-2! border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
          const buttonState = isSelected
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 bg-white hover:bg-gray-50';

          return (
            <button
              key={_layout.id}
              className={cn(buttonBase, buttonState)}
              onClick={() => onChangeLayout(_layout.id as LayoutType)} // Ajuste de tipo
            >
              <div className={`${iconBoxBase} ${iconBorder} ${typeRight}`}>
                {_layout.type === 'top' && (
                  <div className={`h-1/2 w-full ${iconFill}`}></div>
                )}
                {_layout.type === 'half-left' && (
                  <div className={`w-1/2 ${iconFill}`}></div>
                )}
                {_layout.type === 'full' && (
                  <div className={`w-full ${iconFill}`}></div>
                )}
                {_layout.type === 'half-right' && (
                  <div className={`w-1/2 ${iconFill}`}></div>
                )}
                {_layout.type === 'bottom' && (
                  <div className={`h-1/2 mt-2 w-full ${iconFill}`}></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800">
          <LuImage className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Imagem de destaque</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-blue-600! hover:underline text-sm font-semibold">
            Editar
          </button>
          <LuBan className="w-4 h-4 text-red-500" />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800">
          <LuPalette className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Cor do cartão</span>
        </div>
        <button className="flex items-center gap-2! py-1.5 px-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm">
          <div
            className="w-5 h-5 rounded-full border border-gray-200"
            style={{ backgroundColor: cardColor }}
          ></div>
          <span className="font-mono text-gray-900 font-medium">
            {cardColor.toUpperCase()}
          </span>
          <LuChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Picker de cor agora está conectado */}
      <Chrome
        color={cardColor}
        onChange={handleColorChange}
        className="custom-chrome-picker"
        disableAlpha={true} // 'showAlpha={false}' está depreciado, use 'disableAlpha={true}'
      // showHue={false} // Descomente se não quiser o slider de Matiz
      // showEditableInput={false} // Descomente para esconder inputs
      // showColorPreview={false} // Descomente para esconder a preview
      />
    </div>
  );
};

export default SettingsPanel;