import { useEffect, useState } from 'react';
import type { Shape } from '../../../types/editor';
import { Button, Dialog, Flex, Grid, Popover, Text } from '@radix-ui/themes';
import { PresentationsService } from '../../../services/presentations';
import PreviewSlide from '../preview';
import type { PresentationProject, PresentationSlide } from '../../../types/presentations-sliders';
interface MenuTextType {
  saveHistory: (newShapes: Shape[]) => void;
  slides: PresentationSlide[],
  changeSlides: (e: PresentationSlide[]) => void;
}


export const Templates = (props: MenuTextType) => {
  const { changeSlides } = props;
  const [apresentations, setApresentations] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);

  const getPresentations = () => {
    // setLoading(true);
    PresentationsService.listTemplate()
      .then(({ data }) => {
        setApresentations(data);
      })
    // .finally(() => setLoading(false))
  }

  const ChangeApresentation = (e: PresentationProject) => {
    const slidesOriginais = props.slides as PresentationSlide[];
    const slidesDestino = e.presentations;

    const maxLength = Math.max(slidesOriginais.length, slidesDestino.length);

    const slidesAtualizados: PresentationSlide[] = [];

    for (let i = 0; i < maxLength; i++) {
      const slideOrigem = slidesOriginais[i];
      const slideDestino = slidesDestino[i];

      if (slideOrigem && slideDestino) {
        // Ambos existem, atualiza os texts
        const itemsAtualizados = slideDestino.items.map(itemDestino => {
          if (itemDestino.type !== 'Text') return itemDestino;

          const itemOrigem = slideOrigem.items.find(item => item.id === itemDestino.id && item.type === 'Text');
          return itemOrigem
            ? { ...itemDestino, text: itemOrigem.text }
            : itemDestino;
        });

        slidesAtualizados.push({ ...slideDestino, items: itemsAtualizados });

      } else if (!slideDestino && slideOrigem) {
        // Slide extra do original (adiciona ao final)
        slidesAtualizados.push(slideOrigem);

      } else if (slideDestino && !slideOrigem) {
        // Slide extra do destino (mantém como está)
        slidesAtualizados.push(slideDestino);
      }
    }

    changeSlides(slidesAtualizados);
  };



  useEffect(() => {
    getPresentations();
  })

  return (

    <div className='menu-content'>
      <Flex direction='column' gap="2" mt="2" align="center" justify={"center"}>
        {
          apresentations.map((p) => <PreviewItem key={p.id} project={p} ChangeApresentation={ChangeApresentation} />)
        }
      </Flex>
    </div>

  );
};



const PreviewItem = (props: { project: PresentationProject, ChangeApresentation: (e: PresentationProject) => void }) => {
  const { ChangeApresentation, project: p } = props;
  // const navigate = useNavigate();
  // const [imageBg, setImageBg] = useState(p?.thumbnail);
  const [currentIndex, setCurrentIndex] = useState(0);


  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Grid
          style={{
            borderRadius: 10,
            overflow: "hidden",
            cursor: 'pointer',
            position: 'relative',
            width: 220,

          }}
        // onClick={() => navigate('/docs/' + p.id)}
        >
          <Grid
            width={'220px'}
            height={'110px'}
            position={'relative'}
            overflow={'hidden'}
            style={{ borderRadius: 20 }}
          >
            <PreviewSlide currentSlide={p.presentations[0]} height={110} width={220} />
          </Grid>
        </Grid>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="800px">
        <Flex gap="4" align="center" justify={"center"} direction="column">
          <Flex width={"100%"} align="center" justify={"between"}>
            <Text size={"5"} weight="bold">{p.title}</Text>
            <Popover.Root>
              <Popover.Trigger>
                <Button color="purple" radius="full" style={{ padding: 20 }}>
                  <Text size={"2"} weight="bold">Usar template</Text>
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <Text>Você realmente deseja utilizar um modelo de apresentação? Sua apresentação atual será substituída.  </Text>
                <Flex mt="4" direction="row" gap="2" justify="end">
                  <Popover.Close>
                    <Button color="gray" variant="soft">
                      Fechar
                    </Button>
                  </Popover.Close>
                  <Popover.Close>
                    <Button
                      color="purple"
                      onClick={() => {
                        ChangeApresentation(p)
                      }}>
                      Continuar
                    </Button>
                  </Popover.Close>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>
          <Grid
            width={'680px'}
            height={'400px'}
            mt="4"
            minWidth={'640px'}
            minHeight={'380px'}
            position={'relative'}
            overflow={'hidden'}
            style={{ borderRadius: 10 }}
          >
            <PreviewSlide currentSlide={p.presentations[currentIndex]} height={400} width={860} />
          </Grid>
          <Flex
            gap={'2'}
            mt="4"
            direction="row"
            overflow="auto"
            width="800px"
            py="2"
            px="2"
          >
            {
              p.presentations?.map((_c, index) => (
                <Grid
                  key={_c.id}
                  width={'260px'}
                  height={'150px'}
                  minWidth={'260px'}
                  minHeight={'150px'}
                  position={'relative'}
                  overflow={'hidden'}
                  style={{
                    borderRadius: 20,
                    borderWidth: 4,
                    borderColor: index === currentIndex ? "purple" : "gray",
                    borderStyle: "solid",
                    cursor: "pointer"
                  }}
                  onClick={() => setCurrentIndex(index)}
                >
                  <PreviewSlide currentSlide={_c} height={180} width={260} />
                </Grid>
              ))
            }

          </Flex>
          {/* <Text size={"5"} weight="bold">{p.title}</Text> */}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}