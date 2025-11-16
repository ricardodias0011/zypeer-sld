import type { LayoutType } from '@/types/slide-v2';
import { create } from 'zustand';

export type CardType = 'title' | 'content' | 'imageWithText';
export type CardWidth = 'small' | 'medium' | 'large';
export type CardAlignment = 'left' | 'center' | 'right';


export type SlideType = 'title' | 'content' | 'imageWithText';


export interface Card {
  id: string;
  type: SlideType;
  layout: LayoutType;
  title: string;
  content: string;
  imageUrl: string;
  bgcolor: string;
}

export interface Slide {
  id: string;
  title: string;
  cards: Card[];
  backgroundColor?: string;
  backgroundImage?: string;
  featuredImage?: string;
  layoutType: LayoutType;
  order: number;
}

interface SlideState {
  slides: Slide[];
  currentSlideId: string | null;
  selectedCardId: string | null;
  isPresentationMode: boolean;
  history: Slide[][];
  historyIndex: number;

  addSlide: () => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  setCurrentSlide: (id: string | null) => void;

  addCard: (slideId: string, type: CardType) => void;
  deleteCard: (slideId: string, cardId: string) => void;
  duplicateCard: (slideId: string, cardId: string) => void;
  updateCard: (slideId: string, cardId: string, updates: Partial<Card>) => void;
  reorderCards: (slideId: string, startIndex: number, endIndex: number) => void;
  setSelectedCard: (cardId: string | null) => void;

  togglePresentationMode: () => void;
  nextSlide: () => void;
  previousSlide: () => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const createDefaultSlide = (order: number): Slide => ({
  id: `slide-${Date.now()}-${Math.random()}`,
  title: 'New Slide',
  cards: [],
  layoutType: 'half-right',
  order,
});

const createDefaultCard = (type: SlideType, order: number): Card => ({
  id: `card-${Date.now()}-${Math.random()}`,
  type,
  title: 'Novo Título',
  content: 'Clique para editar o conteúdo...',
  imageUrl: '',
  layout: 'half-right',
  bgcolor: '#ffffff'
});

export const useSlideStore = create<SlideState>((set, get) => ({
  slides: [createDefaultSlide(0)],
  currentSlideId: null,
  selectedCardId: null,
  isPresentationMode: false,
  history: [],
  historyIndex: -1,

  addSlide: () => {
    const slides = get().slides;
    const newSlide = createDefaultSlide(slides.length);
    set({ slides: [...slides, newSlide], currentSlideId: newSlide.id });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  deleteSlide: (id: string) => {
    const slides = get().slides.filter(s => s.id !== id);
    const currentSlideId = get().currentSlideId === id ? (slides[0]?.id || null) : get().currentSlideId;
    set({ slides, currentSlideId });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  duplicateSlide: (id: string) => {
    const slides = get().slides;
    const slide = slides.find(s => s.id === id);
    if (!slide) return;

    const newSlide: Slide = {
      ...slide,
      id: `slide-${Date.now()}-${Math.random()}`,
      cards: slide.cards.map(card => ({
        ...card,
        id: `card-${Date.now()}-${Math.random()}`,
      })),
      order: slides.length,
    };

    set({ slides: [...slides, newSlide], currentSlideId: newSlide.id });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  updateSlide: (id: string, updates: Partial<Slide>) => {
    const slides = get().slides.map(slide =>
      slide.id === id ? { ...slide, ...updates } : slide
    );
    set({ slides });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  reorderSlides: (startIndex: number, endIndex: number) => {
    const slides = [...get().slides];
    const [removed] = slides.splice(startIndex, 1);
    slides.splice(endIndex, 0, removed);
    const reorderedSlides = slides.map((slide, index) => ({ ...slide, order: index }));
    set({ slides: reorderedSlides });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  setCurrentSlide: (id: string | null) => set({ currentSlideId: id }),

  addCard: (slideId: string, type: CardType) => {
    const slides = get().slides.map(slide => {
      if (slide.id === slideId) {
        const newCard = createDefaultCard(type, slide.cards.length);
        return { ...slide, cards: [...slide.cards, newCard] };
      }
      return slide;
    });
    set({ slides });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  deleteCard: (slideId: string, cardId: string) => {
    const slides = get().slides.map(slide => {
      if (slide.id === slideId) {
        return { ...slide, cards: slide.cards.filter(c => c.id !== cardId) };
      }
      return slide;
    });
    set({ slides, selectedCardId: null });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  duplicateCard: (slideId: string, cardId: string) => {
    const slides = get().slides.map(slide => {
      if (slide.id === slideId) {
        const card = slide.cards.find(c => c.id === cardId);
        if (!card) return slide;

        const newCard: Card = {
          ...card,
          id: `card-${Date.now()}-${Math.random()}`
        };

        return { ...slide, cards: [...slide.cards, newCard] };
      }
      return slide;
    });
    set({ slides });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  updateCard: (slideId: string, cardId: string, updates: Partial<Card>) => {
    const slides = get().slides.map(slide => {
      if (slide.id === slideId) {
        return {
          ...slide,
          cards: slide.cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
          ),
        };
      }
      return slide;
    });
    set({ slides });
    get().saveToLocalStorage();
  },

  reorderCards: (slideId: string, startIndex: number, endIndex: number) => {
    const slides = get().slides.map(slide => {
      if (slide.id === slideId) {
        const cards = [...slide.cards];
        const [removed] = cards.splice(startIndex, 1);
        cards.splice(endIndex, 0, removed);
        const reorderedCards = cards.map((card, index) => ({ ...card, order: index }));
        return { ...slide, cards: reorderedCards };
      }
      return slide;
    });
    set({ slides });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  setSelectedCard: (cardId: string | null) => set({ selectedCardId: cardId }),

  togglePresentationMode: () => set({ isPresentationMode: !get().isPresentationMode }),

  nextSlide: () => {
    const { slides, currentSlideId } = get();
    const currentIndex = slides.findIndex(s => s.id === currentSlideId);
    if (currentIndex < slides.length - 1) {
      set({ currentSlideId: slides[currentIndex + 1].id });
    }
  },

  previousSlide: () => {
    const { slides, currentSlideId } = get();
    const currentIndex = slides.findIndex(s => s.id === currentSlideId);
    if (currentIndex > 0) {
      set({ currentSlideId: slides[currentIndex - 1].id });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ slides: history[historyIndex - 1], historyIndex: historyIndex - 1 });
      get().saveToLocalStorage();
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ slides: history[historyIndex + 1], historyIndex: historyIndex + 1 });
      get().saveToLocalStorage();
    }
  },

  saveToHistory: () => {
    const { slides, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(slides)));
    set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 });
  },

  saveToLocalStorage: () => {
    const { slides } = get();
    localStorage.setItem('slides', JSON.stringify(slides));
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('slides');
    if (saved) {
      try {
        const slides = JSON.parse(saved);
        set({ slides, currentSlideId: slides[0]?.id || null });
      } catch (error) {
        console.error('Failed to load slides from localStorage', error);
      }
    }
  },
}));