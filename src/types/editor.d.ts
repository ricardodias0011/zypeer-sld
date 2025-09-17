
// Tipo da shape
export interface Shape {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    src?: string;
    fill?: string;
    isSelected?: boolean;
    type?: 'Rect' | 'Circle' | 'Line' | 'Path' | 'Star' | 'image' | 'Triangle' | 'Text' | 'HTML';
    show?: boolean;
    draggable: boolean;
    text?: string,
    fontSize?: number,
    fontStyle?: string,
    fontWeight?: string;
    fontColor?: string;
    cornerRadius?: number;
    dash?: number[];
    stroke?: string;
    opacity?: number;
    fillLinearGradientStartPoint?: { x: number, y: number };
    fillLinearGradientEndPoint?: { x: number, y: number };
    fillLinearGradientColorStops?: (string | number)[];
    textDecoration?: string;
    strokeWidth?: number | null;
    fontFamily?: string;
    image?: any
    align?: "center" | "right" | "left";
    wrap?: string;
    content?: any;
    points?: number[]
    innerRadius?: number;
    outerRadius?: number;
}