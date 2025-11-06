import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Transformer, Line, Text, Rect } from 'react-konva';

import { v4 as uuidv4 } from 'uuid';
import type { Shape } from '../../types/editor';

import "./styles.css"
import { RiArrowGoBackLine, RiArrowGoForwardLine, RiLayout5Line } from 'react-icons/ri';
import { RxText } from 'react-icons/rx';
import { LuFolder } from 'react-icons/lu';
import { TbIcons } from 'react-icons/tb';
import ShapeItem from './shapeItem';
import { MenuShapes } from './menu/shapes';
import { MenuLayers } from './menu/layers';
import MenuImages from './menu/images';
// import type { Photos } from '../../types/image';
import { MenuText } from './menu/text';
import Konva from 'konva';
import TopBarMenu from './menu/topBar';
import { AssetsService } from '../../services/assets';
import type { FilesProps } from '../../types/user';
import type { PresentationSlide } from '../../types/presentations-sliders';
import { Box, Flex, Grid, IconButton, Slider, Text as RadixText, Button, Dialog, TextField, Popover, Checkbox, Select } from '@radix-ui/themes';
import PreviewSlide from './preview';
import { FiHome, FiMenu, FiPlus, FiTarget } from 'react-icons/fi';
import { BsChevronDown, BsChevronLeft, BsChevronRight, BsChevronUp } from 'react-icons/bs';
import TopBarMenuDefault from './menu/topBarDefault';
import Logo from "../../assets/logo-white.png"
import useQuery from '../../hooks/useQuery';
import { IoIosLink } from "react-icons/io";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoPlayOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { labelStatusSaving } from '../../utils';
import { Templates } from './menu/templates';
import { PresentationsService } from '../../services/presentations';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const Editor = (props: {
  onlyPreview?: boolean,
  currentShapes?: Shape[],
  indexSlide?: number,
  thumbnailId?: string,
  updateSlide: (a: Shape[], currentId: string, noServerUpdate?: boolean) => void;
  updateVariablesSlide: (a: PresentationSlide) => void;
  currentSlide: PresentationSlide | null;
  slides: PresentationSlide[]
  updateThumbnail: (link: string, id: string) => void;
  addSlideCurrentApresentation: VoidFunction;
  setCurrentSlideIndex(i: number): void;
  savingStatus: "success" | "peding" | "erro" | "sending"
  updatePresentations: () => void;
  updateIndexesSlides: (slides: PresentationSlide[]) => void;
  deleteCurrentSlide: (slide: PresentationSlide) => void;
  changeSlides: (e: PresentationSlide[]) => void;
}) => {
  const {
    onlyPreview,
    currentShapes,
    // thumbnailId,
    updateSlide,
    currentSlide,
    // updateThumbnail,
    indexSlide,
    slides,
    updateVariablesSlide,
    addSlideCurrentApresentation,
    setCurrentSlideIndex,
    updatePresentations,
    updateIndexesSlides,
    deleteCurrentSlide,
    savingStatus,
    changeSlides
  } = props;
  const { query, handleChangeQuery } = useQuery();
  const navigate = useNavigate();
  const { id } = useParams();

  const replaceImage = query.get("replace_bg_img");
  const replaceShapeImage = query.get("replace_img");

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [typeDownloads, setTypeDownloads] = useState<"PDF" | "Image">("PDF");
  const [downloads, setDownloads] = useState<number[]>([]);
  const [downloadIndexs, setDownloadIndexs] = useState<string[]>([]);

  const [history, setHistory] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);

  const [menuOpened, setMenuOpened] = useState("");
  const [selectedId, setSelectedId] = useState<{
    id: string,
    type: string
  } | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [gradientBackground, setGradientBackground] = useState("");

  const [copiedShapes, setCopiedShapes] = useState<Shape[]>([]);

  const trRef = useRef<any>(null);
  const shapeNodeRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  const [textEditSelcted, setTextEditSelcted] = useState<Shape | null>(null);

  const [guideLines, setGuideLines] = useState<{
    points: number[];
    stroke: string;
    strokeWidth: number;
    label?: string;
    labelPos?: [number, number];
  }[]>([]);
  const selectionStartPoint = useRef({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState({
    x: 0, y: 0, width: 0, height: 0, visible: false
  });
  const [assets, setAssets] = useState<FilesProps[]>([]);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [slidesMenuOpen, setSlidesMenuOpen] = useState(true);
  const timeoutRef = useRef<any>(null);

  const [urlDownload, setUrlDownload] = useState("");

  const [updaloadImages, setUpdaloadImages] = useState<{
    images: File[],
    canUpload: boolean
  }>({
    images: [],
    canUpload: false
  })

  const stageRefs = useRef<(Konva.Stage | null)[]>([]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSmallScreen(e.matches);
    };
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const targetScale = () => {
    const larguraJanela = (onlyPreview ? 384 : window.innerWidth) - (onlyPreview ? 0 : menuOpened ? 480 : 106);
    const alturaJanela = (onlyPreview ? 220 : window.innerHeight) - ((onlyPreview ? 0 : menuOpened ? 180 : 160) + (150) + (slidesMenuOpen ? 80 : 0));
    const larguraComponente = 1920;
    const alturaComponente = 1080;

    const escalaLargura = larguraJanela / larguraComponente;
    const escalaAltura = alturaJanela / alturaComponente;
    let newScale = Math.min(escalaLargura, escalaAltura);
    if (newScale > 0.7) {
      newScale = 0.7
    }
    setScale(newScale > .15 ? newScale : .15);
  }

  useEffect(() => {
    const updateScale = () => {
      targetScale();
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [menuOpened, onlyPreview, slidesMenuOpen]);

  const updateGuideLines = (lines: typeof guideLines) => {
    setGuideLines(lines);
  };


  const findImages = () => {
    AssetsService.list()
      .then(({ data }) => {
        setAssets(data?.filter((a: FilesProps) => a.type?.includes('image')) ?? [])
      })
  }

  const getImages = async () => {
    // try {
    //   const { data } = await axios.get('https://api.pexels.com/v1/search?query=gradient%20background', {
    //     headers: {
    //       Authorization: 'EITFp3ZXAjvNmxg9FX22HekHBlpzIX6FJkeGezJVYlhjXC8LfnOuLTsZ'
    //     }
    //   })

    //   setFotos(data?.photos ?? [])
    // } catch (err) {

    // }
  }


  // Zoom and stage position are commented out as they weren't fully implemented in the provided code
  // const [zoom, setZoom] = useState(1);
  // const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentShapes) {
      if (onlyPreview) {
        saveHistory(currentShapes.map((e) => {
          return {
            ...e,
            width: e.width * scale,
            height: e.height * scale
          }
        }))
      } else {
        // saveHistory(currentShapes)
        setShapes(currentShapes);
      }
    }
  }, [currentShapes, onlyPreview, scale])

  // useEffect(() => {
  //   if (onlyPreview || !currentSlide || indexSlide !== 0) return;

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     setUpoloading(true);
  //   }, 20000);
  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //   };
  // }, [currentSlide, indexSlide]);


  // const getPresentation = () => {
  //   PresentationsService.list(id)
  //     .then(({ data }) => {
  //       // setPresentations(data)
  //       // setCurrentSlide(data?.presentations?.[0])
  //     })
  // }




  const saveHistory = (newShapes: Shape[]) => {
    setHistory(prev => [...prev, shapes]);
    setRedoStack([]);
    setShapes(newShapes);
    console.log('TESTE')
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, shapes]);
    setHistory(prev => prev.slice(0, -1));
    setShapes(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, shapes]);
    setRedoStack(prev => prev.slice(0, -1));
    setShapes(next);
  };

  useEffect(() => {
    if (trRef.current && selectedId) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setTextEditSelcted(null)
    }
  }, [selectedIds, textEditSelcted])

  // const addRect = () => {
  //   const newShape: Shape = {
  //     id: uuidv4(),
  //     x: 50,
  //     y: 50,
  //     width: 100,
  //     height: 100,
  //     fill: 'green',
  //     type: 'Rect',
  //     draggable: true
  //   };
  //   saveHistory([...shapes, newShape]);
  // };

  // const duplicateSelected = () => {
  //   if (selectedIds.length === 0) return;

  //   const newShapes: Shape[] = selectedIds.map(id => {
  //     const shape = shapes.find(s => s.id === id);
  //     if (!shape) return null;

  //     return {
  //       ...structuredClone(shape), // Deep clone
  //       id: uuidv4(),
  //       x: (shape.x || 0) + 20, // Offset para não sobrepor
  //       y: (shape.y || 0) + 20,
  //     };
  //   }).filter(Boolean) as Shape[];

  //   saveHistory([...shapes, ...newShapes]);

  //   // Seleciona as duplicadas
  //   setSelectedIds(newShapes.map(s => s.id));
  // };

  const bringToFront = (from?: string) => {

    setShapes(prev => {
      let updated = [...prev];

      selectedIds.forEach(id => {
        const index = updated.findIndex(s => s.id === id);
        if (index === -1) return;

        const [item] = updated.splice(index, 1);

        if (from === 'top') {
          updated.push(item);
        } else {
          const newIndex = Math.min(index + 1, updated.length);
          updated.splice(newIndex, 0, item);
        }
      });

      saveHistory(updated);
      return updated;
    });
  };




  const sendToBack = (from?: string) => {
    setShapes(prev => {
      let updated = [...prev];

      selectedIds.forEach(id => {
        const index = updated.findIndex(s => s.id === id);
        if (index === -1) return;

        const [item] = updated.splice(index, 1);
        if (from === 'bottom') {
          updated.unshift(item); // vai para o fundo
        } else {
          // desce 1 posição, se possível
          const newIndex = Math.max(index - 1, 0);
          updated.splice(newIndex, 0, item);
        }
      });

      saveHistory(updated);
      return updated;
    });
  };

  const updateShape = (id: string, attrs: Partial<Shape>, noServerUpdate?: boolean) => {

    const updatedVisual = shapes.map(s => {
      if (s.id === id) {
        for (const key in attrs) {
          (s as any)[key] = (attrs as any)[key];
        }
      }
      return s;
    });
    if (currentSlide)
      updateSlide([...updatedVisual], currentSlide?.id, noServerUpdate)
    setShapes([...updatedVisual]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory(prev => [...prev, updatedVisual.map(s => ({ ...s }))]);
      setRedoStack([]);
    }, 1000);

  };

  // const updateInServer = () => {
  //   if(presentation){
  //     PresentationsService.update({
  //       isPublic: presentation?.isPublic,
  //       presentations: presentation?.presentations,
  //       title: presentation?.title,
  //       effectTransition: presentation?.effectTransition,
  //       order: presentation?.order
  //     }, presentation.id)
  // }}

  const createDocPDF = async () => {
    try {
      if (updaloadImages.images.length !== downloadIndexs.length) {
        return
      }
      setUploading(true);
      const { data } = await PresentationsService.export(updaloadImages.images, downloadIndexs, "pdf");
      if (data?.url) {
        if (isSmallScreen) {
          setUrlDownload(data?.url);
        } else {
          window.open(data.url, "_blank");
        }
        setUpdaloadImages({
          images: [],
          canUpload: false
        })
        setDownloadIndexs([])
      }
    } catch (e) {
      setUpdaloadImages({
        images: [],
        canUpload: false
      })
      toast.error("Desculpe, não foi possível gerar pdf")
    }
    finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (updaloadImages.images.length === downloads.length && updaloadImages.canUpload) {
      createDocPDF();
    }
    console.log(updaloadImages.images.length)
  }, [updaloadImages, downloads])

  const getImageForUpload = async (stage: any, filename: string) => {

    if (!stage) return;
    const uri = stage.toDataURL();
    const res = await fetch(uri);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });
    if (!file) {
      return
    }
    try {
      setUpdaloadImages(e => {
        return {
          canUpload: true,
          images: [...e.images, file]
        }
      })
      // updateThumbnail(data?.link, data?.id)
    } catch (err) {
      console.log(err)
    }
  }

  const downloadAllSlides = async () => {

    if (typeDownloads === "Image" && downloads.length === 1) {
      if (isSmallScreen) {
        setUrlDownload("https://slides.zypeer.com.br/docs/" + id);
        return
      }
      stageRefs.current.forEach((stage, index) => {
        if (!stage) return;
        if (!downloads.find(a => a === (index + 1))) return
        if (typeDownloads === "Image") {
          const dataURL = stage.toDataURL({ pixelRatio: 2 });
          const link = document.createElement('a');
          link.download = `slide-${index + 1}.png`;
          link.href = dataURL;
          link.click();
        }

      });
    }
    if (typeDownloads === "Image" && downloads.length > 1) {
      setUploading(true);

      const zip = new JSZip();

      // Pasta dentro do zip, opcional
      const imagesFolder = zip.folder('slides');

      // Gera as imagens
      const promises = stageRefs.current.map(async (stage, index) => {
        if (!stage) return;
        if (!downloads.includes(index + 1)) return;

        const dataURL = stage.toDataURL({ pixelRatio: 2 });
        const res = await fetch(dataURL);
        const blob = await res.blob();

        const filename = `slide-${index + 1}.png`;
        imagesFolder?.file(filename, blob);
      });

      await Promise.all(promises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'slides.zip');

      setUploading(false);
    }
    if (typeDownloads === "PDF") {
      slides.forEach(async (_slide, index) => {
        const stage = stageRefs.current[index];
        if (stage && downloads.includes(index + 1)) {
          const filename = uuidv4() + '.png'
          setDownloadIndexs(e => [
            ...e,
            filename
          ])
          await getImageForUpload(stage, filename);
        }
      });
    }

  };

  const exportToImage = () => {
    if (layerRef.current) {
      try {
        const uri = layerRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'canvas-export.png';
        link.href = uri;
        link.click();
        setTimeout(() => {
          setExporting(false)
        }, 1500)
      } catch (e) {
        console.log(e)
      }
    }
  };

  useEffect(() => {
    if (replaceImage || replaceShapeImage) {
      setMenuOpened('files');
    }
  }, [replaceImage || replaceShapeImage])

  useEffect(() => {
    if (exporting) {
      exportToImage()
    }
  }, [exporting])

  useEffect(() => {
    if (uploading) {
      // getImageForUpload()
    }
  }, [uploading])

  useEffect(() => {
    const handleClick = (e: any) => {
      const tag = e.target.tagName?.toLowerCase();
      const hasIgnoreClass = e.target.closest('.w-color-interactive');
      if (["input", "button", "textarea", "svg", "path", "img", 'span'].includes(tag) || hasIgnoreClass) return;
      if (!stageRef.current) return;
      const clickedOnStage = stageRef.current.getStage().content.contains(e.target);
      if (!clickedOnStage) {
        setSelectedIds([])
      } else {
        handleChangeQuery(null, 'replace_bg_img');
        handleChangeQuery(null, 'replace_img');
      }
    };

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);


  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    if (!destination) return;

    const reordered = Array.from(slides);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);
    updateIndexesSlides(reordered);
  };


  const deleteSelected = () => {
    const newShapes = shapes.filter(s => !selectedIds.includes(s.id));
    saveHistory(newShapes);
    setSelectedId(null);
    setSelectedIds([]);
    updateGuideLines([]);
    if (currentSlide)
      updateSlide([...newShapes], currentSlide.id)
  };

  const MenuOpened = () => {
    switch (menuOpened) {
      case "shapes":
        return <MenuShapes saveHistory={saveHistory} shapes={shapes} />
      case "layers":
        return <MenuLayers selectedIds={selectedIds} updateShape={updateShape} shapes={shapes} deleteSelected={deleteSelected} />
      case "files":
        return <MenuImages
          updateShape={updateShape}
          selectedShape={selectedIds?.[0]}
          currentSlide={currentSlide}
          updateVariablesSlide={updateVariablesSlide}
          reload={findImages}
          saveHistory={saveHistory}
          shapes={shapes}
          assets={assets} />
      case "text":
        return <MenuText saveHistory={saveHistory} shapes={shapes} />
      case "templates":
        return <Templates saveHistory={saveHistory} slides={slides} changeSlides={changeSlides} />
      default:
        return <></>;
    }
  }
  const handleMenu = (key: string) => {
    setMenuOpened(key)
  }

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const tag = event.target.tagName?.toLowerCase();
      if (["textarea", "input"].includes(tag)) return
      const isCtrl = event.ctrlKey || event.metaKey;
      if (isCtrl && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        const toCopy = shapes.filter(s => selectedIds.includes(s.id));
        setCopiedShapes(toCopy);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {

        if (copiedShapes.length === 0) return;

        const newShapes = copiedShapes.map(shape => {
          const offset = 20;
          return {
            ...shape,
            id: uuidv4(),
            x: (shape.x ?? 0) + offset,
            y: (shape.y ?? 0) + offset
          };
        });

        const updatedShapes = [...shapes, ...newShapes];
        setSelectedIds(newShapes.map(s => s.id));
        saveHistory(updatedShapes);
      }

      if (event.key === 'Delete') {
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, shapes, history, shapeNodeRef, trRef, copiedShapes]);

  useEffect(() => {
    if (!trRef.current || !layerRef.current) return;

    const nodes = selectedIds
      .map(id => layerRef.current.findOne(`#${id}`))
      .filter(Boolean);

    trRef.current.nodes(nodes);
    trRef.current.getLayer().batchDraw();
  }, [selectedIds, shapes]);


  useEffect(() => {
    getImages();
  }, [])

  useEffect(() => {
    findImages();
  }, [])

  useEffect(() => {
    if (currentSlide?.background?.type === 'gradient') {
      const colors = (currentSlide.background.color as string[]).filter(e => typeof e === 'string');
      if (Array.isArray(colors) && colors.length > 0) {
        const colorsArray = colors
        if (colors.length === 1) {
          colorsArray.push('transparent')
        }
        const gradientString = `linear-gradient(to right, ${colorsArray.join(', ')})`;
        setGradientBackground(gradientString);
      }
    }
  }, [currentSlide]);

  return (
    <div className="editor-container">
      <div className="toolbar-controls">
        <div className='section-toolbar'>
          <img src={Logo} width={120} alt="logo" style={{ marginRight: 10, cursor: 'pointer' }}
            className='logo-editor'
            onClick={() => {
              navigate("/")
            }} />
          <button onClick={() => setMenuOpened(menuOpened ? "" : "text")}>
            <FiMenu size={22} />
          </button>
          <div className='toolbar-controls-divider' />
          <button onClick={undo} disabled={history.length === 0}>
            <RiArrowGoBackLine size={22} />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0}>
            <RiArrowGoForwardLine size={22} />
          </button>
          <div className='toolbar-controls-divider' />
          {/* <button onClick={addRect}>Adicionar Retângulo</button> */}
          {/* <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <button onClick={bringToFront} disabled={!selectedId}>Trazer para Frente</button>
                    <button onClick={sendToBack} disabled={!selectedId}>Enviar para Trás</button> */}
        </div>
        <div>
          <Flex direction={'row'} gap="1" align='center'>
            {
              isSmallScreen ? <></> :
                <Button
                  variant='ghost'
                  style={{
                    backgroundColor: labelStatusSaving[savingStatus].color + 60
                  }}
                  mr="4"
                  onClick={() => {
                    if (currentSlide?.id && ['erro', 'peding'].includes(savingStatus)) {
                      updatePresentations();
                    }
                  }}
                >
                  <RadixText as="div" size="1" style={{
                    color: labelStatusSaving[savingStatus].color
                  }}>
                    {labelStatusSaving[savingStatus].label}
                  </RadixText>
                </Button>
            }
            <Popover.Root>
              <Popover.Trigger>
                <IconButton variant='ghost'>
                  {/* <IoDownload color="white" size={20} /> */}
                  Baixar
                </IconButton >
              </Popover.Trigger>
              <Popover.Content>
                {/* <Button onClick={() => {
                  // downloadURI
                }}>
                </Button> */}
                <RadixText size="2" weight="medium">
                  Formato de arquivo
                </RadixText>
                <Select.Root
                  size={"3"}
                  defaultValue="5"
                  value={typeDownloads}
                  onValueChange={(e) => {
                    setTypeDownloads(e as "PDF" | "Image")
                  }}>
                  <Select.Trigger color="cyan" style={{ width: '100%' }} />
                  <Select.Content color="cyan">
                    <Select.Group>
                      <Select.Label>Numero de slides</Select.Label>
                      <Select.Item value={'PDF'}>PDF</Select.Item>
                      <Select.Item value={'Image'}>Imagem</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                <Flex direction="column" gap="2" mt="4" align="start">
                  <Button variant='ghost' color="gray" onClick={() => {
                    if (slides.length === downloads.length) {
                      setDownloads([])
                    } else {
                      setDownloads(slides.map((_e, index) => index + 1))
                    }
                  }}>
                    <Flex align="center" justify="center" direction="row" gap="2">
                      <Checkbox color="cyan" checked={slides.length === downloads.length} />
                      <RadixText size="2" weight="medium">
                        Todos
                      </RadixText>
                    </Flex>
                  </Button>
                  {
                    slides.map((_slide, index) => {
                      const checked = downloads.find(a => a === (index + 1));
                      const current = (index + 1)
                      return (
                        <Button variant='ghost' color="gray" onClick={() => {
                          if (checked) {
                            setDownloads(a => [...a.filter(p => p !== current)])
                          } else {
                            setDownloads(a => [...a.filter(p => p !== current), current])
                          }
                        }}>
                          <Flex align="center" justify="center" direction="row" gap="2">
                            <Checkbox color="cyan" checked={!!checked} />
                            <RadixText size="2" weight="medium">
                              Página - {index + 1}
                            </RadixText>
                          </Flex>
                        </Button>
                      )
                    })
                  }
                  <Button
                    style={{ width: "100%" }}
                    mt="4"
                    color='cyan'
                    disabled={downloads.length === 0 || uploading}
                    onClick={() => {
                      // downloadURI
                      downloadAllSlides();
                    }}>
                    Baixar
                  </Button>
                </Flex>

              </Popover.Content>
            </Popover.Root>
            <Dialog.Root>
              <Dialog.Trigger>
                <IconButton variant='ghost'>
                  <IoIosLink color="white" size={20} />
                </IconButton >
              </Dialog.Trigger>
              <Dialog.Content maxWidth="450px">
                <Dialog.Title>Editar apresentação</Dialog.Title>
                <Flex direction="column" gap="3">
                  <label>
                    <RadixText as="div" size="1" color="gray">
                      Aqui está o link da sua apresentação. Quem tiver acesso poderá apenas visualizar os slides.
                    </RadixText>
                    <TextField.Root
                      mt="2"
                      value={"https://slides.zypeer.com.br/docs/show/" + id}
                      color="cyan"
                    />
                  </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      Fechar
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close onClick={() => {
                    navigator.clipboard.writeText("https://slides.zypeer.com.br" + '/docs/show' + `/${id}`);
                  }}>
                    <Button color="cyan">Copiar</Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>

            <Button
              style={{
                backgroundColor: 'white',
                marginLeft: 10
              }}
              onClick={() => {
                navigate("/docs/show/" + id)
              }}>
              <IoPlayOutline color="black" size={20} />
              {!isSmallScreen ? <RadixText
                size={'3'}
                weight={'medium'}
                style={{ color: 'black', textShadow: 'none' }}>
                Visualizar
              </RadixText> : <></>}
            </Button>
          </Flex>
        </div>
      </div>
      <div className="main-content">
        <div className='menu-container'>
          <button className='button-icon' onClick={() => handleMenu("templates")}>
            <RiLayout5Line size={25} />
            Modelos
          </button>
          <button className='button-icon' onClick={() => handleMenu("text")}>
            <RxText size={25} />
            Texto
          </button>
          <button className='button-icon' onClick={() => handleMenu("files")}>
            <LuFolder size={25} />
            Arquivos
          </button>
          {/* <button className='button-icon'>
                        <TbIcons size={30} />
                        Icones
                    </button> */}
          <button className='button-icon' onClick={() => handleMenu("shapes")}>
            <TbIcons size={30} />
            Elementos
          </button>
          {/* <button className='button-icon' onClick={() => handleMenu("layers")}>
            <IoLayersOutline size={30} />
            Camadas
          </button> */}
        </div>
        <div style={{
          position: 'relative',
          transition: 'ease .5s',
          width: menuOpened ? 260 : 0
        }}>
          {
            !!menuOpened ?
              MenuOpened()
              : <></>
          }
          <IconButton
            onClick={() => {
              handleChangeQuery(null, 'replace_bg_img');
              handleChangeQuery(null, 'replace_img');
              if (menuOpened) {
                setMenuOpened("")
                return
              }
              setMenuOpened("shapes")
            }}
            style={{
              position: 'absolute',
              top: '50%',
              right: -10,
              backgroundColor: 'white',
              zIndex: 1,
              transform: 'translateY(-50%)'
            }}>
            {menuOpened ? <BsChevronLeft color="rgba(46, 190, 247)" /> : <BsChevronRight color="rgba(46, 190, 247)" />}
          </IconButton>
        </div>
        <div
          style={{
            width: `calc(100% - ${menuOpened ? "260px" : "0px"}) `
          }}
          className='editor-main-wrapper'>
          {selectedIds.length > 0 ?
            <TopBarMenu
              updateShape={updateShape}
              bringToFront={bringToFront}
              textEditSelcted={textEditSelcted}
              setTextEditSelcted={setTextEditSelcted}
              shape={shapes.find(e => e.id === selectedIds[0])}
              sendToBack={sendToBack}
            /> :
            <TopBarMenuDefault
              currentSlide={currentSlide}
              deleteCurrentSlide={deleteCurrentSlide}
              updateVariablesSlide={updateVariablesSlide}
              lenghtSlides={slides.length}
            />}
          <Flex
            justify='center'
            align={'center'}
            position="relative"
            style={{ boxSizing: 'border-box', flexShrink: 0, flex: 1, flexGrow: 1, }}
            direction={'column'}>
            <Grid
              height={'100%'}
              align='center'
              justify={'center'}
              position={'relative'}
              width="100%"
              overflow={'auto'}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transition: "transform 0.3s ease",
                  transformOrigin: isSmallScreen ? "left top" : "center top",
                  minHeight: 800,
                  height: 1080,
                  top: 40,
                  width: isSmallScreen ? "1920px" : "100%",
                  marginLeft: isSmallScreen ? 25 : 0,
                  overflow: "auto"
                }}
                className='canva-wrapper'>
                <Stage
                  ref={stageRef}
                  width={1920}
                  height={1080}
                  scale={{
                    x: 1,
                    y: 1
                  }}
                  onMouseDown={(e: any) => {
                    if (onlyPreview) return;
                    const isStageClick = e.target === e.target.getStage();
                    if (!isStageClick) return;

                    const pointer = e.target.getStage()?.getPointerPosition();
                    if (!pointer) return;
                    selectionStartPoint.current = pointer;

                    setSelectionRect({
                      x: pointer.x,
                      y: pointer.y,
                      width: 0,
                      height: 0,
                      visible: true,
                    });
                  }}
                  onMouseMove={(e) => {

                    if (!selectionRect.visible) return;

                    const pointer = e.target.getStage()?.getPointerPosition();
                    if (!pointer) return;

                    const sx = selectionStartPoint.current.x;
                    const sy = selectionStartPoint.current.y;

                    setSelectionRect({
                      x: Math.min(pointer.x, sx),
                      y: Math.min(pointer.y, sy),
                      width: Math.abs(pointer.x - sx),
                      height: Math.abs(pointer.y - sy),
                      visible: true,
                    });
                  }}
                  onMouseUp={() => {
                    if (selectionRect.visible) {
                      const stage = layerRef.current.getStage();
                      const selected = shapes.filter(shape => {
                        const node = stage.findOne(`#${shape.id}`);
                        return node && Konva.Util.haveIntersection(selectionRect, node.getClientRect());
                      }).map(s => s.id);
                      setSelectedIds(selected);
                      setSelectionRect({ ...selectionRect, visible: false });
                    }
                  }}
                  style={{
                    ...(currentSlide?.background?.type === 'gradient' ? {
                      background: gradientBackground
                    } :
                      currentSlide?.background?.type === 'image' ?
                        {
                          backgroundImage: `url(${currentSlide?.background.url})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: 'cover'
                        }
                        :
                        {
                          backgroundColor: currentSlide?.background?.color as string ?? '#fff',
                        })
                  }}
                >
                  <Layer ref={layerRef} scale={{
                    x: 1,
                    y: 1
                  }}>

                    {shapes.map(shape => {
                      if (shape.show)
                        return (
                          <ShapeItem
                            key={shape.id}
                            setSelectedId={setSelectedId}
                            selectedId={selectedId}
                            shape={shape}
                            onTextEditSelcted={(e) => setTextEditSelcted(e)}
                            selectedIds={selectedIds}
                            updateShape={updateShape}
                            allShapes={shapes}
                            onSelect={(id, isShiftPressed) => {
                              if (isShiftPressed) {
                                setSelectedIds(prev =>
                                  prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                );
                              } else {
                                setSelectedIds([id]);
                              }
                            }}
                            updateGuideLines={updateGuideLines}
                            onRef={(ref) => {
                              console.log(ref)
                              shapeNodeRef.current = ref;
                            }}
                          />
                        );
                    })}
                    {!exporting && !onlyPreview && guideLines.map((line, i) => (
                      <React.Fragment key={i}>
                        <Line
                          points={line.points}
                          stroke={line.stroke}
                          strokeWidth={line.strokeWidth}
                          dash={[4, 4]}
                        />
                        {line.label && line.labelPos && (
                          <Text
                            x={line.labelPos[0]}
                            y={line.labelPos[1]}
                            text={line.label}
                            fontSize={12}
                            fill={line.stroke}
                          />
                        )}
                      </React.Fragment>
                    ))}
                    {!exporting && (selectedIds.length > 0 && !onlyPreview) && (
                      <Transformer
                        flipEnabled={false}
                        ref={trRef}
                        boundBoxFunc={(_oldBox, newBox) => newBox}
                        {...(selectedIds.length > 1 ? {
                          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                        } : (shapes.find(e => e.id === selectedIds[0])?.type === 'Text' ? {
                          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']
                        } : {}))}
                        anchorStyleFunc={() => {
                          [{

                          }]
                        }}
                        anchorFill={"rgba(46, 190, 247)"}
                        borderStroke={"rgba(46, 190, 247)"}
                        borderStrokeWidth={isSmallScreen ? 10 : 4}
                        anchorStroke={"rgba(46, 190, 247)"}
                        anchorStrokeWidth={isSmallScreen ? 50 : 4}
                        anchorSize={20}
                        anchorCornerRadius={50}
                      />
                    )}
                    {
                      !exporting && !onlyPreview &&
                      <Rect
                        x={selectionRect.x}
                        y={selectionRect.y}
                        width={selectionRect.width}
                        height={selectionRect.height}
                        fill="rgba(46, 190, 247, 0.16)"
                        stroke="rgba(46, 190, 247)"
                        strokeWidth={1}
                        visible={selectionRect.visible}
                      />
                    }

                  </Layer>
                </Stage>
              </div>
            </Grid>
            <Grid
              width={isSmallScreen ? '100vw' : '100%'}
              height={slidesMenuOpen ? '125px' : (isSmallScreen ? '30px' : '0px')}

              // position={'absolute'}
              bottom={'0px'}
              gap={'2'}
              style={{
                padding: 10,
                background: 'white',
                boxShadow: 'rgba(0, 0, 0, 0.45) 0px 15px 20px 0px',
                transition: 'ease .5s',
                zIndex: 2
              }}
            >
              <Flex
                position={'relative'}
                align='center'
                justify={'center'}>
                <IconButton
                  onClick={() => setSlidesMenuOpen(!slidesMenuOpen)}
                  style={{
                    position: 'absolute',
                    top: -20,
                    backgroundColor: 'white'
                  }}>
                  {slidesMenuOpen ? <BsChevronDown color="rgba(46, 190, 247)" /> : <BsChevronUp color="rgba(46, 190, 247)" />}
                </IconButton>
              </Flex>
              {isSmallScreen ? <Box width={'100%'}>
                <Slider
                  variant='surface'
                  color="cyan"
                  size={'1'}
                  min={25}
                  value={[(scale * 100)]}
                  onValueChange={(value) => {
                    setScale(value[0] / 100)
                  }} />
              </Box> : null}
              <Flex direction={'row'} wrap={'nowrap'} gap={'2'} overflowX={"auto"}>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable
                    droppableId="droppable"
                    direction="horizontal"
                    isDropDisabled={false}
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                  >
                    {(provided, _snapList) => (
                      <div
                        ref={provided.innerRef}
                        style={{
                          display: 'flex'
                        }}
                        {...provided.droppableProps}
                      >

                        {
                          slides.map((slide, index) => (
                            <Draggable key={slide.id} draggableId={slide.id} index={index}>
                              {
                                (provided_d, _snapshot) => (
                                  <div
                                    {...provided_d.draggableProps}
                                    {...provided_d.dragHandleProps}
                                    ref={provided_d.innerRef}
                                    onClick={() => setCurrentSlideIndex(index)}
                                  >
                                    <div
                                      className='preview-slide-i'
                                      onClick={() => setCurrentSlideIndex(index)}
                                      style={{
                                        border: `3px solid ` + (index === indexSlide ? 'rgba(46, 190, 247)' : 'transparent')
                                      }}>
                                      {/* <Popover.Root>
                                        <Popover.Trigger>
                                          <Button
                                            variant="ghost"
                                            className='dots-btn-menu-slide'
                                            onClick={(e) => {
                                              e.preventDefault()
                                            }}
                                          >
                                            <PiDotsThreeOutlineVerticalFill color="white" />
                                          </Button>
                                        </Popover.Trigger>
                                        <Popover.Content width="360px">

                                        </Popover.Content>
                                      </Popover.Root> */}
                                      <PreviewSlide currentSlide={slide} ref={(el) => {
                                        (stageRefs.current[index] = el)
                                      }} />
                                    </div>
                                  </div>
                                )
                              }

                            </Draggable>
                          ))
                        }
                        {provided.placeholder}
                      </div>)}
                  </Droppable>
                </DragDropContext>
                <div
                  onClick={addSlideCurrentApresentation}
                  style={{
                    width: 125,
                    height: 70,
                    position: 'relative',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#e4e6ec',
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    minWidth: 125
                  }}>
                  <FiPlus size={25} />
                </div>
              </Flex>
            </Grid>
          </Flex>
          <Flex align="center" justify='center' direction={'row'} className='top-bar-submenu' gap={'4'} pr={"4"}>
            {
              !isSmallScreen ?
                <Flex align="center" justify='end' gap="4" flexGrow={'1'} display={isSmallScreen ? 'none' : 'flex'}>
                  <RadixText size={'2'} style={{ width: 60 }}>{(indexSlide ?? 0) + 1} / {(slides.length)}</RadixText>
                  <Box maxWidth={'250px'} width={'100%'}>
                    <Slider
                      variant='surface'
                      color="cyan"
                      size={'1'}
                      min={25}
                      value={[(scale * 100)]}
                      onValueChange={(value) => {
                        setScale(value[0] / 100)
                      }} />
                  </Box>
                  <IconButton variant='ghost' color="cyan" onClick={targetScale}>
                    <FiTarget />
                  </IconButton>
                  <RadixText size={'2'}>{(scale * 100).toFixed(0)}%</RadixText>
                </Flex>
                :
                <Flex align={"center"} justify={"center"} mt="2" direction={"column"} gap="2">
                  <Flex align="center" justify='center' gap="4" flexGrow={'1'} height={'30px'} style={{ gap: 32 }}>
                    <button onClick={() => navigate("/")}>
                      <FiHome size={25} />
                    </button>
                    <Button
                      variant='ghost'
                      style={{
                        backgroundColor: labelStatusSaving[savingStatus].color + 60
                      }}
                      mr="4"
                      onClick={() => {
                        if (currentSlide?.id && ['erro', 'peding'].includes(savingStatus)) {
                          updatePresentations();
                        }
                      }}
                    >
                      <RadixText as="div" size="1" style={{
                        color: labelStatusSaving[savingStatus].color
                      }}>
                        {labelStatusSaving[savingStatus].label}
                      </RadixText>
                    </Button>
                  </Flex>
                </Flex>
            }
          </Flex>
        </div>
      </div>
      <Dialog.Root open={!!urlDownload}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>URL DOWNLOAD</Dialog.Title>
          <RadixText as="p" size="1">
            {urlDownload}
          </RadixText>
          <Flex style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "nowrap",
            marginTop: 25
          }}>
            <Button
              variant='solid'
              color='red'
              mr="4"
              onClick={() => {
                setUrlDownload("");
              }}
            >
              <RadixText as="div" size="4">
                Fechar
              </RadixText>
            </Button>
            <Button
              variant='solid'
              mr="2"
              onClick={() => {
                toast.success("Link copiado");
                navigator.clipboard.writeText(urlDownload)
              }}
            >
              <RadixText as="div" size="4">
                Copiar
              </RadixText>
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root open={!!urlDownload}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>URL DOWNLOAD</Dialog.Title>
          <RadixText as="p" size="1">
            {urlDownload}
          </RadixText>
          <Flex style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "nowrap",
            marginTop: 25
          }}>
            <Button
              variant='solid'
              color='red'
              mr="4"
              onClick={() => {
                setUrlDownload("");
              }}
            >
              <RadixText as="div" size="4">
                Fechar
              </RadixText>
            </Button>
            <Button
              variant='solid'
              mr="2"
              onClick={() => {
                toast.success("Link copiado");
                navigator.clipboard.writeText(urlDownload)
              }}
            >
              <RadixText as="div" size="4">
                Copiar
              </RadixText>
            </Button>
            <Button
              variant='solid'
              mr="2"
              onClick={() => {
                window.open(urlDownload, '_blank');
              }}
            >
              <RadixText as="div" size="4">
                ABRIR
              </RadixText>
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};