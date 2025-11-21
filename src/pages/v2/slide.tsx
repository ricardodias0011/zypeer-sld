import Textarea from '@/components/v2/textArea';
import { Button } from '@/components/v2/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/v2/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import { cn, isMobile } from '@/lib/utils';
import { useSlideStore, type Slide, type SlideContentType } from '@/stores/slideStore';
import { Image, Palette, Plus, Text, Trash2 } from 'lucide-react';
import React, { memo, useCallback, useState } from 'react';
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
  addText: (slide: SlideEditor) => void;
  addImage: (slide: SlideEditor) => void;
  addColumns: (slide: SlideEditor) => void;
  addQuote: (slide: SlideEditor) => void;
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
  image?: { url: string; imageFit?: 'cover' | 'contain' | 'fill' };
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
        image: typeof column.image === 'string' ? { url: column.image } : column.image
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
      image: itemType === 'image' ? { url: '' } : undefined
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

    const currentStyle = getColumnStyle(columnIndex);
    (updatedColumns[columnIndex] as any).bgcolor = style.bgcolor !== undefined ? style.bgcolor : currentStyle.bgcolor;
    (updatedColumns[columnIndex] as any).border = style.border !== undefined ? style.border : currentStyle.border;
    (updatedColumns[columnIndex] as any).hasBorder = style.hasBorder !== undefined ? style.hasBorder : currentStyle.hasBorder;

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
          columnStyle.hasBorder && "border-2",
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
                {...slide}
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
                        imageFit: item.image?.imageFit || 'cover'
                      }
                    });
                  } else if (field === 'imageFit') {
                    updateItem(columnIndex, item.id, {
                      image: {
                        url: item.image?.url || '',
                        imageFit: value as 'cover' | 'contain' | 'fill'
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
        <div className="absolute -top-6 left-0 z-10 flex gap-2">
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
                        <span className="text-sm font-medium">Texto</span>
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
                        <span className="text-sm font-medium">Imagem</span>
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

export const SlideCard = memo(({ slide, onUpdate, onDelete, readOnly, addText, addImage, addColumns, addQuote }: SlideCardProps) => {
  const mobile = isMobile();
  const sortedContentSlides = [...slide.content].sort((a, b) => a.order - b.order);

  const ht = ['top', 'bottom'].includes(slide?.layout) ? 'h-1/2' : 'h-full';

  const isVertical = ['top', 'bottom'].includes(slide?.layout);

  const ImageWithTextSlide: React.FC<ImageWithTextSlideProps> = ({
    slide,
    isVertical,
    mobile,
    ht,
    readOnly
  }) => {

    const onDeleteItem = (id: string) => {
      const filteredContent = slide.content?.find(c => c.id === id);
      console.log(filteredContent?.type)
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
        onUpdate(slide.id, 'content', updatedContent || []);
      } else {
        onUpdate(slide.id, 'content', slide.content?.filter(c => c.id !== id))
      }
    }

    return (
      <div
        style={{
          gridTemplate: '"body accent" minmax(24em, auto) / 62.5% 37.5%',
        }}
        className={cn(
          'flex',
          'gap-4 relative min-h-[25rem]',
          mobile
            ? 'flex-col sm:flex-row'
            : isVertical
              ? `${slide.layout === 'bottom' ? 'flex-col' : 'flex-col-reverse'} max-h-96`
              : slide.layout.includes('left')
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
          {
            sortedContentSlides?.map((t) => {
              if (t.type === 'text') {
                return (
                  <div className='p-6'>
                    <Textarea key={t.id} {...slide} contentSlide={t as SlideContentType} readOnly={readOnly} onUpdate={onUpdate}
                      onDelete={(_id) => { onDeleteItem(t.id) }}
                    />
                  </div>
                )
              }
              if (t.type === 'image') {
                return (
                  <ImageCard
                    readOnly={readOnly}
                    slide={slide}
                    content={[]}
                    slideContent={t}
                    columnId=''
                    contentId={t.id}
                    imageIFit='contain'
                    direction='left'
                    onDelete={(_id) => { onDeleteItem(t.id) }}
                    onUpdate={(_, field, value) => {
                      onUpdate(_, field, value);
                    }} />
                )
              }
              if (t.type === 'column') {
                return (
                  <div className='p-6'>
                    <ColumnsSlide
                      slide={slide}
                      readOnly={readOnly}
                      onUpdate={onUpdate}
                      id={t.id}
                    />
                  </div>
                )
              }
              if (t.type === 'quote') {
                return (
                  <div className='p-6 '>
                    <div className="prose prose-sm max-w-none border-l-4 border-blue-500/30 px-4 flex items-center">
                      <Textarea
                        onDelete={(_id) => { onDeleteItem(t.id) }}
                        key={t.id} {...slide} contentSlide={t as SlideContentType} readOnly={readOnly} onUpdate={onUpdate} />
                    </div>
                  </div>
                )
              }
              return null;
            })
          }

        </div>

        {/* {slide.layout !== 'empty' ? <ImageCard slide={slide} onDelete={() => { }} onUpdate={onUpdate} /> : null} */}
      </div>
    )
  };
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
  });

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
                onChangeBgColor={e => {
                  onUpdate(slide.id, 'bgcolor', e)
                }}
                layout={slide.layout}
                onChangeLayout={e => {
                  onUpdate(slide.id, 'layout', e)
                }}
                initialColor={slide.bgcolor}
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
                  onClick={() => addText(slide)}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Text className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-medium">Texto</span>
                </Button>
                <Button
                  onClick={() => addImage(slide)}
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                >
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">Imagem</span>
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center justify-start gap-3 px-4 py-0"
                  onClick={() => addQuote(slide)}
                >
                  <span className="text-emerald-600 text-xl leading-none">“</span>
                  <span className="text-gray-700 font-medium">Citação</span>
                </Button>

                <Button
                  onClick={() => addColumns(slide)}
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


const App: React.FC = () => {
  const { slides, updateSlide, deleteSlide } = useSlideStore();
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  const handleDeleteSlide = (id: string) => {
    deleteSlide(id);
  };

  const handleUpdateSlide = React.useCallback(
    (id: string, field: keyof Slide, value: SlideContentType[] | string) => {
      updateSlide(id, {
        [field]: value,
      });
    },
    [updateSlide]
  );

  const addText = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        content: [
          ...slide.content,
          {
            type: 'text',
            text: 'Novo texto',
            id: v4().slice(0, 10),
            order: slide.content.length + 1
          },
        ],
      });
    },
    [updateSlide]
  );

  const addQuote = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        content: [
          ...slide.content,
          {
            type: 'quote',
            text: '*Nova citação*',
            id: v4().slice(0, 10),
            order: slide.content.length + 1
          }
        ],
      });
    },
    [updateSlide]
  );
  const addImage = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        type: 'type-1',
        content: [
          ...slide.content,
          {
            type: 'image',
            text: '',
            id: v4().slice(0, 10),
            order: slide.content.length + 1
          },
        ],
      });
    },
    [updateSlide]
  );

  const addColumns = React.useCallback(
    (slide: SlideEditor) => {
      updateSlide(slide.id, {
        content: [
          ...(slide.content || []),
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
        ],
      });
    },
    [updateSlide]
  );

  return (
    <div className='w-6xl'>
      {sortedSlides?.map((slide, _index) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          onUpdate={handleUpdateSlide}
          onDelete={handleDeleteSlide}
          addText={addText}
          addImage={addImage}
          addColumns={addColumns}
          addQuote={addQuote}
        />
      ))}
      {/* <AddSlideToolbar onAddSlide={handleAddSlide} /> */}
    </div>
  );
};

export default memo(App);