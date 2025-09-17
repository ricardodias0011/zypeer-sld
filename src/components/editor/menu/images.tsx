import { v4 } from 'uuid';
import type { Shape } from '../../../types/editor';
import { AssetsService } from '../../../services/assets';
import { memo, useRef, useState } from 'react';
import type { FilesProps } from '../../../types/user';
import { Button, Flex } from '@radix-ui/themes';
import useQuery from '../../../hooks/useQuery';
import type { PresentationSlide } from '../../../types/presentations-sliders';

interface MenuImagesProps {
  saveHistory: (newShapes: Shape[]) => void;
  shapes: Shape[]
  assets: FilesProps[];
  reload: VoidFunction;
  currentSlide: PresentationSlide | null;
  updateVariablesSlide: (a: PresentationSlide) => void;
  updateShape: (id: string, attrs: Partial<Shape>, nosServerUpdate?: boolean) => void;
  selectedShape?: string;
}


const MenuImages = (props: MenuImagesProps) => {
  const { query, handleChangeQuery } = useQuery();
  const replaceImage = query.get("replace_bg_img");
  const replaceShapeImage = query.get("replace_img");
  const { saveHistory, shapes, assets, reload, currentSlide, updateVariablesSlide, updateShape } = props;
  const [loadingImage, setLoadingImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        setLoadingImage(URL.createObjectURL(file))
        const { data } = await AssetsService.upload(file, "assets")
        if (data) {
          reload();
          setLoadingImage("");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.log(err)
    }
    finally {
      setLoadingImage("")
    }
  };


  return (

    <div className='menu-content'>
      <Flex position={'relative'}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={!!loadingImage}
          style={{ display: 'box', position: 'absolute', opacity: 0 }}
          onChange={handleImageUpload}
        />
        <Button
          variant="solid"
          style={{ width: '100%' }}
          disabled={!!loadingImage}
          onClick={handleTriggerUpload}
          size={'2'}
          color='purple'>
          Faça upload do arquivo
        </Button>
      </Flex>

      {
        assets.map((p) => (
          <button onClick={() => {
            // const img = new Image();
            // img.crossOrigin = 'anonymous';
            // img.src = p.link;
            if (replaceImage && currentSlide) {
              updateVariablesSlide({
                ...currentSlide,
                background: {
                  type: 'image',
                  color: '',
                  url: p.link,
                }
              });
              handleChangeQuery(null, 'replace_bg_img')
              return
            }
            const currnetShape = shapes.find(a => a.id === replaceShapeImage)
            console.log(currnetShape)
            if (replaceShapeImage && currnetShape && currnetShape.type === 'image') {
              updateShape(currnetShape.id, {
                src: p.link,
                strokeWidth: 0
              })
              handleChangeQuery(null, 'replace_img')
              return
            }
            const newImage: Shape = {
              id: v4(),
              x: 100,
              y: 100,
              width: 480,
              height: 480,
              src: p.link,
              type: 'image',
              // image: img,
              draggable: true,
              show: true,
              fill: '',
              strokeWidth: 0
            };
            saveHistory([...shapes, newImage]);
          }}>
            <img width={100} alt={p.filename}
              src={p.link}
            />
          </button>
        ))
      }
      {
        loadingImage ?
          <button
            disabled
            style={{ opacity: .4 }}
            onClick={() => {
            }}>
            <img width={100} alt={"uploading..."}
              src={loadingImage}
            />
          </button>
          : <></>
      }

    </div>

  );
};

export default memo(MenuImages)