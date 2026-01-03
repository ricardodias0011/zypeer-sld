import { Button } from '@/components/v2/ui/button';
import { cn, isDesktop } from '@/lib/utils';
import { AssetsService } from '@/services/assets';
import { EventsService } from '@/services/events';
import { ToolsService } from '@/services/tools';
import type { Slide, SlideContentType, TypeImageContent } from '@/stores/slideStore';
import { Tooltip } from '@radix-ui/themes';
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
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiMagicWand } from 'react-icons/pi';
import { TfiLayoutMediaCenter, TfiLayoutMediaLeft, TfiLayoutMediaRight } from 'react-icons/tfi';
import { toast } from 'sonner';

interface SlideCardProps {
  slide: Slide;
  onUpdate: (d: string, field: keyof Slide, value: any) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  slideContent: SlideContentType,
  isColumn?: boolean;
  contentId?: string;
  columnId?: string;
  content: SlideContentType[];
  direction?: 'right' | 'left';
  imageIFit?: 'cover' | 'contain' | 'fill';
  imagePostion?: TypeImageContent['position'];
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
  slideContent: SlideContentType;
  readOnly?: boolean;
  activeModal: 'generate' | 'replace' | 'adjust' | 'delete' | null;
  onGenerateAI: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onReplace: (e: React.MouseEvent) => void;
  onAdjust: (e: React.MouseEvent) => void;
  onGenerate: (e: string) => void;
}

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
    <div className="inset-0 bg-[#00000099] data-[state=open]:animate-overlayShow w-screen h-screen top-0 fixed z-[60] flex items-center justify-center backdrop-blur-sm">
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

  const [eventId, setEventId] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsLoading(true);
    ToolsService.generateImage(prompt).then(res => {
      if (res?.data?.id) {
        setEventId(res.data.id)
      }
    })
      .catch(() => {
        setIsLoading(false);
        toast.error("Não foi possível gerar imagem.");
      })
  }

  useEffect(() => {
    if (eventId) {
      const interval = setInterval(() => {
        EventsService.consult("generate-image", eventId ?? "")
          .then(({ data }) => {
            if (data?.status) {
              if (data.status === 0) {
                clearInterval(interval);
                toast.error("Não foi possível gerar imagem.")
                setIsLoading(false);
                return
              }
              if (data.status === 4 && data.metadata?.[0].id) {
                ToolsService.findMaterial(data.metadata?.[0].id)
                  .then((response) => {
                    setEventId(null);
                    if (response?.data?.content) {
                      onGenerate(response.data.content as string);
                      setIsLoading(false);
                    }
                    clearInterval(interval);
                  })
              }
            }
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message ?? "Não foi possível gerar imagem");
            setIsLoading(false);
          })
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [eventId]);


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
  currentPosition: TypeImageContent['position'];
  onAdjust: (fit: Slide['imageFit'], position: TypeImageContent['position']) => void;
}> = ({ onClose, currentFit, onAdjust, currentPosition }) => {
  const [fit, setFit] = useState(currentFit || 'cover');
  const [position, setPosition] = useState(currentPosition || 'center');

  const options: {
    value: Slide['imageFit'];
    label: string;
    icon: React.ElementType;
  }[] = [
      { value: 'cover', label: 'Preencher', icon: Crop },
      { value: 'contain', label: 'Ajustar', icon: Maximize },
      { value: 'fill', label: 'Esticar', icon: Scale },
    ];

  const positionOptions: {
    value: TypeImageContent['position'];
    label: string;
    icon: React.ElementType;
  }[] = [
      { value: 'center', label: 'Centro', icon: TfiLayoutMediaCenter },
      { value: 'left', label: 'Esquerda', icon: TfiLayoutMediaLeft },
      { value: 'right', label: 'Direita', icon: TfiLayoutMediaRight },
    ];

  const handleSave = () => {
    onAdjust(fit, position);
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
      {/* <div className="grid grid-cols-3 gap-3">
        {positionOptions.map((option) => (
          <button
            key={option.value}
            // @ts-ignore
            onClick={() => setPosition(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
              position === option.value
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <option.icon size={24} />
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div> */}
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


export const ImageCard: React.FC<SlideCardProps> = memo(({
  slide,
  onUpdate,
  onDelete,
  readOnly,
  slideContent,
  isColumn,
  contentId,
  columnId,
  direction,
  imageIFit,
  imagePostion
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<
    'generate' | 'replace' | 'adjust' | 'delete' | null
  >(null);

  const ht = useMemo(() => ['top', 'bottom'].includes(slide?.layout) ? 'h-1/2' : 'h-full', [slide?.layout]);

  const handleGenerateAI = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('generate');
  }, []);

  const handleDeleteImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('delete');
  }, []);

  const handleReplace = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('replace');
  }, []);

  const handleAdjust = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModal('adjust');
  }, []);

  const handleGenerateImageAction = useCallback((link: string) => {
    const currentContent = slide.content.find(a => a.id === contentId)
    const currentColunm = isColumn ? currentContent?.columns?.find(e => e.id === columnId) : null;
    onUpdate(slide.id, 'content', [
      ...slide.content.filter(a => a.id !== contentId),
      {
        ...currentContent,
        ...(isColumn ? {
          columns: [...currentContent?.columns?.filter(a => a.id !== columnId) || [], {
            id: columnId,
            type: 'image',
            items: [
              ...(currentColunm?.items ?? []).filter((a: any) => a.id !== slideContent.id),
              {
                id: slideContent.id,
                "type": "image",
                image: {
                  url: link,
                  imageFit: imageIFit || 'contain',
                  position: imagePostion || 'center'
                },
              }
            ],
            direction: direction || '',
          }]
        } : {
          ...currentContent,
          image: {
            imageFit: slideContent.image?.imageFit || 'cover',
            url: link,
            position: imagePostion || 'center'
          }
        }),
      }
    ]);
  }, [slide.id, slide.content, slideContent, onUpdate]);

  const handleReplaceImageAction = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const currentContent = slide.content.find(a => a.id === contentId)
      const currentColunm = isColumn ? currentContent?.columns?.find(e => e.id === columnId) : null;

      if (!file) return;
      const { data } = await AssetsService.upload(file, "assets");

      let link = data?.link || URL.createObjectURL(file);
      onUpdate(slide.id, 'content', [
        ...slide.content.filter(a => a.id !== contentId),
        {
          ...currentContent,
          ...(isColumn ? {
            columns: [...currentContent?.columns?.filter(a => a.id !== columnId) || [], {
              id: columnId,
              type: 'image',
              items: [
                ...(currentColunm?.items ?? []).filter((a: any) => a.id !== slideContent.id),
                {
                  id: slideContent.id,
                  "type": "image",
                  image: {
                    url: link,
                    imageFit: imageIFit || 'contain',
                    position: imagePostion || 'center'
                  },
                }
              ],
              direction: direction || '',
            }]
          } : {
            ...currentContent,
            image: {
              imageFit: slideContent.image?.imageFit || 'cover',
              url: link,
              position: imagePostion || 'center'
            }
          }),
        }
      ]);
    } catch (err) {
      console.error(err)
    }
    finally {
      setIsLoading(false);
    }
  }, [slide.id, slide.content, slideContent, onUpdate]);

  const handleAdjustImageAction = useCallback((value: Slide['imageFit'], position: TypeImageContent['position']) => {
    const currentSlide = slide.content.find(a => a.id === contentId)
    const currentColunm = isColumn ? currentSlide?.columns?.find(e => e.id === columnId) : null;
    if (isColumn) {
      onUpdate(slide.id, 'content', [
        ...slide.content.filter(a => a.id !== contentId),
        {
          ...currentSlide,
          columns: [...currentSlide?.columns?.filter(a => a.id !== columnId) || [], {
            id: columnId,
            type: 'image',
            items: [
              ...(currentColunm?.items ?? []).filter((a: any) => a.id !== slideContent.id),
              {
                id: slideContent.id,
                "type": "image",
                image: {
                  url: slideContent.image?.url,
                  position: position || 'center',
                  imageFit: value || 'contain'
                },
              }
            ],
            direction: direction || '',
          }]
        }
      ]);

      return
    }
    onUpdate(slide.id, 'content', [
      ...slide.content.filter(a => a.id !== slideContent.id),
      {
        ...slideContent,
        image: {
          position: position || 'center',
          imageFit: value || 'contain',
          url: slideContent.image?.url || ''
        }
      }
    ]);
  }, [slide.id, slide.content, slideContent, onUpdate]);

  const handleDeleteImageAction = useCallback(() => {
    onDelete(slide.id);
  }, [onDelete, slide.id]);

  const ImageToolbar = memo(({
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
    ));

  const ImagePreview: React.FC<ImagePreviewProps> = memo(({
    slide,
    ht,
    slideContent,
    readOnly,
    activeModal,
    onGenerateAI,
    onDelete,
    onReplace,
    onAdjust,
    onGenerate
  }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const [eventId, setEventId] = useState<string | null>(null);
    const [loadingGenerating, setLoadingGenerating] = useState(false);
    const [image, setImage] = useState("");

    const resetLoading = () => {
      setEventId(null);
      setLoadingGenerating(false);
    };

    const handleGenerate = (prompt: string) => {
      if (loadingGenerating && image) return;
      setLoadingGenerating(true);

      ToolsService.generateImage(prompt)
        .then(res => res?.data?.id ? setEventId(res.data.id) : setLoadingGenerating(false))
        .catch(() => {
          setLoadingGenerating(false);
          toast.error("Não foi possível gerar imagem.");
        });
    };

    useEffect(() => {
      if (!eventId) return;

      const interval = setInterval(() => {
        EventsService.consult("generate-image", eventId)
          .then(({ data }) => {
            if (!data?.status) return;

            if (data.status === 0) {
              clearInterval(interval);
              resetLoading();
              toast.error("Não foi possível gerar imagem.");
            }

            if (data.status === 4 && data.metadata?.[0]?.id) {
              clearInterval(interval);
              ToolsService.findMaterial(data.metadata[0].id)
                .then((res) => {
                  if (res?.data?.content) {
                    const content = res.data.content as string;
                    onGenerate(content);
                    setImage(content);
                  }
                })
                .finally(resetLoading);
            }
          })
          .catch((err) => {
            clearInterval(interval);
            resetLoading();
            toast.error(err?.response?.data?.message ?? "Erro ao consultar status");
          });
      }, 4000);

      return () => clearInterval(interval);
    }, [eventId, onGenerate]);

    useEffect(() => {
      if (activeModal) setIsToolbarVisible(false);
    }, [activeModal]);

    useEffect(() => {
      if (slideContent?.image?.url) setImage(slideContent.image.url)
    }, [slideContent.image])

    const imageFit = slideContent.image?.imageFit;
    const isContain = imageFit === 'contain';

    return (
      <div
        className={cn(
          'relative flex-1 cursor-pointer w-full flex items-center justify-center sm:mt-0',
          isContain ? 'p-[1.5em] background-blur-contain max-h-96' : imageFit === 'cover' ? 'p-6' : 'max-h-96',
          ht,
          slide.layout === 'full' && 'absolute opacity-35',
          isToolbarVisible && !readOnly && 'border-4 border-blue-400',
        )}
        style={{ '--image-url': isContain ? `url(${image})` : 'none' } as React.CSSProperties}
        onClick={() => {
          if (!isDesktop()) {
            toast.warning("Para editar compartilhe um link para você mesmo abrir no desktop.")
          }
          setIsToolbarVisible(prev => !prev);
        }}
      >
        {!readOnly && isToolbarVisible && (
          <ImageToolbar onGenerateAI={onGenerateAI} onDelete={onDelete} onReplace={onReplace} onAdjust={onAdjust} />
        )}

        {loadingGenerating ? (
          <div className="animate-pulse flex flex-col gap-4 w-full h-72">
            <div className="bg-gray-300 h-full w-full" />
          </div>
        ) : !image && slideContent.image?.prompt && !eventId && (!readOnly || !isDesktop()) ? (
          <div className="h-full min-h-[320px] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-slate-100/50">
            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
              <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 max-w-[200px]">
                Use nossa IA para criar algo incrível com base neste assunto.
              </p>
            </div>
            <Button
              onClick={() => handleGenerate(slideContent?.image?.prompt as string)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <PiMagicWand className="w-4 h-4 mr-2" />
              Gerar imagem com IA
            </Button>
          </div>
        ) : image ? (
          <img
            src={image}
            alt="Preview"
            className={cn(
              'h-full min-h-60 w-full bg-gray-100 text-gray-600 object-cover',
              isContain ? 'object-contain max-w-80 rounded-lg' : imageFit === 'fill' && 'object-fill max-h-80'
            )}
            onError={(e) => (e.currentTarget.src = '')}
          />
        ) : (
          <div className={cn(
            'h-full min-h-60 w-full bg-gray-100 text-gray-600 flex items-center justify-center',
            isContain ? 'object-contain max-w-80' : imageFit === 'fill' && 'object-fill'
          )}>
            <ImageIcon size={40} />
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.slide.id === nextProps.slide.id &&
      prevProps.slide.layout === nextProps.slide.layout &&
      prevProps.ht === nextProps.ht &&
      prevProps.slideContent.id === nextProps.slideContent.id &&
      prevProps.slideContent.image?.url === nextProps.slideContent.image?.url &&
      prevProps.slideContent.image?.imageFit === nextProps.slideContent.image?.imageFit &&
      prevProps.readOnly === nextProps.readOnly &&
      prevProps.activeModal === nextProps.activeModal
    );
  });

  const imageFit = slideContent.image?.imageFit;
  const imagePosition = slideContent.image?.position;

  return (
    <>
      <ImagePreview
        slide={slide}
        ht={ht}
        slideContent={slideContent}
        readOnly={readOnly}
        activeModal={activeModal}
        onGenerateAI={handleGenerateAI}
        onDelete={handleDeleteImage}
        onReplace={handleReplace}
        onAdjust={handleAdjust}
        onGenerate={handleGenerateImageAction}
      />
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
            currentPosition={imagePosition || 'center'}
            currentFit={imageFit || slide.imageFit}
            onAdjust={(a, b) => handleAdjustImageAction(a, b)}
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
}, (prevProps, nextProps) => {
  // Comparação personalizada para evitar re-renderizações desnecessárias
  return (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.slide.layout === nextProps.slide.layout &&
    prevProps.slide.imageFit === nextProps.slide.imageFit &&
    prevProps.slideContent.id === nextProps.slideContent.id &&
    prevProps.slideContent.image?.url === nextProps.slideContent.image?.url &&
    prevProps.slideContent.image?.imageFit === nextProps.slideContent.image?.imageFit &&
    prevProps.readOnly === nextProps.readOnly
  );
});
