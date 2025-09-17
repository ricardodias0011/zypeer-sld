import { v4 } from 'uuid';
import type { Shape } from '../../../types/editor';
import { RxText } from 'react-icons/rx';
import { Button, Flex, Text } from '@radix-ui/themes';
import { fontOptions } from '../../../utils/fonts';
interface MenuTextType {
  saveHistory: (newShapes: Shape[]) => void;
  shapes: Shape[],
}


export const MenuText = (props: MenuTextType) => {

  const { saveHistory, shapes } = props;

  const addNewText = (props: any) => {
    const newText: Shape = {
      id: v4(),
      x: 100,
      y: 100,
      text: 'Seu texto aqui',
      fontSize: 28,
      fontStyle: 'bold',
      type: 'Text',
      draggable: true,
      show: true,
      fill: '#131313',
      wrap: "word",
      strokeWidth: 0,
      align: "left",
      ...props
    };
    saveHistory([...shapes, newText]);
  }

  return (

    <div className='menu-content'>
      <Button
        style={{
          // color: 'white',
          width: '180px',
          // borderRadius: '.5rem',
          // fontFamily: 'Poppins',
          // fontWeight: 'bold',
          // display: 'flex',
          // alignItems: 'center',
          // justifyContent: 'center',
          // fontSize: 14,
          // gap: 5
        }}
        variant='outline'
        color='gray'
        onClick={() => addNewText({})}>
        <RxText size={22} />
        <div>
          Adicionar texto
        </div>
      </Button>
      <Flex direction='column' gap="2" mt="2">
        {
          fontOptions.map(({ label, value }, _i) => (
            <button
              key={`${value}-${_i + 1}`}
              style={{
                fontSize: 26,
                color: 'black',
                padding: 5,
                borderBottom: '1px solid',
                borderColor: '#e5e5e5'
              }}
              onClick={() => addNewText({
                fontFamily: value
              })}
            >
              <Text
                style={{
                  fontFamily: `${value}, sans-serif`,
                  flexGrow: 1
                }}>
                {label}
              </Text>
            </button>
          ))
        }

      </Flex>
    </div>

  );
};