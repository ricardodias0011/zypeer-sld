import type { Shape } from '../types/editor';

interface initialShapesTypes extends Shape {
    img: string;
    fill: string;
    title: string;
    radius?: number;
    numPoints?: number;
    innerRadius?: number;
    outerRadius?: number;
    points?: number[];
    closed?: boolean;
    data?: string;
    scale?: { x: number, y: number }
    lineCap?: string;
    lineJoin?: string;

}
export const initialShapes: initialShapesTypes[] = [
    {
        id: '',
        type: 'Rect',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        fill: '#131313',
        title: 'Quadrado',
        img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/square.png",
        draggable: true
    },
    {
        id: '',
        type: 'Circle',
        x: 200,
        y: 50,
        radius: 50,
        fill: '#131313',
        title: 'Círculo',
        img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/round.png",
        width: 100,
        height: 100,
        draggable: true
    },
    // {
    //     id: '',
    //     type: 'Rect',
    //     x: 350,
    //     y: 50,
    //     width: 150,
    //     height: 100,
    //     fill: '#131313',
    //     title: 'Retângulo',
    //     img: ''
    // },
    {
        id: '',
        type: 'Line',
        x: 550,
        points: [0, 100, 50, 0, 100, 100],
        closed: true,
        y: 50,
        width: 100,
        height: 100,
        fill: '#131313',
        title: 'Triângulo',
        img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/triangle.png",
        draggable: true
    },
    // {
    //     id: '',
    //     type: 'Path',
    //     x: 50,
    //     y: 50,
    //     width: 100,
    //     height: 100,
    //     fill: '#131313',
    //     scale: { x: 0.15, y: 0.15 },
    //     title: 'Coração',
    //     data: "M471.7 73.1c-54.5-46.4-136-38.3-186.4 13.7l-19.3 20-19.3-20C197.3 34.8 115.7 26.7 61.2 73.1c-62 52.8-66.1 149.8-9.9 207.1l193.5 199.8c6.2 6.4 16.4 6.4 22.6 0l193.5-199.8c56.1-57.3 52-154.3-9.2-207.1z",
    //     img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/heart.png",
    //     draggable: true

    // },
    {
        id: '',
        type: 'Star',
        x: 50,
        y: 50,
        numPoints: 5,
        innerRadius: 20,
        outerRadius: 50,
        width: 100,
        height: 100,
        fill: '#131313',
        title: 'Estrela',
        img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/star.png",
        draggable: true
    },
    // {
    //     id: '',
    //     type: 'Path',
    //     x: 50,
    //     y: 50,
    //     width: 100,
    //     height: 100,
    //     fill: '#131313',
    //     scale: { x: 0.5, y: 0.5 },
    //     title: 'Sinal de Mais',
    //     data: "M 00 H 0.50.5 11 M 00 V 0.50.5 11 M 00 H -0.5-0.5 -1-1 M 00 V -0.5-0.5 -1-1",
    //     img: "https://nexusclassapp.s3.us-east-2.amazonaws.com/zypeer/app/intr/shapes/plus.png",
    //     draggable: true
    // },
    // {
    //     points: [5, 70, 140, 23, 250, 60, 300, 20],
    //     stroke: '#131313',
    //     strokeWidth: 15,
    //     lineCap: 'round',
    //     lineJoin: 'round',
    //     id: '',
    //     type: 'Line',
    //     img: '',
    //     fill: '',
    //     title: '',
    //     x: 50,
    //     y: 50,
    //     width: 300,
    //     height: 100,
    //     draggable: true
    // },
    // {
    //     points: [5, 70, 140, 23, 250, 60, 300, 20],
    //     stroke: '#131313',
    //     strokeWidth: 2,
    //     lineJoin: 'round',
    //     type: 'Line',
    //     dash: [33, 10],
    //     id: '',
    //     img: '',
    //     fill: '',
    //     title: '',
    //     x: 50,
    //     y: 50,
    //     width: 300,
    //     height: 100,
    //     draggable: true
    // }
];
