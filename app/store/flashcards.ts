import { create } from 'zustand';
import { Deck, Flashcard } from '@/types';
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
  
  // Actions - Initialization
  initialize: () => Promise<void>;
  
  // Actions - Decks
  loadDecks: () => Promise<void>;
  loadDeck: (id: number) => Promise<void>;
  addDeck: (title: string, description?: string) => Promise<Deck>;
  editDeck: (id: number, title: string, description?: string) => Promise<void>;
  removeDeck: (id: number) => Promise<void>;
  
  // Actions - Flashcards
  loadFlashcards: (deckId: number) => Promise<void>;
  loadFlashcardsForQuiz: (deckId: number) => Promise<void>;
  reshuffleFlashcards: () => void;
  addFlashcard: (deckId: number, question: string, answer: string) => Promise<Flashcard>;
  editFlashcard: (id: number, question: string, answer: string) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;
  
  // Actions - Import
  importDeck: (title: string, description: string | undefined, flashcards: Array<{ question: string; answer: string }>) => Promise<Deck>;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  decks: [],
  currentDeck: null,
  flashcards: [],
  shuffledFlashcards: [],
  isLoading: false,
  isInitialized: false,
  
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
  
  addDeck: async (title: string, description?: string) => {
    const deck = await db.createDeck(title, description);
    set((state) => ({ decks: [deck, ...state.decks] }));
    return deck;
  },
  
  editDeck: async (id: number, title: string, description?: string) => {
    await db.updateDeck(id, title, description);
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === id ? { ...d, title, description } : d
      ),
      currentDeck: state.currentDeck?.id === id
        ? { ...state.currentDeck, title, description }
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
  
  importDeck: async (title: string, description: string | undefined, flashcards: Array<{ question: string; answer: string }>) => {
    const deck = await db.createDeck(title, description);
    
    for (const fc of flashcards) {
      await db.createFlashcard(deck.id, fc.question, fc.answer);
    }
    
    set((state) => ({ 
      decks: [deck, ...state.decks],
    }));
    return deck;
  },
}));
