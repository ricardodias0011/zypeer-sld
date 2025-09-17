import { v4 } from 'uuid';
import { initialShapes } from '../../../utils/shapes';
import type { Shape } from '../../../types/editor';
import { Flex, Text } from '@radix-ui/themes';

interface MenuShapes {
  saveHistory: (newShapes: Shape[]) => void;
  shapes: Shape[]
}

export const MenuShapes = (props: MenuShapes) => {

  const { saveHistory, shapes } = props;

  return (
    <div className='menu-content' style={{ gap: 25 }}>
      <div style={{ width: "100%" }}>
        <Text size={'4'} weight="bold" align="left">Formas</Text>
        <Flex mt="4" gap={'2'} wrap="wrap">
          {
            initialShapes.map((shape) => (
              <button className='content-img-view' onClick={() => {
                const newShape: any = {
                  ...shape,
                  id: v4(),
                  show: true
                };
                saveHistory([...shapes, newShape]);
              }}>
                <img width={50} alt={shape.title}
                  src={shape.img}
                />
              </button>
            ))
          }
        </Flex >
      </div>
      {/* <div style={{ width: "100%" }}>
        <Text size={'4'} weight="bold" align="left">Tabelas</Text>
        <Flex mt="4" gap={'2'} wrap="wrap">
          <Button onClick={() => {
            const newContent: Shape = {
              id: v4(),
              x: 100,
              y: 100,
              content: `
              <div style="background-color: red; width: 100%; height: 100%;">
              </div>
              `,
              fontSize: 28,
              fontStyle: 'bold',
              type: 'HTML',
              draggable: true,
              show: true,
              fill: '#131313',
              wrap: "word",
              strokeWidth: 0,
              align: "left",
              width: 100,
              height: 100
            };
            saveHistory([...shapes, newContent]);
          }}>
            Tabela
          </Button>
        </Flex>
        <div style={{}}></div>
      </div> */}
    </div>
  );
};