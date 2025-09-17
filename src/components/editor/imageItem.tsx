import type { KonvaEventObject } from 'konva/lib/Node';
import { useEffect, useRef } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

interface Props {
    shape: {
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        src: string;
    };
    isSelected: boolean;
    onSelect: () => void;
    onChange: (attrs: any) => void;
}

export const ImageItem = ({ shape, isSelected, onSelect, onChange }: Props) => {
    const [image] = useImage(shape.src);
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <KonvaImage
                image={image}
                {...shape}
                draggable
                ref={shapeRef}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                    onChange({ x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={_e => {
                    const node = shapeRef.current;
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                    });
                    node.scaleX(1);
                    node.scaleY(1);
                }}
            />
            {isSelected && <Transformer ref={trRef} />}
        </>
    );
};
