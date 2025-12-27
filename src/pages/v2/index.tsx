import { useEffect, useState } from "react"
import { PresentationsService } from "../../services/presentations";
import useAuth from "../../context/auth";
import { Box, Button, Dialog, Flex, Grid, Text, TextField, Select, Slider, Popover, IconButton, Badge } from "@radix-ui/themes";
import { BsStars } from "react-icons/bs";
import { FiLock } from "react-icons/fi";
import moment from "moment"
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { PresentationProject } from "../../types/presentations-sliders";
import PreviewSlide from "../../components/editor/preview";
import ApresentatioAlien from "../../assets/alien-apresentation.png";
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { AcademicService } from "../../services/academic";
import type { AdemicSubjectsProps } from "../../types/academic";
import { EventsService } from "../../services/events";
import { PiDotsThreeVertical } from "react-icons/pi";

interface CreateApresentationProps {
  title: string,
  disciplineId?: string,
  topic: string,
  numberOfSlides: number;
  context?: string,
  isIa: boolean
}

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apresentations, setApresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<AdemicSubjectsProps[]>([]);
  const [eventID, setEventID] = useState<string | null>("");
  const [statusCreate, setStatusCreate] = useState(0);

  const getSubjects = () => {
    AcademicService.listSubjects()
      .then(({ data }) => {
        setSubjects(data)
      })
  }

  const getPresentations = () => {
    PresentationsService.list()
      .then(({ data }) => {
        setApresentations(data);
      })
  }

  const CreateApresentation = (_data: CreateApresentationProps) => {
    setLoading(true)
    PresentationsService.create(_data)
      .then(({ data }) => {
        if (_data.isIa) {
          setEventID(data?.id)
        } else {
          navigate("/docs/" + data?.id);
        }
      })
      .finally(() => {
        if (!_data.isIa) {
          setLoading(false)
        }
      })
  }

  useEffect(() => {
    if (eventID) {
      const interval = setInterval(() => {
        EventsService.consult("presentation", eventID ?? "")
          .then(({ data }) => {
            if (data?.status) {
              setStatusCreate(data.status);
              if (data.status === 0) {
                clearInterval(interval);
                return
              }
              if (data.status === 4 && data?.metadata) {
                setTimeout(() => {
                  navigate("/docs/" + data?.metadata?.[0].id);
                })
                clearInterval(interval);
              }
            }
          })
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [eventID]);

  useEffect(() => {
    if (user) {
      getPresentations();
      getSubjects();
    }
  }, [user])

  return (
    <Flex gap={"4"} p="4" direction="column" width={"100%"}>
      <Text size={'5'} weight={"bold"}>
        Seus Slides
      </Text>
      <Flex gap={"4"} wrap={"wrap"} width={"100%"}>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button className="btn-gradient w-full min-w-[100%]! md:min-w-[240px]!" style={{ padding: 20 }} radius="full">
              <BsStars size={20} />
              <Text weight="medium" size={'3'}>
                Criar com IA
              </Text>
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>Novo slide</Dialog.Title>
            <CreateSlide CreateApresentation={CreateApresentation} type="auto" loading={loading} subjects={subjects} statusCreate={statusCreate} />
          </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button color="blue" className="min-w-[100%]! md:min-w-[240px]!" variant="soft" style={{ padding: 20 }} radius="full">
              <FaPlus />
              <Text weight="medium" size={'3'}>
                Criar novo em branco
              </Text>
            </Button>
          </Dialog.Trigger>
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>Novo slides</Dialog.Title>
            <CreateSlide CreateApresentation={CreateApresentation} type="normal" loading={loading} subjects={subjects} statusCreate={statusCreate} />
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
      <Flex gap={"4"} wrap="wrap">
        {
          apresentations.map((p) => <PreviewItem key={p.id} project={p} reload={getPresentations} />)
        }
      </Flex>
    </Flex>
  )
}

export default HomePage;


const PreviewItem = (props: { project: PresentationProject, reload: () => void; }) => {
  const { project: p, reload } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(p.title);

  const updateProject = () => {
    setLoading(true)
    PresentationsService.update({
      title
    }, p.id)
      .then(() => {
        reload();
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const deletePresentation = () => {
    setLoading(true)
    PresentationsService.delete(p.id)
      .then(() => {
        reload();
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Grid
      style={{
        borderRadius: 21,
        overflow: "hidden",
        cursor: 'pointer',
        position: 'relative',
        width: 280,
        border: '1px solid var(--gray-a5)',
        boxShadow: 'var(--shadow-3)',
      }}
      className="w-[100%]! md:w-[280px]! bg-white"
    >
      <Grid
        className="w-[100%]! md:w-[280px]!"
        height={'150px'}
        position={'relative'}
        overflow={'hidden'}
        style={{ borderRadius: 20 }}
        onClick={() => navigate('/docs/' + p.id)}
      >
        <PreviewSlide currentSlide={p.presentations[0]} height={160} width={280} />
      </Grid>
      <Flex direction={"column"} gap={"2"} p={"4"}>
        <Text weight="light" size={'3'} style={{ fontFamily: "Poppins" }}>
          {p.title}
        </Text>
        <Flex gap={"2"} direction={"row"} align={"center"} justify="between">
          <Badge color="gray" variant="soft" radius="full" size="1">
            <FiLock size={12} style={{ marginRight: '4px' }} />
            Privado
          </Badge>
          <Box>
            <Popover.Root>
              <Popover.Trigger>
                <IconButton variant="ghost" color="gray">
                  <PiDotsThreeVertical size={22} />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content>
                <Flex direction="column" gap="4" justify="end">
                  <Popover.Close>
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <Button color="gray" variant="ghost">
                          <Text size={'3'} weight="medium">
                            Editar
                          </Text>
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Editar projeto</Dialog.Title>
                        <label>
                          <Text as="div" size="2" color="gray">
                            Nome *
                          </Text>
                          <TextField.Root
                            mt="2"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            color="blue"
                            radius="full"
                          />
                        </label>
                        <Flex mt="4" direction="row" gap="2" justify="end">
                          <Popover.Close>
                            <Button color="gray" variant="soft">
                              Fechar
                            </Button>
                          </Popover.Close>
                          <Popover.Close>
                            <Button
                              color="blue"
                              disabled={loading}
                              onClick={updateProject}>
                              Atualizar
                            </Button>
                          </Popover.Close>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  </Popover.Close>
                  <Popover.Close>
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <Button
                          color="red"
                          variant="ghost"
                          onClick={() => {
                          }}>
                          <Text size={'3'} weight="medium">
                            Excluir
                          </Text>
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Deseja excluir {p.title}?</Dialog.Title>
                        <Text size={'3'} weight="light">
                          Esta ação não pode ser desfeita
                        </Text>
                        <Flex mt="4" direction="row" gap="2" justify="end">
                          <Popover.Close>
                            <Button color="gray" variant="soft">
                              Fechar
                            </Button>
                          </Popover.Close>
                          <Popover.Close>
                            <Button
                              color="red"
                              disabled={loading}
                              onClick={deletePresentation}>
                              Excluir
                            </Button>
                          </Popover.Close>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  </Popover.Close>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Box>
        </Flex>
        <Box>
          <Flex gap={"2"} direction={"row"} align={"center"}>
            <Text size={'1'} weight="light">
              Editado
            </Text>
            <Text size={'1'} weight="light">
              {moment(p?.updated_at).fromNow()}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Grid>
  )
}


const CreateSlide = (props: {
  type: 'auto' | 'normal',
  loading: boolean,
  CreateApresentation: (a: CreateApresentationProps) => void;
  subjects: AdemicSubjectsProps[];
  statusCreate?: number
}) => {
  const { type, loading, CreateApresentation, subjects, statusCreate } = props;
  const [title, setTitle] = useState("");
  const [subject, setsubject] = useState("");
  const [context, setContext] = useState("");
  const [numberSlides, setNumberSlides] = useState("5");
  const [disciplineId, setDisciplineId] = useState("");

  if (loading && type === "auto") {
    return (
      <Flex align="center" justify="center" direction="column" gap="2">
        <img src={ApresentatioAlien} alt="loading" width={300} />
        <Text as="div" size="2" color="gray">
          Criando seu slide, aguarde...
        </Text>
        <Slider defaultValue={[0]} value={[((statusCreate ?? 0) / 4 * 100)]} color="blue" className="slider-loading" />
      </Flex>
    )
  }

  return (
    <Flex
      direction="column" gap="3">
      <div>
        <label>
          <Text as="div" size="2" color="gray">
            Nome *
          </Text>
          <TextField.Root
            mt="2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            color="blue"
            radius="full"
          />
        </label>
      </div>
      <div>
        <label>
          <Text as="div" size="2" color="gray" mb="2">
            Disciplina
          </Text>
          <ReactSearchAutocomplete
            items={subjects}
            showIcon={false}
            className="TextFieldRootAutoComplete"
            onSelect={(e) => setDisciplineId(e.id)}
            showItemsOnFocus
            formatResult={(a: any) => (
              <Text style={{ width: '100%' }}>{a.name}</Text>
            )}
          />
        </label>
      </div>
      <div>
        <label>
          <Text as="div" size="2" color="gray">
            Assunto {type === "auto" ? '*' : ''}
          </Text>
          <TextField.Root
            mt="2"
            value={subject}
            onChange={e => setsubject(e.target.value)}
            color="blue"
            radius="full"
          />
        </label>
      </div>
      {type === 'auto' ? <div>
        <label>
          <Text as="div" size="2" color="gray">
            Contexto
          </Text>
          <TextField.Root
            mt="2"
            value={context}
            onChange={e => setContext(e.target.value)}
            color="blue"
            radius="full"
          />
        </label>
      </div> : <></>}
      {type === 'auto' ? <div>
        <label>
          <Text as="div" size="2" color="gray">
            Numero de slides
          </Text>
          <Select.Root
            size={"3"}
            defaultValue="5"
            value={numberSlides}
            onValueChange={(e) => {
              setNumberSlides(e)
            }}>
            <Select.Trigger radius="full" color="blue" style={{ width: '100%' }} />
            <Select.Content color="blue">
              <Select.Group>
                <Select.Label>Numero de slides</Select.Label>
                <Select.Item value={'1'}>1</Select.Item>
                <Select.Item value={'3'}>3</Select.Item>
                <Select.Item value={'5'}>5</Select.Item>
                <Select.Item value={'7'}>7</Select.Item>
                <Select.Item value={'10'}>10</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </label>
      </div> : <></>}
      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Fechar
          </Button>
        </Dialog.Close>
        <Button color="blue"
          disabled={!title || loading || (type === "auto" && subject.length < 4)}
          onClick={() => {
            CreateApresentation({
              isIa: type === "auto",
              title,
              numberOfSlides: Number(numberSlides),
              topic: subject,
              context,
              disciplineId: disciplineId

            })
          }}>Criar</Button>
      </Flex>
    </Flex>
  )
}