import { create } from 'zustand';
import { Deck, Flashcard, StatsSeries } from '@/types';
import * as db from '@/utils/database';
import { shuffleArray } from '@/utils';

interface FlashcardsState {
  // State
  decks: Deck[];
  currentDeck: Deck | null;
  flashcards: Flashcard[];
  shuffledFlashcards: Flashcard[];
  isLoading: boolean;
  isInitialized: boolean;
  currentSessionId: number | null;
  sessionStartTime: number | null;
  answeredFlashcardIds: Set<number>;
  
  // Actions - Initialization
  initialize: () => Promise<void>;
  
  // Actions - Decks
  loadDecks: () => Promise<void>;
  loadDeck: (id: number) => Promise<void>;
  refreshAfterRestore: () => Promise<void>;
  addDeck: (title: string, description?: string, emoji?: string) => Promise<Deck>;
  editDeck: (id: number, title: string, description?: string, emoji?: string) => Promise<void>;
  removeDeck: (id: number) => Promise<void>;
  
  // Actions - Flashcards
  loadFlashcards: (deckId: number) => Promise<void>;
  loadFlashcardsForQuiz: (deckId: number) => Promise<void>;
  reshuffleFlashcards: () => void;
  addFlashcard: (deckId: number, question: string, answer: string) => Promise<Flashcard>;
  editFlashcard: (id: number, question: string, answer: string) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;
  
  // Actions - Import
  importDeck: (title: string, description: string | undefined, flashcards: Array<{ question: string; answer: string }>, emoji?: string) => Promise<Deck>;

  // Actions - Quiz Session
  startQuizSession: (deckId: number) => Promise<number>;
  recordAnswer: (flashcardId: number, responseType: 'correct' | 'incorrect') => Promise<void>;
  endQuizSession: () => Promise<void>;
  discardQuizSession: () => Promise<void>;

  // Actions - Statistics
  getGlobalStats: (interval: 'day' | 'month' | 'quarter' | 'semester' | 'year', startDate?: string) => Promise<StatsSeries[]>;
  getDeckStats: (deckId: number, interval: 'day' | 'month' | 'quarter' | 'semester' | 'year', startDate?: string) => Promise<StatsSeries[]>;
  getKPIs: (deckId?: number) => Promise<{
    totalQuizzes: number;
    accuracy: number;
    totalAnswers: number;
    totalTime: number;
    avgTimePerQuiz: number;
  }>;
  resetStats: () => Promise<void>;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  decks: [],
  currentDeck: null,
  flashcards: [],
  shuffledFlashcards: [],
  isLoading: false,
  isInitialized: false,
  currentSessionId: null,
  sessionStartTime: null,
  answeredFlashcardIds: new Set(),
  
  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      await db.initDatabase();
      await get().loadDecks();
      set({ isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadDecks: async () => {
    const decks = await db.getAllDecks();
    set({ decks });
  },

  loadDeck: async (id: number) => {
    const deck = await db.getDeckById(id);
    set({ currentDeck: deck });
    if (deck) {
      await get().loadFlashcards(id);
    }
  },

  refreshAfterRestore: async () => {
    set({
      currentDeck: null,
      flashcards: [],
      shuffledFlashcards: [],
      currentSessionId: null,
      sessionStartTime: null,
      answeredFlashcardIds: new Set(),
    });
    await get().loadDecks();
  },
  
  addDeck: async (title: string, description?: string, emoji?: string) => {
    const deck = await db.createDeck(title, description, emoji);
    set((state) => ({ decks: [deck, ...state.decks] }));
    return deck;
  },
  
  editDeck: async (id: number, title: string, description?: string, emoji?: string) => {
    await db.updateDeck(id, title, description, emoji);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === id ? { ...d, title, description, emoji } : d
      ),
      currentDeck: state.currentDeck?.id === id
        ? { ...state.currentDeck, title, description, emoji }
        : state.currentDeck,
    }));
  },
  
  removeDeck: async (id: number) => {
    await db.deleteDeck(id);
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
      currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
    }));
  },
  
  loadFlashcards: async (deckId: number) => {
    const flashcards = await db.getFlashcardsByDeckId(deckId);
    set({ flashcards });
  },
  
  loadFlashcardsForQuiz: async (deckId: number) => {
    const flashcards = await db.getFlashcardsByDeckId(deckId);
    const shuffled = shuffleArray(flashcards);
    set({ flashcards, shuffledFlashcards: shuffled });
  },
  
  reshuffleFlashcards: () => {
    const { flashcards } = get();
    const shuffled = shuffleArray(flashcards);
    set({ shuffledFlashcards: shuffled });
  },
  
  addFlashcard: async (deckId: number, question: string, answer: string) => {
    const flashcard = await db.createFlashcard(deckId, question, answer);
    set((state) => ({ 
      flashcards: [...state.flashcards, flashcard],
    }));
    return flashcard;
  },
  
  editFlashcard: async (id: number, question: string, answer: string) => {
    await db.updateFlashcard(id, question, answer);
    set((state) => ({
      flashcards: state.flashcards.map((f) =>
        f.id === id ? { ...f, question, answer } : f
      ),
    }));
  },
  
  removeFlashcard: async (id: number) => {
    await db.deleteFlashcard(id);
    set((state) => ({
      flashcards: state.flashcards.filter((f) => f.id !== id),
    }));
  },
  
  importDeck: async (title: string, description: string | undefined, flashcards: Array<{ question: string; answer: string }>, emoji?: string) => {
    const deck = await db.createDeck(title, description, emoji);
    
    for (const fc of flashcards) {
      await db.createFlashcard(deck.id, fc.question, fc.answer);
    }
    
    set((state) => ({ 
      decks: [deck, ...state.decks],
    }));
    return deck;
  },

  startQuizSession: async (deckId: number) => {
    const sessionId = await db.createQuizSession(deckId);
    set({ currentSessionId: sessionId, sessionStartTime: Date.now(), answeredFlashcardIds: new Set() });
    return sessionId;
  },

  recordAnswer: async (flashcardId: number, responseType: 'correct' | 'incorrect') => {
    const { currentSessionId, answeredFlashcardIds } = get();
    if (!currentSessionId) return;
    await db.createQuizAnswer(currentSessionId, flashcardId, responseType);
    
    const newSet = new Set(answeredFlashcardIds);
    newSet.add(flashcardId);
    set({ answeredFlashcardIds: newSet });
  },

  endQuizSession: async () => {
    const { currentSessionId, sessionStartTime } = get();
    if (!currentSessionId || !sessionStartTime) return;

    const endTime = Date.now();
    const totalTimeSpent = endTime - sessionStartTime;

    await db.updateQuizSession(currentSessionId, new Date().toISOString(), totalTimeSpent);
    set({ currentSessionId: null, sessionStartTime: null, answeredFlashcardIds: new Set() });
  },

  discardQuizSession: async () => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    await db.deleteQuizSession(currentSessionId);
    set({ currentSessionId: null, sessionStartTime: null, answeredFlashcardIds: new Set() });
  },

  getGlobalStats: async (interval, startDate) => {
    return await db.getStats(interval, undefined, startDate);
  },

  getDeckStats: async (deckId, interval, startDate) => {
    return await db.getStats(interval, deckId, startDate);
  },

  getKPIs: async (deckId) => {
    return await db.getKPIs(deckId);
  },

  resetStats: async () => {
    await db.resetAllStats();
  },
}));
