import { cn } from '@/lib/utils';
import { AssetsService } from '@/services/assets';
import type { Slide, SlideContentType } from '@/stores/slideStore';
import {
  Crop,
  ImageIcon,
  Maximize,
  Replace,
  Scale,
  Shrink,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SlideCardProps {
  slide: Slide;
  onUpdate: (d: string, field: keyof Slide, value: any) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  slideContent: SlideContentType
}

interface ImageToolbarProps {
  onGenerateAI: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReplace: (e: React.MouseEvent) => void;
  onAdjust: (e: React.MouseEvent) => void;
}

interface ImagePreviewProps {
  slide: Slide;
  ht: string;
}

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  return (
    <div className="group relative flex">
      {children}
      <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {content}
      </span>
    </div>
  );
};

const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={22} />
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

const GenerateAIModal: React.FC<{
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState(
    'Um gato fofo usando um chapéu de bruxa'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onGenerate(prompt);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600">
        Descreva a imagem que você gostaria de gerar.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex min-w-[110px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Gerar'
          )}
        </button>
      </div>
    </div>
  );
};


const ReplaceModal: React.FC<{
  onClose: () => void;
  onReplace: (file: File) => void;
  isLoading: boolean;
}> = ({ onClose, onReplace, isLoading }) => {

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (file) {
      onReplace(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : ''
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
        <Upload size={40} className="mb-2 text-gray-400" />
        <p className="text-gray-500">
          Arraste e solte uma imagem aqui, ou clique para selecionar
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP (max 5MB)</p>
      </div>
      {file && (
        <p className="text-center text-sm text-gray-700">
          Arquivo selecionado: <span className="font-medium">{file.name}</span>
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Substituir'
          )}
        </button>
      </div>
    </div>
  );
};

const AdjustModal: React.FC<{
  onClose: () => void;
  currentFit: Slide['imageFit'];
  onAdjust: (fit: Slide['imageFit']) => void;
}> = ({ onClose, currentFit, onAdjust }) => {
  const [fit, setFit] = useState(currentFit || 'cover');

  const options: {
    value: Slide['imageFit'];
    label: string;
    icon: React.ElementType;
  }[] = [
      { value: 'cover', label: 'Preencher', icon: Crop },
      { value: 'contain', label: 'Ajustar', icon: Maximize },
      { value: 'fill', label: 'Esticar', icon: Scale },
    ];

  const handleSave = () => {
    onAdjust(fit);
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600">
        Selecione como a imagem deve se ajustar ao espaço.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            // @ts-ignore
            onClick={() => setFit(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
              fit === option.value
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <option.icon size={24} />
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{
  onClose: () => void;
  onDelete: () => void;
}> = ({ onClose, onDelete }) => {
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600">
        Tem certeza de que deseja excluir esta imagem? Esta ação não pode ser
        desfeita.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};


export const ImageCard: React.FC<SlideCardProps> = ({
  slide,
  onUpdate,
  onDelete,
  readOnly,
  slideContent
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<
    'generate' | 'replace' | 'adjust' | 'delete' | null
  >(null);

  const ht = ['top', 'bottom'].includes(slide?.layout) ? 'h-1/2' : 'h-full';

  const handleGenerateAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('generate');
  };
  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('delete');
  };
  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('replace');
  };
  const handleAdjust = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('adjust');
  };


  const handleGenerateImageAction = (prompt: string) => {
    console.log(slide.content)
    onUpdate(slide.id, 'content', [
      ...slide.content.filter(a => a.id !== slideContent.id),
      {
        ...slideContent,
        image: {
          url: `https://placehold.co/600x400/random/white?text=IA:${prompt.substring(
            0,
            10
          )}`
        }
      }
    ]);
  };

  const handleReplaceImageAction = async (file: File) => {
    setIsLoading(true);
    try {
      if (!file) return;
      const { data } = await AssetsService.upload(file, "assets")
      let link = data?.link || URL.createObjectURL(file);
      onUpdate(slide.id, 'content', [
        ...slide.content.filter(a => a.id !== slideContent.id),
        {
          ...slideContent,
          image: {
            imageFit: slideContent.image?.imageFit || 'contain',
            url: link
          }
        }
      ]);
    } catch (err) {
      console.log(err)
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleAdjustImageAction = (fit: Slide['imageFit']) => {
    console.log('Ajustando fit para:', fit);
    onUpdate(slide.id, 'content', [
      ...slide.content.filter(a => a.id !== slideContent.id),
      {
        ...slideContent,
        image: {
          imageFit: fit || 'contain',
          url: slideContent.image?.url || ''
        }
      }
    ]);
    onUpdate(slide.id, 'imageFit', fit);
  };

  const handleDeleteImageAction = () => {
    onDelete(slide.id);
  };

  const ImageToolbar = ({
    onGenerateAI,
    onDelete,
    onReplace,
    onAdjust,
  }: ImageToolbarProps) =>
    readOnly ? (
      <div></div>
    ) : (
      <div className="absolute bottom-2 right-1/2 z-40 flex items-center gap-4 rounded-lg bg-white p-2 shadow-md translate-x-1/2">
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
            <Shrink size={20} />
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

  const ImagePreview: React.FC<ImagePreviewProps> = ({ slide, ht }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    useEffect(() => {
      if (activeModal) {
        setIsToolbarVisible(false);
      }
      console.log('slideContent.image?.imageFit: ', slideContent.image?.imageFit)
    }, [activeModal]);

    return (
      <div
        className={cn(
          'relative flex-1 cursor-pointer sm:mt-0 w-full flex items-center justify-center',
          slideContent.image?.imageFit === 'contain' ? 'p-[1.5em] background-blur-contain max-h-96' :
            slideContent.image?.imageFit === 'cover' ? 'p-6' : '',
          ht,
          slide.layout === 'full' ? 'absolute opacity-35' : '',
          (isToolbarVisible && !readOnly) ? 'border-4 border-blue-400' : '',
        )}
        style={{
          '--image-url': slideContent.image?.imageFit === 'contain'
            ? `url(${slideContent.image?.url})`
            : 'none',
        }}
        onClick={() => setIsToolbarVisible((prev) => !prev)}
      >
        {!readOnly && isToolbarVisible && (
          <ImageToolbar
            onGenerateAI={handleGenerateAI}
            onDelete={handleDeleteImage}
            onReplace={handleReplace}
            onAdjust={handleAdjust}
          />
        )}
        {slideContent.image?.url ? (
          <img
            src={slideContent.image?.url}
            alt="Preview"
            className={cn(
              'h-full min-h-60 w-full bg-gray-100 text-gray-600 flex items-center justify-center',
              slideContent.image?.imageFit === 'contain'
                ? 'object-contain max-w-80 rounded-lg'
                : slideContent.image?.imageFit === 'fill'
                  ? 'object-fill'
                  : 'object-cover'
            )}
            onError={(e) => (e.currentTarget.src = '')}
          />
        ) : (
          <div
            className={cn(
              'h-full min-h-60 w-full bg-gray-100 text-gray-600 flex items-center justify-center',
              slideContent.image?.imageFit === 'contain'
                ? 'object-contain max-w-80'
                : slideContent.image?.imageFit === 'fill'
                  ? 'object-fill'
                  : 'object-cover'
            )}
          >
            <ImageIcon size={40} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ImagePreview slide={slide} ht={ht} />
      {activeModal === 'generate' && (
        <Modal
          title="Gerar Imagem com IA"
          onClose={() => setActiveModal(null)}
        >
          <GenerateAIModal
            onClose={() => setActiveModal(null)}
            onGenerate={handleGenerateImageAction}
          />
        </Modal>
      )}
      {activeModal === 'replace' && (
        <Modal title="Substituir Imagem" onClose={() => setActiveModal(null)}>
          <ReplaceModal
            onClose={() => setActiveModal(null)}
            onReplace={handleReplaceImageAction}
            isLoading={isLoading}
          />
        </Modal>
      )}
      {activeModal === 'adjust' && (
        <Modal title="Ajustar Imagem" onClose={() => setActiveModal(null)}>
          <AdjustModal
            onClose={() => setActiveModal(null)}
            currentFit={slide.imageFit}
            onAdjust={handleAdjustImageAction}
          />
        </Modal>
      )}
      {activeModal === 'delete' && (
        <Modal title="Excluir Imagem" onClose={() => setActiveModal(null)}>
          <DeleteModal
            onClose={() => setActiveModal(null)}
            onDelete={handleDeleteImageAction}
          />
        </Modal>
      )}
    </>
  );
};
