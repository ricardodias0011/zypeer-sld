import type { LayoutType } from '@/types/slide-v2';
import { v4 } from 'uuid';
import { create } from 'zustand';

export type SlideType = 'type-1';

export interface Slide {
  id: string;
  order: number;
  layout: LayoutType;
  type: SlideType;
  title: string;
  content: SlideContentType[];
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  bgcolor?: string;
  backgroundImage?: string;
}

export type SlideContentType = {
  id: string;
  type: 'text' | 'column' | 'image' | 'quote',
  text?: string,
  columns?: { direction: 'left' | 'right', text?: string, image?: string, type: 'text' | 'image', id: string, items?: any }[],
  image?: {
    url: string;
    imageFit?: 'cover' | 'contain' | 'fill';
  },
  border?: string;
  bgcolor?: string;
  order: number;
  items?: {
    id: string;
    type: 'text' | 'image';
    text?: string;
    image?: { url: string; imageFit?: 'cover' | 'contain' | 'fill' };
  }[];
}

interface SlideState {
  slides: Slide[];
  currentSlideId: string | null;
  isPresentationMode: boolean;
  history: Slide[][];
  historyIndex: number;

  addSlide: (type: SlideType, content?: any, id?: string) => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  setCurrentSlide: (id: string | null) => void;

  togglePresentationMode: () => void;
  nextSlide: () => void;
  previousSlide: () => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const createDefaultSlide = (order: number, type: SlideType, content?: any, id?: string): Slide => ({
  id: id ?? `slide-${Date.now()}-${Math.random()}`,
  order,
  type,
  layout: 'half-right',
  title: 'Novo Título',
  content: content ?? [{
    type: 'text',
    text: '# Clique para editar o conteúdo...',
    id: v4().slice(0, 10),
    order: 1
  }],
  imageUrl: '',
  bgcolor: '#ffffff',
});

const initialSlides = [createDefaultSlide(0, 'type-1')];

export const useSlideStore = create<SlideState>((set, get) => ({
  slides: initialSlides,
  currentSlideId: initialSlides[0]?.id || null,
  isPresentationMode: false,
  history: [initialSlides],
  historyIndex: 0,

  addSlide: (type: SlideType, content?: any, id?: string) => {
    const slides = get().slides;
    const newSlide = createDefaultSlide(slides.length, type, content, id);
    set({ slides: [...slides, newSlide], currentSlideId: newSlide.id });
    get().saveToHistory();
    get().saveToLocalStorage();
    return newSlide;
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
        const slides = JSON.parse(saved) as Slide[];
        if (slides.length > 0) {
          set({
            slides,
            currentSlideId: slides[0]?.id || null,
            history: [slides],
            historyIndex: 0
          });
        }
      } catch (error) {
        console.error('Failed to load slides from localStorage', error);
      }
    }
  },
}));