import Textarea from '@/components/v2/textArea';
import { Button } from '@/components/v2/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/v2/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import { cn, isMobile } from '@/lib/utils';
import { PresentationsService } from '@/services/presentations';
import { useSlideStore, type Slide, type SlideContentType, type TypeImageContent } from '@/stores/slideStore';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image, Palette, Plus, Text, Trash, Trash2 } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { ImageCard } from './image';
import StylePopover from './settingsPanel';

export type SlideType = 'title' | 'content' | 'imageWithText';
interface SlideEditor extends Slide {
  readOnly?: boolean;
  onUpdate?: (d: string, field: keyof Slide, value: SlideContentType[]) => void;
  contentSlide?: SlideContentType;
}

interface SlideCardProps {
  slide: SlideEditor;
  onUpdate: (d: string, field: keyof Slide, value: SlideContentType[] | string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  activeAnimate?: boolean
}

interface ImageWithTextSlideProps {
  slide: Slide;
  isVertical: boolean;
  mobile: boolean;
  ht: string;
  readOnly?: boolean;
}

interface ColumnsSlideProps {
  slide: Slide;
  id: string;
  readOnly?: boolean;
  onUpdate: (d: string, field: keyof Slide, value: SlideContentType[] | string) => void;
}

type ColumnItem = {
  id: string;
  type: 'text' | 'image';
  text?: string;
  image?: { url: string; imageFit?: 'cover' | 'contain' | 'fill', position: TypeImageContent['position'] };
};

type ColumnStyle = {
  bgcolor?: string;
  border?: string;
  hasBorder?: boolean;
};

const ColumnsSlide: React.FC<ColumnsSlideProps> = memo(({ slide, readOnly, onUpdate, id }) => {
  const columnContent = slide.content?.find(c => c.id === id);
  const columns = columnContent?.columns || [];

  const getColumnItems = useCallback((columnIndex: number): ColumnItem[] => {
    const column = columns[columnIndex];
    if (!column) return [];

    if ((column as any).items) {
      return (column as any).items;
    }

    const items: ColumnItem[] = [];
    if (column.text) {
      items.push({
        id: `${columnContent?.id || 'col'}-${columnIndex}-item-0`,
        type: 'text',
        text: column.text
      });
    }
    if (column.image) {
      items.push({
        id: `${columnContent?.id || 'col'}-${columnIndex}-item-${items.length}`,
        type: 'image',
        // @ts-ignore
        image: typeof column.image === 'string' ? { url: column.image } : column.image,

      });
    }
    return items;
  }, [columns, columnContent?.id]);

  const addItemToColumn = useCallback((columnIndex: number, itemType: 'text' | 'image') => {
    if (!columnContent) return;

    const updatedColumns = [...(columns || [])];
    if (!updatedColumns[columnIndex]) {
      updatedColumns[columnIndex] = {
        direction: columnIndex === 0 ? 'left' : 'right',
        type: itemType,
        items: []
      } as any;
    }

    const column = updatedColumns[columnIndex];
    const items = getColumnItems(columnIndex);
    const newItem: ColumnItem = {
      id: `${columnContent.id}-${columnIndex}-item-${Date.now()}`,
      type: itemType,
      text: itemType === 'text' ? 'Novo texto' : undefined,
      image: itemType === 'image' ? { url: '', position: 'center' } : undefined,
    };

    (column as any).items = [...items, newItem];

    const otherContent = slide.content.filter(c => c.id !== columnContent.id);
    const updatedContent = [
      ...otherContent,
      {
        ...columnContent,
        columns: updatedColumns
      }
    ];

    onUpdate(slide.id, 'content', updatedContent);
  }, [columnContent, columns, slide.content, slide.id, onUpdate, getColumnItems]);

  const updateItem = useCallback((columnIndex: number, itemId: string, updates: Partial<ColumnItem>) => {
    if (!columnContent) return;

    const updatedColumns = [...(columns || [])];
    const column = updatedColumns[columnIndex];
    if (!column) return;

    const items = getColumnItems(columnIndex);
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    (column as any).items = updatedItems;

    const otherContent = slide.content.filter(c => c.id !== columnContent.id);
    const updatedContent = [
      ...otherContent,
      {
        ...columnContent,
        columns: updatedColumns
      }
    ];

    onUpdate(slide.id, 'content', updatedContent);
  }, [columnContent, columns, slide.content, slide.id, onUpdate, getColumnItems]);

  const deleteItem = useCallback((columnIndex: number, itemId: string) => {
    if (!columnContent) return;

    const updatedColumns = [...(columns || [])];
    const column = updatedColumns[columnIndex];
    if (!column) return;

    const items = getColumnItems(columnIndex);
    const updatedItems = items.filter(item => item.id !== itemId);

    (column as any).items = updatedItems;

    const otherContent = slide.content.filter(c => c.id !== columnContent.id);
    const updatedContent = [
      ...otherContent,
      {
        ...columnContent,
        columns: updatedColumns
      }
    ];

    onUpdate(slide.id, 'content', updatedContent);
  }, [columnContent, columns, slide.content, slide.id, onUpdate, getColumnItems]);

  const getColumnStyle = useCallback((columnIndex: number): ColumnStyle => {
    const column = columns[columnIndex];
    if (!column) return {};
    return {
      bgcolor: (column as any).bgcolor,
      border: (column as any).border,
      hasBorder: (column as any).hasBorder !== false
    };
  }, [columns]);

  const updateColumnStyle = useCallback((columnIndex: number, style: Partial<ColumnStyle>) => {
    if (!columnContent) return;

    const updatedColumns = [...(columns || [])];
    const column = updatedColumns[columnIndex];
    if (!column) {
      updatedColumns[columnIndex] = {
        direction: columnIndex === 0 ? 'left' : 'right',
        type: 'text',
        items: []
      } as any;
    }

    (updatedColumns[columnIndex] as any).bgcolor = style.bgcolor;
    (updatedColumns[columnIndex] as any).border = style.border;
    (updatedColumns[columnIndex] as any).hasBorder = style.hasBorder;

    const otherContent = slide.content.filter(c => c.id !== columnContent.id);
    const updatedContent = [
      ...otherContent,
      {
        ...columnContent,
        columns: updatedColumns
      }
    ];

    onUpdate(slide.id, 'content', updatedContent);
  }, [columnContent, columns, slide.content, slide.id, onUpdate, getColumnStyle]);

  const handleTextUpdate = useCallback((columnIndex: number, itemId: string, id: string, field: keyof Slide, value: SlideContentType[]) => {
    if (field === 'content' && Array.isArray(value)) {
      const updatedTextContent = value.find(v => v.id === id);
      if (updatedTextContent?.text !== undefined) {
        updateItem(columnIndex, itemId, { text: updatedTextContent.text });
      }
    }
  }, [updateItem]);

  const ColumnItem: React.FC<{
    columnIndex: number;
    items: ColumnItem[];
    columnStyle: ColumnStyle;
    readOnly?: boolean;
    columnId: string;
    contentId: string;
    direction: 'right' | 'left';
  }> = ({ columnIndex, items, columnStyle, readOnly, columnId, direction }) => {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <div
        key={columnId}
        className={cn(
          "rounded-lg transition-all duration-200",
          "flex flex-col gap-3 relative",
          columnStyle.hasBorder && "border-2 px-[1rem]",
          !readOnly && "hover:border-red-500/50"
        )}
        style={{
          borderColor: columnStyle.hasBorder ? (columnStyle.border || 'transparent') : 'transparent',
          backgroundColor: columnStyle.bgcolor || 'transparent'
        }}
        onMouseEnter={() => !readOnly && setIsSelected(true)}
        onMouseLeave={() => !readOnly && setIsSelected(false)}
        onClick={() => !readOnly && setIsSelected(true)}
      >
        {items.length === 0 && !readOnly && (
          <div className="flex items-center justify-center min-h-[10rem] text-gray-400">
            <p>Coluna vazia</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="rounded-lg">
            {item.type === 'text' ? (
              <Textarea
                slide={slide}
                contentSlide={{
                  id: item.id,
                  type: 'text',
                  text: item.text || ''
                } as SlideContentType}
                onDelete={() => deleteItem(columnIndex, item.id)}
                readOnly={readOnly}
                onUpdate={(_, field, value) => {
                  handleTextUpdate(columnIndex, item.id, item.id, field, value);
                }}
              />
            ) : (
              <ImageCard
                slide={{
                  ...slide,
                  imageFit: item.image?.imageFit || 'cover'
                }}
                contentId={id}
                isColumn
                columnId={columnId}
                imageIFit={item.image?.imageFit}
                imagePostion={item.image?.position}
                content={slide.content}
                direction={direction}
                slideContent={{
                  image: item.image,
                  order: slide.order,
                  items: items,
                  ...item
                }}
                onUpdate={(_id, field, value) => {
                  if (field === 'imageUrl' && typeof value === 'string') {
                    updateItem(columnIndex, item.id, {
                      image: {
                        url: value,
                        imageFit: item.image?.imageFit || 'cover',
                        position: item.image?.position || 'center'
                      }
                    });
                  } else if (field === 'imageFit') {
                    updateItem(columnIndex, item.id, {
                      image: {
                        url: item.image?.url || '',
                        imageFit: value as 'cover' | 'contain' | 'fill',
                        position: item.image?.position || 'center'
                      }
                    });
                  }
                  else {
                    onUpdate(_id, field, value)
                  }
                }}
                onDelete={() => deleteItem(columnIndex, item.id)}
                readOnly={readOnly}
              />
            )}

            {/* {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(columnIndex, item.id);
                }}
                className="mt-2 h-7 px-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </Button>
            )} */}
          </div>
        ))}
        <div className="absolute -top-6 left-14 z-10 flex gap-2">
          {!readOnly && (
            <>
              {isSelected && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-4" onClick={(e) => e.stopPropagation()}>
                    <DialogTitle>
                      Realmente deseja deletar coluna?
                    </DialogTitle>
                    <div className='text-gray-800'>
                      Esta ação não pode ser desfeita.
                    </div>
                    <DialogFooter className='gap-4 mt-4'>
                      <DialogClose>
                        <Button variant={'secondary'} className='py-1 px-2 text-gray-700'>
                          Fechar
                        </Button>
                      </DialogClose>
                      <DialogClose>
                        <Button variant={'destructive'} className='py-1 px-2' onClick={() => {
                          const CurrentContent = slide.content.find(a => a.id === id) as SlideContentType;
                          if (!CurrentContent) return
                          const othersColumns = (CurrentContent?.columns || []).filter(a => a.id !== columnId);
                          if (othersColumns.length === 0) {
                            onUpdate(slide.id, 'content', [
                              ...slide.content.filter(a => a.id !== id)
                            ]);
                            return;
                          }
                          onUpdate(slide.id, 'content', [
                            ...slide.content.filter(a => a.id !== id),
                            {
                              ...CurrentContent,
                              columns: [
                                ...othersColumns
                              ]
                            }
                          ])
                        }}>
                          Deletar coluna
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {isSelected && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Palette size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Cor de Fundo</label>
                        <input
                          type="color"
                          value={columnStyle.bgcolor || '#ffffff'}
                          onChange={(e) => updateColumnStyle(columnIndex, { bgcolor: e.target.value })}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Cor da Borda</label>
                        <input
                          type="color"
                          value={columnStyle.border || '#ef4444'}
                          onChange={(e) => updateColumnStyle(columnIndex, { border: e.target.value })}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`border-${columnIndex}`}
                          checked={columnStyle.hasBorder !== false}
                          onChange={(e) => updateColumnStyle(columnIndex, { hasBorder: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor={`border-${columnIndex}`} className="text-xs font-medium text-gray-600 cursor-pointer">
                          Mostrar borda
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateColumnStyle(columnIndex, { border: undefined, bgcolor: undefined, hasBorder: true })}
                        className="w-full"
                      >
                        Remover Estilos
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {isSelected && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItemToColumn(columnIndex, 'text');
                        }}
                        variant="secondary"
                        className="flex items-center justify-start gap-3 px-4 py-2"
                      >
                        <Text className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Texto</span>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItemToColumn(columnIndex, 'image');
                        }}
                        variant="secondary"
                        className="flex items-center justify-start gap-3 px-4 py-2"
                      >
                        <Image className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Imagem</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  const sortedColumnIndexes = columns
    .map((_, index) => index)
    .sort((a, b) => {
      const dirA = columns[a]?.direction === 'left' ? 0 : 1;
      const dirB = columns[b]?.direction === 'left' ? 0 : 1;
      if (dirA !== dirB) {
        return dirA - dirB;
      }
      return a - b;
    });

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
        {sortedColumnIndexes.map((columnIndex) => {
          const items = getColumnItems(columnIndex);
          const columnStyle = getColumnStyle(columnIndex);
          const column = columns[columnIndex];

          return (
            <ColumnItem
              key={columnIndex}
              columnIndex={columnIndex}
              contentId={id}
              direction={column?.direction === 'left' ? 'left' : 'right'}
              items={items}
              columnStyle={columnStyle}
              readOnly={readOnly}
              columnId={column?.id || ''}
            />
          );
        })}
      </div>
    </div>
  );
});

const SortableSlideCard = ({
  slide,
  onUpdate,
  onDelete,
  readOnly
}: SlideCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <SlideCard
        slide={slide}
        onUpdate={onUpdate}
        onDelete={onDelete}
        readOnly={readOnly}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const SortableContentItem = ({
  contentItem,
  slide,
  readOnly,
  onUpdate,
  onDeleteItem
}: {
  contentItem: SlideContentType;
  slide: Slide;
  readOnly?: boolean;
  onUpdate: (id: string, field: keyof Slide, value: SlideContentType[] | string) => void;
  onDeleteItem: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contentItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };


  if (contentItem.type === 'text') {
    return (
      <div className='p-6 relative group' ref={setNodeRef} style={style}>
        {!readOnly && (
          <>
            <button
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <GripVertical size={16} />
            </button>
            <button
              onClick={() => { onDeleteItem(contentItem.id) }}
              className="absolute top-2 left-10 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <Trash size={16} />
            </button>
          </>
        )}
        <Textarea
          key={contentItem.id}
          slide={slide}
          contentSlide={contentItem as SlideContentType}
          readOnly={readOnly}
          onUpdate={onUpdate}
          onDelete={(_id) => { onDeleteItem(contentItem.id) }}
        />
      </div>
    );
  }

  if (contentItem.type === 'image') {
    return (
      <div className='relative group' ref={setNodeRef} style={style}>
        {!readOnly && (
          <>

            <button
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded bg-white/80 opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <GripVertical size={16} />
            </button>
            <button
              onClick={() => { onDeleteItem(contentItem.id) }}
              className="absolute top-2 left-10 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <Trash size={16} />
            </button>
          </>

        )}
        <ImageCard
          readOnly={readOnly}
          slide={slide}
          content={[]}
          slideContent={contentItem}
          columnId=''
          contentId={contentItem.id}
          imageIFit='contain'
          direction='left'
          onDelete={(_id) => { onDeleteItem(contentItem.id) }}
          onUpdate={(_, field, value) => {
            onUpdate(_, field, value);
          }}
        />
      </div>
    );
  }

  if (contentItem.type === 'column') {
    return (
      <div className='p-6 relative group' ref={setNodeRef} style={style}>
        {!readOnly && (
          <>
            <button
              {...attributes}
              {...listeners}
              className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <GripVertical size={16} />
            </button>
            <button
              onClick={() => { onDeleteItem(contentItem.id) }}
              className="absolute top-2 left-10 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
              title="Arrastar para reordenar"
            >
              <Trash size={16} />
            </button>
          </>
        )}
        <ColumnsSlide
          slide={slide}
          readOnly={readOnly}
          onUpdate={onUpdate}
          id={contentItem.id}
        />
      </div>
    );
  }

  if (contentItem.type === 'quote') {
    return (
      <div className='p-6 relative group' ref={setNodeRef} style={style}>
        {!readOnly && (
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
            title="Arrastar para reordenar"
          >
            <GripVertical size={16} />
          </button>
        )}
        <div className="prose prose-sm max-w-none border-l-4 border-blue-500/30 px-4 flex items-center">
          <Textarea
            slide={slide}
            onDelete={(_id) => { onDeleteItem(contentItem.id) }}
            key={contentItem.id}
            contentSlide={contentItem as SlideContentType}
            readOnly={readOnly}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    );
  }

  return null;
};

export const SlideCard = memo(({
  slide,
  onDelete,
  readOnly,
  onUpdate,
  dragHandleProps,
  activeAnimate
}: SlideCardProps & { dragHandleProps?: any }) => {

  const [currentSlide, setCurrentSlide] = useState<Slide>(slide);

  const onUpdateCurrent = useCallback((id: string, field: keyof Slide, value: SlideContentType[] | string) => {
    if (id === slide.id) {
      const updatedSlide = {
        ...currentSlide,
        [field]: value
      };
      setCurrentSlide(updatedSlide);
      onUpdate(id, field, value);
    }
  }, [currentSlide])

  const mobile = isMobile();

  const ht = ['top', 'bottom'].includes(currentSlide?.layout) ? 'h-1/2' : 'h-full';

  const isVertical = ['top', 'bottom'].includes(currentSlide?.layout);

  const ImageWithTextSlide = memo<ImageWithTextSlideProps>(({
    slide,
    isVertical,
    mobile,
    ht,
    readOnly
  }) => {
    const contentSensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const sortedContent = useMemo(() =>
      [...currentSlide.content].sort((a, b) => a.order - b.order),
      [currentSlide.content]
    );

    const handleContentDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const sorted = [...slide.content].sort((a, b) => a.order - b.order);
        const oldIndex = sorted.findIndex((item) => item.id === active.id);
        const newIndex = sorted.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedContent = arrayMove(sorted, oldIndex, newIndex);
          const updatedContent = reorderedContent.map((item, index) => ({
            ...item,
            order: index
          }));
          onUpdateCurrent(slide.id, 'content', updatedContent);
        }
      }
    }, [currentSlide.content, currentSlide.id, onUpdateCurrent, onUpdate]);

    const onDeleteItem = useCallback((id: string) => {
      const filteredContent = slide.content?.find(c => c.id === id);
      if (filteredContent?.type === 'column') {
        const updatedContent = slide.content?.map(c => {
          if (c.type === 'column') {
            return {
              ...c,
              columns: c.columns?.filter(ci => ci.image !== id)
            }
          }
          return c;
        })
        onUpdateCurrent(currentSlide.id, 'content', updatedContent || []);
      } else {
        onUpdateCurrent(currentSlide.id, 'content', currentSlide.content?.filter(c => c.id !== id))
      }
    }, [currentSlide.content, currentSlide.id, onUpdate, onUpdateCurrent]);

    return (
      <div
        style={{
          gridTemplate: '"body accent" minmax(24em, auto) / 62.5% 37.5%',
          backgroundColor: currentSlide?.bgcolor || 'transparent',
          background: `url(${currentSlide?.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        className={cn(
          'flex',
          (activeAnimate && currentSlide?.effectTransition) ? `animate-${currentSlide.effectTransition}` : '',
          'gap-4 relative min-h-[25rem]',
          mobile
            ? 'flex-col sm:flex-row'
            : isVertical
              ? `${currentSlide.layout === 'bottom' ? 'flex-col' : 'flex-col-reverse'} max-h-96`
              : currentSlide.layout.includes('left')
                ? 'flex-row-reverse'
                : 'flex-row',
          readOnly ? 'h-full' : '',
        )}
      >
        <div
          className={cn(
            'flex-1 z-30 w-full',
            ht,
            // slide.type === '' ? 'border-l-4 border-primary' : 'border-l-4 border-primary'
          )}
        >
          <DndContext
            sensors={contentSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleContentDragEnd}
          >
            <SortableContext
              items={sortedContent.map((item: SlideContentType) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedContent?.map((t: SlideContentType) => (
                <SortableContentItem
                  key={t.id}
                  contentItem={t}
                  slide={currentSlide}
                  readOnly={readOnly}
                  onUpdate={onUpdateCurrent}
                  onDeleteItem={onDeleteItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* {slide.layout !== 'empty' ? <ImageCard slide={slide} onDelete={() => { }} onUpdate={onUpdate} /> : null} */}
      </div>
    )
  }, (prevProps, nextProps) => {
    const prevContentIds = prevProps.slide.content?.map(c => c.id).join(',') || '';
    const nextContentIds = nextProps.slide.content?.map(c => c.id).join(',') || '';

    return (
      prevProps.slide.id === nextProps.slide.id &&
      prevContentIds === nextContentIds &&
      prevProps.slide.content?.length === nextProps.slide.content?.length &&
      prevProps.isVertical === nextProps.isVertical &&
      prevProps.mobile === nextProps.mobile &&
      prevProps.ht === nextProps.ht &&
      prevProps.readOnly === nextProps.readOnly
    );
  });

  const RenderInputs = memo(() => {
    return (
      <ImageWithTextSlide
        slide={slide}
        isVertical={isVertical}
        mobile={mobile}
        ht={ht}
        readOnly={readOnly}
      />
    )
  }, () => true);

  return (
    <div
      style={{
        backgroundColor: slide.bgcolor
      }}
      className={cn(readOnly ? 'h-full' : 'rounded-xl hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-blue-500', "overflow-hidden mb-6 transition-all duration-300")}>
      <div className={readOnly ? 'h-full' : ''}>
        <RenderInputs />
      </div>
      {readOnly ? null : <div className="border-t border-gray-100 px-6 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl relative">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              title="Arrastar para reordenar"
            >
              <GripVertical size={20} />
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-1 -ml-1 rounded"
              >
                <Palette size={22} />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <StylePopover
                onChangeAnimate={e => {
                  onUpdateCurrent(currentSlide.id, 'effectTransition', e)
                }}
                onChangeBackgroundImage={e => {
                  onUpdateCurrent(currentSlide.id, 'backgroundImage', e)
                }}
                backgroundImage={currentSlide?.backgroundImage}
                animate={currentSlide?.effectTransition}
                onChangeBgColor={e => {
                  onUpdateCurrent(currentSlide.id, 'bgcolor', e)
                }}
                layout={currentSlide.layout}
                onChangeLayout={e => {
                  onUpdateCurrent(currentSlide.id, 'layout', e)
                }}
                initialColor={currentSlide.bgcolor}
              // currentType={slide.type}
              // onClose={() => setIsPopoverOpen(false)}
              // onTypeChange={(newType) => {
              //   onUpdate(slide.id, 'type', newType);
              //   setIsPopoverOpen(false);
              // }}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-1 -ml-1 rounded"
              >
                <Plus size={22} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    onUpdateCurrent(currentSlide.id, 'content', [
                      ...slide.content,
                      {
                        type: 'text',
                        text: 'Novo texto',
                        id: v4().slice(0, 10),
                        order: slide.content.length + 1
                      }
                    ])
                  }}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Text className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-medium">Texto</span>
                </Button>
                <Button
                  onClick={() => {
                    onUpdateCurrent(currentSlide.id, 'content', [
                      ...slide.content,
                      {
                        type: 'image',
                        text: '',
                        id: v4().slice(0, 10),
                        order: slide.content.length + 1
                      },
                    ])
                  }}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">Imagem</span>
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                  onClick={() => {
                    onUpdateCurrent(currentSlide.id, 'content', [
                      ...(currentSlide.content || []),
                      {
                        type: 'quote',
                        text: '*Nova citação*',
                        id: v4().slice(0, 10),
                        order: slide.content.length + 1
                      }
                    ]);

                  }}
                >
                  <span className="text-emerald-600 text-xl leading-none">“</span>
                  <span className="text-gray-700 font-medium">Citação</span>
                </Button>

                <Button
                  onClick={() => {
                    onUpdateCurrent(currentSlide.id, 'content', [
                      ...(currentSlide.content || []),
                      {
                        type: 'column',
                        id: v4().slice(0, 10),
                        order: slide.content.length + 1,
                        columns: [
                          {
                            direction: 'left',
                            type: 'text',
                            text: 'Coluna 1',
                            id: v4().slice(0, 10)
                          },
                          {
                            direction: 'right',
                            type: 'text',
                            text: 'Coluna 2',
                            id: v4().slice(0, 10)
                          }
                        ]
                      }
                    ]);
                  }}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <div className="w-5 h-5 text-orange-600 grid grid-cols-2 gap-0.5">
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                    <div className="bg-orange-600/60 rounded-sm" />
                  </div>
                  <span className="text-gray-700 font-medium">Colunas</span>
                </Button>

              </div>
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
      </div>}
    </div>
  );
});

interface AppSlideProps {
  dataPresentation: {
    presentations: Slide[],
    id: string
  } | null;
  updatePresentation: (a: Slide[]) => void;
  slides: Slide[]
}

const App: React.FC<AppSlideProps> = (props) => {
  const currentSlidesRef = useRef<Slide[]>([]);
  const { reorderSlides } = useSlideStore();
  const sortedSlides = [...props.slides].sort((a, b) => a.order - b.order);

  const updateIncloud = (_slides: Slide[]) => {
    PresentationsService.update({
      presentations: _slides
    }, props?.dataPresentation?.id || "")
      .then(() => {
      })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSlides.findIndex((slide) => slide.id === active.id);
      const newIndex = sortedSlides.findIndex((slide) => slide.id === over.id);

      reorderSlides(oldIndex, newIndex);
    }
  };

  const handleDeleteSlide = (id: string) => {
    const update_slide = currentSlidesRef.current?.filter(slide => slide.id !== id);
    updateIncloud(update_slide || []);
    currentSlidesRef.current = update_slide || [];
    props?.updatePresentation(update_slide || []);
  };

  const handleUpdateSlide = React.useCallback(
    (id: string, field: keyof Slide, value: SlideContentType[] | string) => {
      if (!props?.dataPresentation?.id) return;
      const updates = {
        [field]: value,
      }
      const update_slide = currentSlidesRef.current?.map(slide =>
        slide.id === id ? { ...slide, ...updates } : slide
      );
      updateIncloud(update_slide || []);
      currentSlidesRef.current = update_slide || [];
      props?.updatePresentation(update_slide || []);
    },
    [props?.dataPresentation, currentSlidesRef.current, props.updatePresentation]
  );

  useEffect(() => {
    if ((props?.dataPresentation?.presentations?.length || 0) > 0) {
      currentSlidesRef.current = props?.dataPresentation?.presentations || [];
    }
  }, [props?.dataPresentation])

  return (
    <div className='w-6xl '>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSlides.map(slide => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedSlides?.map((slide, _index) => (
            <SortableSlideCard
              key={slide.id}
              slide={slide}
              onUpdate={handleUpdateSlide}
              onDelete={handleDeleteSlide}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default memo(App);