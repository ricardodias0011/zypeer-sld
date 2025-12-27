import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/v2/ui/popover';
import UserStorage from '@/services/storage/auth';
import { URLS } from '@/utils/urls';
import {
  ChevronDown,
  GripVertical,
  Plus,
  Presentation,
  RotateCcw,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useEffect, useState, type FormEventHandler } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { toast } from 'sonner';

interface Card {
  id: string;
  title: string;
  items: string[];
}

export default function MarkdownCardEditor() {
  const [cards, setCards] = useState<Card[]>([]);
  const [theme, setTheme] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const onCreateCards: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (generating) return
    setGenerating(true);
    try {
      const token = UserStorage.getTokenStorage()
      const response = await fetch(`${URLS.api}tools/generate/s/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify({
          text: theme,
          cardCount: cardCount
        }),
      });

      if (!response.ok) {
        throw new Error(response.status === 400 ? "Créditos insuficientes!" : "Não foi possível completar a conexão.");
      }
      if (!response.body) throw new Error("Resposta vazia do servidor.");

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
      toast.error(error.message || "Não foi possível gerar cards.");
    } finally {
      setGenerating(false);
    }
    // const mockApiMarkdown = `
    // ---
    // # Introdução à Revolução Industrial
    // - Transição para novos processos de manufatura.
    // ---
    // # O Que Foi a Revolução
    // - Substituição da produção artesanal pela mecanizada.
    // - Impacto na estrutura da sociedade moderna.
    // ---`;

  }

  const parseMarkdownToCards = (md: string) => {
    const sections = md.split('---').filter(section => section.trim() !== '');
    const parsedCards = sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(l => l.trim() !== '');
      const titleLine = lines.find(l => l.startsWith('#')) || '';
      const items = lines.filter(l => l.startsWith('-')).map(l => l.replace('-', '').trim());
      return {
        id: `card-${Date.now()}-${index}`,
        title: titleLine.replace('#', '').trim() || 'Sem título',
        items: items
      };
    }).filter(card => card.title !== '');
    setCards(parsedCards);
  };

  useEffect(() => {

  }, []);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCards(items);
  };

  const addCard = () => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: 'Novo Tópico',
      items: ['Novo ponto importante']
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-blue-200  to-white text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">

        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Editor de Conteúdo
            </h1>
            <p className="text-slate-500 text-sm mt-1">Organize seus tópicos e gere apresentações.</p>
          </div>
          {cards.length > 0 ? <button
            onClick={() => console.log('Gerando slides...', cards)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Presentation size={20} />
            Gerar Slides
          </button> : <></>}
        </header>
        <div className="max-w-4xl overflow-auto  mx-auto space-y-8 max-h-[50vh]">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-sm font-medium text-slate-700 hover:bg-white hover:shadow transition outline-none focus:ring-2 focus:ring-blue-500/20">
                    <Sparkles size={14} />
                    Numero de Cartões: {cardCount}
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200">
                  <ul className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <PopoverClose className='w-full' key={num}>
                        <button
                          onClick={() => setCardCount(Number(num))}
                          className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition text-sm"
                        >
                          {num} cartões
                        </button>
                      </PopoverClose>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
        <section className="grid overflow-auto  gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tema Principal</label>
            <div className="relative mt-2">
              <form onSubmit={onCreateCards}>
                <input
                  value={theme}
                  disabled={generating}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full py-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-medium overflow-hidden text-ellipsis"
                  placeholder="Ex: Revolução Industrial"
                />
              </form>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <RotateCcw size={20} className="text-slate-300 hover:text-blue-500 cursor-pointer transition" />
                <Sparkles size={20} className="text-blue-500" />
              </div>
            </div>
          </div>
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
                        className={`group bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500/10 rotate-1' : 'hover:border-blue-200'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-1 text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical size={22} />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 text-xs font-black text-blue-600 bg-blue-50 rounded-lg">
                                  {index + 1}
                                </span>
                                <input
                                  className="text-lg font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-800"
                                  defaultValue={card.title}
                                />
                              </div>
                              <button
                                onClick={() => removeCard(card.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <ul className="space-y-3 ml-10">
                              {card.items.map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 group/item">
                                  <span className="mt-2.5 w-1.5 h-1.5 bg-blue-300 rounded-full shrink-0" />
                                  <textarea
                                    className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none overflow-hidden"
                                    defaultValue={item}
                                  />
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
          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Adicionar Novo Cartão
        </button>
      </div>
    </div>
  );
}