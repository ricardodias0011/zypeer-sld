import { Button } from '@/components/v2/ui/button';
import { EventsService } from '@/services/events';
import { PresentationsService } from '@/services/presentations';
import UserStorage from '@/services/storage/auth';
import { URLS } from '@/utils/urls';
import { TextArea } from '@radix-ui/themes';
import {
  GripVertical,
  Loader2,
  Plus,
  Presentation,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useEffect, useState, type FormEventHandler } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Card {
  id: string;
  title: string;
  items: string[];
}

export default function MarkdownCardEditor() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [theme, setTheme] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);
  const [eventID, setEventID] = useState<string | null>("");
  const [statusCreate, setStatusCreate] = useState(0);

  const onCreateCards: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (generating) return;
    setGenerating(true);
    try {
      const token = UserStorage.getTokenStorage();
      const response = await fetch(`${URLS.api}tools/generate/s/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify({ text: theme, cardCount }),
      });

      if (!response.ok) throw new Error(response.status === 400 ? "Créditos insuficientes!" : "Erro na conexão.");
      if (!response.body) throw new Error("Resposta vazia.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullMessage += decoder.decode(value, { stream: true });
        parseMarkdownToCards(fullMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const parseMarkdownToCards = (md: string) => {
    const sections = md.split('---').filter(s => s.trim() !== '');
    const parsedCards = sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(l => l.trim() !== '');
      const titleLine = lines.find(l => l.startsWith('#')) || '';
      const items = lines.filter(l => l.startsWith('-')).map(l => l.replace('-', '').trim());
      return {
        id: `card-${Date.now()}-${index}`,
        title: titleLine.replace('#', '').trim() || 'Sem título',
        items
      };
    }).filter(card => card.title !== '');
    setCards(parsedCards);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCards(items);
  };

  const addCard = () => {
    setCards([...cards, { id: `card-${Date.now()}`, title: 'Novo Tópico', items: ['Ponto importante'] }]);
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const onCreate = () => {
    setIsCreatingPresentation(true);
    PresentationsService.v2Create({
      title: theme || "Nova Apresentação",
      numberOfSlides: cards.length,
      cards: cards,
      topic: theme
    })
      .then(({ data }) => {
        toast.success("Iniciando geração dos slides...");
        setEventID(data?.id);
      })
      .catch(() => {
        toast.error("Erro ao criar apresentação.");
        setIsCreatingPresentation(false);
      });
  };

  useEffect(() => {
    if (!eventID) return;
    const interval = setInterval(() => {
      EventsService.consult("presentation", eventID)
        .then(({ data }) => {
          if (data?.status) {
            if (data?.metadata?.[0]?.id) {
              navigate(`/docs/v2/${data.metadata[0].id}?slide_count=${cards.length}&event_id=${eventID}`);
            }
            setStatusCreate(data.status);
            if (data.status === 0) clearInterval(interval);
            if (data.status === 4) {
              clearInterval(interval);
            }
          }
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [eventID, cards.length, navigate]);

  return (
    <div className="h-screen overflow-auto bg-gradient-to-br from-blue-200 to-white text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Editor de Conteúdo
            </h1>
            <p className="text-slate-500 text-sm mt-1">Organize seus tópicos e gere apresentações.</p>
          </div>
          {cards.length > 0 && (
            <button
              onClick={onCreate}
              disabled={isCreatingPresentation}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-95"
            >
              {isCreatingPresentation ? <Loader2 className="animate-spin" size={20} /> : <Presentation size={20} />}
              {isCreatingPresentation ? 'Gerando...' : 'Gerar Slides'}
            </button>
          )}
        </header>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tema Principal</label>
          <form onSubmit={onCreateCards} className="mt-2 flex gap-6">
            <div className='relative flex-1'>
              <input
                value={theme}
                disabled={generating}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full py-3.5 px-2 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg font-medium"
                placeholder="Ex: Revolução Industrial"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                {generating ? <Loader2 className="animate-spin text-blue-500" size={20} /> : <Sparkles size={20} className="text-blue-500" />}
              </div>
            </div>
            <Button disabled={!theme} type='submit'>
              Gerar cartões
            </Button>
          </form>
        </section>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cards">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group bg-white border border-slate-200 rounded-3xl p-6 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/10' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-1 text-slate-300">
                            <GripVertical size={22} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 text-xs font-black text-blue-600 bg-blue-50 rounded-lg">{index + 1}</span>
                                <input className="text-lg font-bold bg-transparent border-none focus:ring-0" defaultValue={card.title} />
                              </div>
                              <button onClick={() => removeCard(card.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <ul className="space-y-3 ml-10">
                              {card.items.map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600">
                                  <span className="mt-2.5 w-1.5 h-1.5 bg-blue-300 rounded-full shrink-0" />
                                  <TextArea disabled={isCreatingPresentation || generating} className="w-full text-sm bg-transparent border-none focus:ring-0 resize-none" defaultValue={item} rows={1} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={addCard}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Adicionar Novo Cartão
        </button>
      </div>
    </div>
  );
}