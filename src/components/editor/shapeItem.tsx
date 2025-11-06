import { Circle, Line, Path, Rect, Star, Text, Image as KonvaImage } from "react-konva";
import type { Shape } from "../../types/editor";
import { memo, useEffect, useRef } from 'react';
import useImage from "use-image";
import Konva from "konva";

interface ItemShapeProps {
  shape: Shape;
  setSelectedId: (a: {
    id: string,
    type: string
  } | null) => void;
  updateShape: (id: string, attrs: Partial<Shape>, nosServerUpdate?: boolean) => void;
  selectedId?: {
    id: string,
    type: string
  } | null;
  onRef?: (ref: any) => void;
  allShapes: Shape[];
  updateGuideLines: (lines: { points: number[]; stroke: string; strokeWidth: number; }[]) => void;
  onSelect: (id: string, type: string) => void;
  selectedIds: string[];
  onlyPreview?: boolean;
  onTextEditSelcted: (a: Shape | null) => void;
}

const SNAP_THRESHOLD = 2;

const ShapeItem = ({
  shape,
  updateShape,
  selectedId,
  onRef,
  allShapes,
  updateGuideLines,
  onSelect,
  selectedIds,
  onlyPreview,
  onTextEditSelcted
}: ItemShapeProps) => {
  const [image] = useImage(shape.src ?? '', 'anonymous', 'origin');
  // const [divX, setDivX] = useState(shape.x)
  // const [divY, setDivY] = useState(shape.y)
  const shapeRef = useRef<any>(null);
  // const trRef = useRef<any>(null);
  const handleSelect = (e: any) => {
    const isShiftPressed = e.evt?.shiftKey;
    const node = e.target;
    console.log('AAa')
    onSelect(shape.id, isShiftPressed);
    const newPos = checkCollisionsAndSnap(node, allShapes);
    if (shape.type !== 'Circle' && shape.type !== "Star") {
      node.x(newPos.x);
      node.y(newPos.y);
    }
    e.cancelBubble = true;
  };

  // useEffect(() => {
  //   if (shapeRef.current) {
  //     shapeRef.current.cache();
  //   }
  // }, []);

  const handleDragEnd = (e: any) => {
    updateGuideLines([]);
    // setDivX(e.target.x())
    // setDivY(e.target.y())
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };



  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const width = node.width() * node.scaleX()
    const heith = node.height() * node.scaleY()
    if (shape.type === 'Text') {
      updateShape(shape.id, {
        width: node.width() * node.scaleX(),
        // height: node.height() * node.scaleY(),
        fontSize: (shape.fontSize ?? 20) * node.scaleY()
      }, true);
    }
    else if (shape.type === 'Star') {

      updateShape(shape.id, {
        x: node.x(),
        y: node.y(),
        width: width,
        height: heith,
        innerRadius: (width * 20) / 100,
        outerRadius: (heith * 50) / 100,
      });
    }
    else if (shape.type === "Line") {
      const originalWidth = shape.width;
      const originalHeight = shape.height;
      const scaleX = node.width() * node.scaleX() / originalWidth;
      const scaleY = node.height() * node.scaleY() / originalHeight;

      let newPoints: number[] = [];

      shape.points?.forEach((val, index) => {
        const isX = index % 2 === 0;
        const scale = isX ? scaleX : scaleY;
        newPoints.push(val * scale);
      });
      updateShape(shape.id, {
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        points: newPoints
      });
    }
    else {
      updateShape(shape.id, {
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
      });
    }
    node.scaleX(1);
    node.scaleY(1);
    updateGuideLines([]);
  }

  const getAlignmentGuides = (
    draggingRect: any,
    otherRect: any,
    newPos: { x: number; y: number; },
    stageWidth: number,
    stageHeight: number,
    isStage: boolean = false
  ) => {
    const guides: { points: number[]; stroke: string; strokeWidth: number; }[] = [];
    const strokeColor = isStage ? 'blue' : '#8122fd';

    if (Math.abs(draggingRect.x + draggingRect.width / 2 - (otherRect.x + otherRect.width / 2)) < SNAP_THRESHOLD) {
      newPos.x = otherRect.x + otherRect.width / 2 - draggingRect.width / 2;
      guides.push({
        points: [newPos.x + draggingRect.width / 2, 0, newPos.x + draggingRect.width / 2, stageHeight],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    if (Math.abs(draggingRect.x - otherRect.x) < SNAP_THRESHOLD) {
      newPos.x = otherRect.x;
      guides.push({
        points: [newPos.x, 0, newPos.x, stageHeight],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    if (Math.abs(draggingRect.x + draggingRect.width - (otherRect.x + otherRect.width)) < SNAP_THRESHOLD) {
      newPos.x = otherRect.x + otherRect.width - draggingRect.width;
      guides.push({
        points: [newPos.x + draggingRect.width, 0, newPos.x + draggingRect.width, stageHeight],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    if (Math.abs(draggingRect.y + draggingRect.height / 2 - (otherRect.y + otherRect.height / 2)) < SNAP_THRESHOLD) {
      newPos.y = otherRect.y + otherRect.height / 2 - draggingRect.height / 2;
      guides.push({
        points: [0, newPos.y + draggingRect.height / 2, stageWidth, newPos.y + draggingRect.height / 2],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    if (Math.abs(draggingRect.y - otherRect.y) < SNAP_THRESHOLD) {
      newPos.y = otherRect.y;
      guides.push({
        points: [0, newPos.y, stageWidth, newPos.y],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    if (Math.abs(draggingRect.y + draggingRect.height - (otherRect.y + otherRect.height)) < SNAP_THRESHOLD) {
      newPos.y = otherRect.y + otherRect.height - draggingRect.height;
      guides.push({
        points: [0, newPos.y + draggingRect.height, stageWidth, newPos.y + draggingRect.height],
        stroke: strokeColor,
        strokeWidth: 1
      });
    }

    return guides;
  };


  const checkCollisionsAndSnap = (node: any, allShapes: Shape[]) => {
    const strokeColor = '#8122fd';
    const strokeColor2 = '#b980fa'
    const draggingRect = node.getClientRect();
    const newPos = { x: node.x(), y: node.y() };
    let newGuideLines: {
      points: number[];
      stroke: string;
      strokeWidth: number;
      label?: string;
      labelPos?: [number, number];
    }[] = [];

    const stage = node.getStage();
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    allShapes.forEach(otherShape => {
      if (otherShape.id === shape.id) return;
      const otherNode = stage.findOne(`#${otherShape.id}`);
      if (!otherNode) return;
      const otherRect = otherNode.getClientRect();
      newGuideLines = newGuideLines.concat(getAlignmentGuides(draggingRect, otherRect, newPos, stageWidth, stageHeight, false));
    });

    const stageRect = { x: 0, y: 0, width: stageWidth, height: stageHeight };
    newGuideLines = newGuideLines.concat(getAlignmentGuides(draggingRect, stageRect, newPos, stageWidth, stageHeight, true));

    allShapes.forEach(otherShape => {
      if (otherShape.id === shape.id) return; // Não compara consigo mesmo

      const otherNode = stage.findOne(`#${otherShape.id}`);
      if (!otherNode) return;
      const otherRect = otherNode.getClientRect();

      const SPACE_THRESHOLD = 200;

      const spaceRightOfOther = draggingRect.x - (otherRect.x + otherRect.width);
      if (spaceRightOfOther > 0 && spaceRightOfOther < SPACE_THRESHOLD) {
        const lineY = Math.min(draggingRect.y + draggingRect.height, otherRect.y + otherRect.height) + 10;
        const labelY = lineY - 15;
        const labelX = (otherRect.x + otherRect.width + draggingRect.x) / 2;

        newGuideLines.push(
          {
            points: [otherRect.x + otherRect.width, lineY, draggingRect.x, lineY],
            stroke: strokeColor2,
            strokeWidth: 1,
            label: `${Math.round(spaceRightOfOther)}px`,
            labelPos: [labelX, labelY]
          },

          { points: [otherRect.x + otherRect.width, lineY - 5, otherRect.x + otherRect.width, lineY + 5], stroke: strokeColor2, strokeWidth: 1 },
          { points: [draggingRect.x, lineY - 5, draggingRect.x, lineY + 5], stroke: strokeColor2, strokeWidth: 1 }
        );
      }

      const spaceLeftOfOther = otherRect.x - (draggingRect.x + draggingRect.width);
      if (spaceLeftOfOther > 0 && spaceLeftOfOther < SPACE_THRESHOLD) {
        const lineY = Math.min(draggingRect.y + draggingRect.height, otherRect.y + otherRect.height) + 10;
        const labelY = lineY - 15;
        const labelX = (draggingRect.x + draggingRect.width + otherRect.x) / 2;

        newGuideLines.push(
          {
            points: [draggingRect.x + draggingRect.width, lineY, otherRect.x, lineY],
            stroke: strokeColor2,
            strokeWidth: 1,
            label: `${Math.round(spaceLeftOfOther)}px`,
            labelPos: [labelX, labelY]
          },
          { points: [draggingRect.x + draggingRect.width, lineY - 5, draggingRect.x + draggingRect.width, lineY + 5], stroke: strokeColor2, strokeWidth: 1 },
          { points: [otherRect.x, lineY - 5, otherRect.x, lineY + 5], stroke: strokeColor2, strokeWidth: 1 }
        );
      }
      const spaceBelowOther = draggingRect.y - (otherRect.y + otherRect.height);
      if (spaceBelowOther > 0 && spaceBelowOther < SPACE_THRESHOLD) {
        const lineX = Math.min(draggingRect.x + draggingRect.width, otherRect.x + otherRect.width) + 10;
        const labelX = lineX + 15;
        const labelY = (otherRect.y + otherRect.height + draggingRect.y) / 2;

        newGuideLines.push(
          {
            points: [lineX, otherRect.y + otherRect.height, lineX, draggingRect.y],
            stroke: strokeColor2,
            strokeWidth: 1,
            label: `${Math.round(spaceBelowOther)}px`,
            labelPos: [labelX, labelY]
          },
          { points: [lineX - 5, otherRect.y + otherRect.height, lineX + 5, otherRect.y + otherRect.height], stroke: strokeColor2, strokeWidth: 1 },
          { points: [lineX - 5, draggingRect.y, lineX + 5, draggingRect.y], stroke: strokeColor2, strokeWidth: 1 }
        );
      }

      const spaceAboveOther = otherRect.y - (draggingRect.y + draggingRect.height);
      if (spaceAboveOther > 0 && spaceAboveOther < SPACE_THRESHOLD) {
        const lineX = Math.min(draggingRect.x + draggingRect.width, otherRect.x + otherRect.width) + 10;
        const labelX = lineX + 15;
        const labelY = (draggingRect.y + draggingRect.height + otherRect.y) / 2;

        newGuideLines.push(
          {
            points: [lineX, draggingRect.y + draggingRect.height, lineX, otherRect.y],
            stroke: strokeColor2,
            strokeWidth: 1,
            label: `${Math.round(spaceAboveOther)}px`,
            labelPos: [labelX, labelY]
          },
          { points: [lineX - 5, draggingRect.y + draggingRect.height, lineX + 5, draggingRect.y + draggingRect.height], stroke: strokeColor2, strokeWidth: 1 },
          { points: [lineX - 5, otherRect.y, lineX + 5, otherRect.y], stroke: strokeColor2, strokeWidth: 1 }
        );
      }
    });

    allShapes.forEach(otherShape1 => {
      if (otherShape1.id === shape.id) return;
      const otherNode1 = stage.findOne(`#${otherShape1.id}`);
      if (!otherNode1) return;
      const otherRect1 = otherNode1.getClientRect();

      allShapes.forEach(otherShape2 => {
        if (otherShape2.id === shape.id || otherShape2.id === otherShape1.id) return;
        const otherNode2 = stage.findOne(`#${otherShape2.id}`);
        if (!otherNode2) return;
        const otherRect2 = otherNode2.getClientRect();

        if (
          draggingRect.x > otherRect1.x + otherRect1.width &&
          draggingRect.x + draggingRect.width < otherRect2.x &&
          Math.abs((draggingRect.x - (otherRect1.x + otherRect1.width)) - (otherRect2.x - (draggingRect.x + draggingRect.width))) < SNAP_THRESHOLD
        ) {
          const spacing = (otherRect2.x - (draggingRect.x + draggingRect.width));
          const targetSpacing = (draggingRect.x - (otherRect1.x + otherRect1.width) + spacing) / 2;
          newPos.x = (otherRect1.x + otherRect1.width) + targetSpacing;

          const y = otherRect1.y + otherRect1.height + 10;
          newGuideLines.push(
            { points: [otherRect1.x + otherRect1.width, y, newPos.x, y], stroke: strokeColor, strokeWidth: 1 },
            { points: [newPos.x + draggingRect.width, y, otherRect2.x, y], stroke: strokeColor, strokeWidth: 1 },
            { points: [otherRect1.x + otherRect1.width, y - 5, otherRect1.x + otherRect1.width, y + 5], stroke: strokeColor, strokeWidth: 1 },
            { points: [newPos.x, y - 5, newPos.x, y + 5], stroke: strokeColor, strokeWidth: 1 },
            { points: [newPos.x + draggingRect.width, y - 5, newPos.x + draggingRect.width, y + 5], stroke: strokeColor, strokeWidth: 1 },
            { points: [otherRect2.x, y - 5, otherRect2.x, y + 5], stroke: strokeColor, strokeWidth: 1 }
          );
        }

        if (
          draggingRect.y > otherRect1.y + otherRect1.height &&
          draggingRect.y + draggingRect.height < otherRect2.y &&
          Math.abs((draggingRect.y - (otherRect1.y + otherRect1.height)) - (otherRect2.y - (draggingRect.y + draggingRect.height))) < SNAP_THRESHOLD
        ) {
          const spacing = (otherRect2.y - (draggingRect.y + draggingRect.height));
          const targetSpacing = (draggingRect.y - (otherRect1.y + otherRect1.height) + spacing) / 2;
          newPos.y = (otherRect1.y + otherRect1.height) + targetSpacing;

          const x = otherRect1.x + otherRect1.width + 10;
          newGuideLines.push(
            { points: [x, otherRect1.y + otherRect1.height, x, newPos.y], stroke: strokeColor, strokeWidth: 1 },
            { points: [x, newPos.y + draggingRect.height, x, otherRect2.y], stroke: strokeColor, strokeWidth: 1 },
            { points: [x - 5, otherRect1.y + otherRect1.height, x + 5, otherRect1.y + otherRect1.height], stroke: strokeColor, strokeWidth: 1 },
            { points: [x - 5, newPos.y, x + 5, newPos.y], stroke: strokeColor, strokeWidth: 1 },
            { points: [x - 5, newPos.y + draggingRect.height, x + 5, newPos.y + draggingRect.height], stroke: strokeColor, strokeWidth: 1 },
            { points: [x - 5, otherRect2.y, x + 5, otherRect2.y], stroke: strokeColor, strokeWidth: 1 }
          );
        }
      });
    });

    updateGuideLines(newGuideLines);
    return newPos;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedIds.includes(shape.id)) return;
      // @ts-ignore
      const tag = event.target.tagName?.toLowerCase();
      if (["textarea", "input"].includes(tag)) return

      const node = shapeRef.current;
      if (!node) return;

      const offset = 5;
      let moved = false;

      switch (event.key) {
        case 'ArrowRight':
          node.x(node.x() + offset);
          // setDivX(node.x() + offset);
          moved = true;
          break;
        case 'ArrowLeft':
          node.x(node.x() - offset);
          // setDivX(node.x() - offset);

          moved = true;
          break;
        case 'ArrowUp':
          node.y(node.y() - offset);
          // setDivY(node.y() - offset);
          moved = true;
          break;
        case 'ArrowDown':
          node.y(node.y() + offset);
          // setDivY(node.y() + offset);
          moved = true;
          break;
        default:
          break;
      }

      if (moved) {
        event.preventDefault();

        const newX = node.x();
        const newY = node.y();

        updateShape(shape.id, {
          x: newX,
          y: newY
        });

        checkCollisionsAndSnap(node, allShapes);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, shape.id, allShapes]);



  const commonProps: any = {
    ...shape,
    draggable: shape.draggable,
    onClick: handleSelect,
    onTap: handleSelect,
    onDragEnd: handleDragEnd,
    ...(shape.type === 'Text' ?
      {
        onTransform: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd({
          ...e
        }),
      }
      : {
      }),
    onTransformEnd: handleTransformEnd,
    onDragMove: (e: any) => {
      const node = e.target;
      const newPos = checkCollisionsAndSnap(node, allShapes);
      if (shape.type !== 'Circle' && shape.type !== "Star") {
        node.x(newPos.x);
        node.y(newPos.y);
      }
      // node.x(newPos.x);
      // node.y(newPos.y);
    }
  };

  useEffect(() => {
    if (selectedIds?.length === 0) {
      updateGuideLines([]);

    }
  }, [selectedIds]);

  useEffect(() => {
    if (selectedId?.id === shape.id && shapeRef.current && onRef) {
      onRef(shapeRef.current);
    } else {
      updateGuideLines([]);
    }
  }, [selectedId]);

  useEffect(() => {
    if (shape?.fontFamily) {

    }
  }, [shape, allShapes])

  return (
    <>
      {(() => {
        switch (shape.type) {
          case 'image':
            if (image) {
              return <KonvaImage
                image={image}
                ref={shapeRef}
                {...commonProps}
                draggable={!onlyPreview && commonProps.draggable}

              />
            } else {
              return null
            }

          case 'Line':
            return <Line
              ref={shapeRef}
              {...commonProps}
              draggable={!onlyPreview && commonProps.draggable}
            />;

          // case 'HTML':
          //   return <React.Fragment>

          //     <Html
          //       divProps={{
          //         style: { position: 'absolute' }
          //       }}
          //       // ref={shapeRef}
          //       {...commonProps}
          //       transformFunc={(transformAttrs) => ({
          //         ...transformAttrs,
          //         y: divY,
          //         x: divX,
          //         scaleX: 1,
          //         scaleY: 1
          //       })}

          //     >
          //       <button
          //         onClick={() => handleSelect(shapeRef.current)}
          //         onMouseUp={() => console.log('aaa')}
          //         draggable
          //         onDragStart={() => console.log("2123451231")}
          //         onDrag={() => {
          //           console.log('345474556')
          //         }}
          //         style={{
          //           width: commonProps.width + 'px',
          //           height: commonProps.height + 'px',
          //           position: 'absolute'
          //         }}></button>
          //       <div
          //         onClick={() => console.log(shapeRef.current)}
          //         dangerouslySetInnerHTML={{ __html: commonProps?.content }}
          //         style={{
          //           width: commonProps.width + 'px',
          //           height: commonProps.height + 'px',
          //           overflow: 'auto'
          //         }}
          //       />
          //     </Html>
          //     <Rect
          //       {...commonProps}
          //       fill="#45487855"
          //       strokeEnabled={false}
          //       opacity={.0}
          //       ref={shapeRef}
          //       draggable={!onlyPreview && commonProps.draggable}
          //     />
          //   </React.Fragment>;
          case 'Circle':
            return <Circle
              ref={shapeRef}
              {...commonProps}
              {...shape}
              draggable={!onlyPreview && commonProps.draggable}
              radius={shape.width / 2} />;
          case 'Rect':
            return <Rect
              ref={shapeRef}
              {...commonProps}
              draggable={!onlyPreview && commonProps.draggable}
            />;
          case 'Star':
            return <Star ref={shapeRef}
              {...commonProps}
              draggable={!onlyPreview && commonProps.draggable}
            />;
          case 'Path':
            return <Path ref={shapeRef}
              {...commonProps}
              draggable={!onlyPreview && commonProps.draggable}
              _useStrictMode
            />;
          case 'Text':

            return <Text
              text={shape?.text}
              ref={shapeRef}
              {...commonProps}
              draggable={!onlyPreview && commonProps.draggable}
              visible={selectedId?.id !== shape.id}
              onClick={() => {
                onTextEditSelcted(shape)
              }}
              onDblClick={() => {
                onTextEditSelcted(shape)
              }}
            />
          default:
            return null;
        }
      })()}
      {/* {!onlyPreview && selectedId?.id === shape.id && <Transformer ref={trRef} />} */}
    </>
  );
};

export default memo(ShapeItem);