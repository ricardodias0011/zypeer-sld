import { Badge, Box, Button, Dialog, Flex, Grid, IconButton, Popover, Select, Skeleton, Slider, Text, TextField } from "@radix-ui/themes";
import moment from "moment";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BsPlusLg, BsStars } from "react-icons/bs";
import { FiLock } from "react-icons/fi";
import { PiDotsThreeVertical } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import ApresentatioAlien from "../../assets/alien-apresentation.png";
import PreviewSlide from "../../components/editor/preview";
import useAuth from "../../context/auth";
import { AcademicService } from "../../services/academic";
import { EventsService } from "../../services/events";
import { PresentationsService } from "../../services/presentations";
import type { AdemicSubjectsProps } from "../../types/academic";
import type { PresentationProject } from "../../types/presentations-sliders";
import { SlideCard } from "../v2/slide";

interface CreateApresentationProps {
  title: string,
  disciplineId?: string,
  topic: string,
  numberOfSlides: number;
  context?: string,
  isIa: boolean
}

import { BsGrid, BsListUl } from "react-icons/bs";
import { RiHistoryLine, RiLayoutGridLine, RiStarLine, RiUserLine } from "react-icons/ri";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, account } = useAuth();
  const [apresentations, setApresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subjects, setSubjects] = useState<AdemicSubjectsProps[]>([]);
  const [eventID, setEventID] = useState<string | null>("");
  const [statusCreate, setStatusCreate] = useState(0);

  const getSubjects = () => {
    AcademicService.listSubjects().then(({ data }) => setSubjects(data));
  };

  const getPresentations = () => {
    PresentationsService.list()
      .then(({ data }) => setApresentations(data))
      .finally(() => setInitialLoading(false));
  };

  const CreateApresentation = (_data: CreateApresentationProps) => {
    setLoading(true);
    PresentationsService.create(_data)
      .then(({ data }) => {
        if (_data.isIa) {
          setEventID(data?.id);
        } else {
          navigate("/docs/" + data?.id);
        }
      })
      .finally(() => {
        if (!_data.isIa) setLoading(false);
      });
  };

  useEffect(() => {
    if (eventID) {
      const interval = setInterval(() => {
        EventsService.consult("presentation", eventID).then(({ data }) => {
          if (data?.status) {
            setStatusCreate(data.status);
            if (data.status === 0) clearInterval(interval);
            if (data.status === 4 && data?.metadata) {
              clearInterval(interval);
              navigate("/docs/" + data?.metadata?.[0].id);
            }
          }
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [eventID, navigate]);

  useEffect(() => {
    if (user) {
      getPresentations();
      getSubjects();
    }
  }, [user]);

  return (
    <Flex direction="column" gap="6" p="6" width="100%" className="min-h-screen">
      <Flex justify="between" align="center" width="100%">
        <Flex gap="3">
          <Dialog.Root>
            <Dialog.Trigger>
              <Button size="3" radius="full" className="bg-gradient-to-r to-blue-500 from-blue-600 hover:opacity-90 transition-all cursor-pointer px-6">
                <BsStars />
                <Text weight="medium">Criar novo</Text>
                <Badge variant="surface" color="blue" size="1" className="ml-1 opacity-80">AI</Badge>
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Dialog.Title>Novo slide</Dialog.Title>
              <CreateSlide CreateApresentation={CreateApresentation} type="auto" loading={loading} subjects={subjects} statusCreate={statusCreate} />
            </Dialog.Content>
          </Dialog.Root>

          <Dialog.Root>
            <Dialog.Trigger>
              <Button size="3" variant="outline" color="gray" radius="full" className="px-6 hover:bg-gray-50 cursor-pointer">
                <BsPlusLg />
                <Text weight="medium">Novo em branco</Text>
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Dialog.Title>Novo slides</Dialog.Title>
              <CreateSlide CreateApresentation={CreateApresentation} type="normal" loading={loading} subjects={subjects} statusCreate={statusCreate} />
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <Flex align="center" gap="4">
          <Text size="2" color="gray" weight="medium">{account?.credits ?? 0} créditos</Text>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {(account && account?.avatar) ? <img className="w-full h-full rounded-full" src={account.avatar} alt="avatar" /> : user?.name?.charAt(0).toUpperCase()}
          </div>
        </Flex>
      </Flex>

      <Flex justify="between" align="center" className="border-b border-gray-100 pb-2">
        <Flex gap="5">
          <Button variant="ghost" color="blue" radius="full" className="text-gray-600 hover:text-blue-600">
            <RiLayoutGridLine /> Todos
          </Button>
          <Button variant="ghost" color="gray" radius="full" className="text-gray-500 hover:text-blue-600">
            <RiHistoryLine /> Recentes
          </Button>
          <Button variant="ghost" color="gray" radius="full" className="text-gray-500 hover:text-blue-600">
            <RiUserLine /> Meus Projetos
          </Button>
          <Button variant="ghost" color="gray" radius="full" className="text-gray-500 hover:text-blue-600">
            <RiStarLine /> Favoritos
          </Button>
        </Flex>

        <Flex gap="2" className="bg-gray-100 p-2 rounded-lg flex gap-6">
          <Button size="1" variant="ghost" color="blue" className="bg-blue-500 rounded-xl text-white">
            <BsGrid size={20} /> Grade
          </Button>
          <Button size="1" variant="ghost" color="gray" className="rounded-xl">
            <BsListUl size={20} />
            Lista
          </Button>
        </Flex>
      </Flex>

      <Grid className="flex flex-wrap" gap="5">
        {initialLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="180px" className="rounded-xl" />)
        ) : (
          apresentations.map((p) => (
            <PreviewItem key={p.id} project={p} reload={getPresentations} />
          ))
        )}
      </Grid>
    </Flex>
  );
};


export default HomePage;

const PreviewItem = (props: { project: PresentationProject, reload: () => void; }) => {
  const { project: p, reload } = props;

  const slideRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(p.title);


  useLayoutEffect(() => {
    const mainEl = slideRef.current;
    if (!mainEl) return;

    const handleResize = () => {
      const targetWidth = 1024;
      const viewportWidth = 260;
      const scale = viewportWidth < targetWidth ? viewportWidth / (targetWidth + 32) : 1;
      (mainEl.style as any).zoom = scale;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {
        p?.thumbnailId === "v2-default" ?
          <div
            className="bg-gray-100 rounded overflow-hidden mb-2 cursor-pointer"
            ref={slideRef}
            onClick={() => navigate('/docs/v2/' + p.id)}
          >
            <SlideCard
              readOnly
              slide={p?.presentations[0]}
              onUpdate={() => { }}
              onDelete={() => { }}
            />
          </div>
          :
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
      }

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