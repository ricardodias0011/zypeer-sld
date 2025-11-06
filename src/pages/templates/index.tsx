import { useEffect, useState } from "react"
import { PresentationsService } from "../../services/presentations";
import useAuth from "../../context/auth";
import { Button, Dialog, Flex, Grid, Text } from "@radix-ui/themes";
import moment from "moment"
import { useNavigate } from "react-router-dom";
import type { PresentationProject } from "../../types/presentations-sliders";
import PreviewSlide from "../../components/editor/preview";

moment.locale('pt-br');
const TemplatesPage = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user)
      getPresentations();
  }, [user])

  return (
    <Flex gap={"4"} p="4" direction="column" width={"100%"}>
      <Text size={'5'} weight={"bold"}>
        Modelos
      </Text>
      <Flex gap={"4"} wrap="wrap" mt="8">
        {
          apresentations.map((p) => <PreviewItem {...p} />)
        }
      </Flex>
    </Flex>
  )
}

export default TemplatesPage;


const PreviewItem = (p: PresentationProject) => {
  const navigate = useNavigate();
  // const [imageBg, setImageBg] = useState(p?.thumbnail);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);


  const CreateApresentation = () => {
    setLoading(true)
    PresentationsService.create({
      title: p.title + " (copy)",
      templateId: p.id
    })
      .then(({ data }) => {
        navigate("/docs/" + data?.id);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Grid
          style={{
            borderRadius: 10,
            overflow: "hidden",
            cursor: 'pointer',
            position: 'relative',
            width: 280,

          }}
        // onClick={() => navigate('/docs/' + p.id)}
        >
          <Grid
            width={'280px'}
            height={'150px'}
            position={'relative'}
            overflow={'hidden'}
            style={{ borderRadius: 20 }}
          >
            <PreviewSlide currentSlide={p.presentations[0]} height={160} width={280} />
          </Grid>
          <Flex direction={"column"} gap={"2"} p={"4"}>
            <Text weight="light" size={'3'} style={{ fontFamily: "Poppins" }}>
              {p.title}
            </Text>
          </Flex>
        </Grid>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="800px">
        <Flex gap="4" align="center" justify={"center"} direction="column">
          <Flex width={"100%"} align="center" justify={"between"}>
            <Text size={"5"} weight="bold">{p.title}</Text>
            <Button color="cyan" radius="full" style={{ padding: 20 }} disabled={loading} onClick={CreateApresentation}>
              <Text size={"2"} weight="bold">Usar template</Text>
            </Button>
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
                    borderColor: index === currentIndex ? "cyan" : "gray",
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