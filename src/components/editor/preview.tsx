import { forwardRef } from "react";
import { Circle, Line, Path, Rect, Star, Text, Image as KonvaImage, Stage, Layer } from "react-konva";
import type { PresentationSlide } from "../../types/presentations-sliders";
import useImage from "use-image";
import { useEffect, useState } from "react";
import type Konva from "konva";

const PreviewSlide = forwardRef<Konva.Stage, {
  currentSlide: PresentationSlide | null;
  width?: number;
  height?: number;
}>((props, ref) => {
  const { currentSlide, width, height } = props;
  const larguraPreview = width ?? 120;
  const alturaPreview = height ?? 75;

  const scale = Math.min(larguraPreview / 1920, alturaPreview / 1080);

  const [gradientXY, setGradientXY] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  })

  const getGradientBackground = () => {
    const _width = (1920) / 1.25;
    const _height = (1080) / 1.5;
    const angleInDeg = 90;
    const angle = ((180 - angleInDeg) / 180) * Math.PI;
    const length = Math.abs(_width * Math.sin(angle)) + Math.abs(_height * Math.cos(angle));
    const halfx = (Math.sin(angle) * length) / 2.0;
    const halfy = (Math.cos(angle) * length) / 2.0;
    const cx = _width / 2.0;
    const cy = _height / 2.0;
    const x1 = cx - halfx;
    const y1 = cy - halfy;
    const x2 = cx + halfx;
    const y2 = cy + halfy;
    setGradientXY({
      x1,
      y1,
      x2,
      y2
    })
  }

  useEffect(() => {
    if (currentSlide?.background?.type === 'gradient') {
      getGradientBackground()
    }
  }, [currentSlide])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.3s ease",
        transformOrigin: "center center"
      }}
      className='canva-wrapper'
    >
      <Stage ref={ref} width={1920} height={1080}
        style={{ pointerEvents: "none" }}
      >
        <Layer>
          {/* Fundo via Konva */}
          {currentSlide?.background?.type === 'color' && (
            <Rect
              x={0}
              y={0}
              width={1920}
              height={1080}
              fill={(currentSlide.background.color as string) ?? '#fff'}
            />
          )}

          {currentSlide?.background?.type === 'gradient' && Array.isArray(currentSlide?.background?.color) && (
            <Rect
              x={0}
              y={0}
              width={1920}
              height={1080}
              fillLinearGradientStartPoint={{ x: gradientXY.x1, y: gradientXY.y1 }}
              fillLinearGradientEndPoint={{ x: gradientXY.x2, y: gradientXY.y2 }}
              fillLinearGradientColorStops={currentSlide.background.color as (string | number)[]}
            />
          )}

          {currentSlide?.background?.type === 'image' && (
            <BackgroundImage src={currentSlide.background.url as string} />
          )}
          {currentSlide?.items.map(shape =>
            shape.show ? <ItemShape key={shape.id} {...shape} /> : null
          )}
        </Layer>
      </Stage>
    </div>

  )
});

export default PreviewSlide;

// helper para fundo de imagem
function BackgroundImage({ src }: { src: string }) {
  const [image] = useImage(src);
  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={1920}
      height={1080}
    />
  );
}


const ItemShape = (shape: any) => {
  const [image] = useImage(shape.src ?? '', 'anonymous');

  return (
    <>
      {
        (() => {
          switch (shape.type) {
            case 'image':
              return <KonvaImage
                {...shape}
                image={image}
                draggable={false}

              />
            case 'Line':
              return <Line
                {...shape}
                draggable={false}
              />;
            case 'Circle':
              return <Circle
                {...shape}
                draggable={false}
                radius={shape.width / 2} />;
            case 'Rect':
              return <Rect
                {...shape}
                draggable={false}
              />;
            case 'Star':
              return <Star
                {...shape}
                draggable={false}
              />;
            case 'Path':
              return <Path
                {...shape}
                draggable={false}
              />;
            case 'Text':

              return <Text
                {...shape}
                text={shape?.text}
                draggable={false}

              />
            default:
              return null;
          }
        })()
      }
    </>
  )

}