import { create } from 'zustand';
import type {
  Deck,
  DifficultyRating,
  Flashcard,
  StandardFlashcard,
  StatisticsInterval,
  StatisticsKpis,
  StatsSeries,
} from '@/types';
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
  cardDifficulty: Record<number, DifficultyRating>;

  // Actions - Initialization
  initialize: () => Promise<void>;

  // Actions - Decks
  loadDecks: () => Promise<void>;
  loadDeck: (id: number) => Promise<void>;
  refreshAfterRestore: () => Promise<void>;
  addDeck: (title: string, description?: string) => Promise<Deck>;
  editDeck: (id: number, title: string, description?: string) => Promise<void>;
  removeDeck: (id: number) => Promise<void>;

  // Actions - Flashcards
  loadFlashcards: (deckId: number) => Promise<void>;
  loadFlashcardsForQuiz: (deckId: number) => Promise<void>;
  reshuffleFlashcards: () => void;
  appendQuizCard: (card: Flashcard) => void;
  addFlashcard: (deckId: number, question: string, answer: string) => Promise<Flashcard>;
  addMultipleChoiceFlashcard: (
    deckId: number,
    question: string,
    options: Array<{ text: string; isCorrect: boolean }>,
  ) => Promise<Flashcard>;
  editFlashcard: (id: number, question: string, answer: string) => Promise<void>;
  editMultipleChoiceFlashcard: (
    id: number,
    question: string,
    options: Array<{ text: string; isCorrect: boolean }>,
  ) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;

  // Actions - Import
  importDeck: (
    title: string,
    description: string | undefined,
    flashcards: Array<
      | { question: string; answer: string }
      | {
          question: string;
          type: 'multiple_choice';
          options: Array<{ text: string; isCorrect: boolean }>;
        }
    >,
  ) => Promise<Deck>;

  // Actions - Quiz Session
  startQuizSession: (deckId: number) => Promise<number>;
  recordAnswer: (flashcardId: number, responseType: DifficultyRating) => Promise<void>;
  setCardDifficulty: (flashcardId: number, rating: DifficultyRating) => void;
  endQuizSession: () => Promise<void>;
  discardQuizSession: () => Promise<void>;

  // Actions - Statistics
  getGlobalStats: (interval: StatisticsInterval, startDate?: string) => Promise<StatsSeries[]>;
  getDeckStats: (
    deckId: number,
    interval: StatisticsInterval,
    startDate?: string,
  ) => Promise<StatsSeries[]>;
  getKPIs: (deckId?: number) => Promise<StatisticsKpis>;
  resetStats: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

type DeckContentState = Pick<FlashcardsState, 'currentDeck' | 'flashcards' | 'shuffledFlashcards'>;
type QuizProgressState = Pick<
  FlashcardsState,
  'currentSessionId' | 'sessionStartTime' | 'answeredFlashcardIds' | 'cardDifficulty'
>;

function createEmptyDeckContentState(): DeckContentState {
  return {
    currentDeck: null,
    flashcards: [],
    shuffledFlashcards: [],
  };
}

function createIdleQuizProgressState(): QuizProgressState {
  return {
    currentSessionId: null,
    sessionStartTime: null,
    answeredFlashcardIds: new Set<number>(),
    cardDifficulty: {},
  };
}

function replaceFlashcardInCollection(collection: Flashcard[], updated: Flashcard): Flashcard[] {
  return collection.map((flashcard) => (flashcard.id === updated.id ? updated : flashcard));
}

function replaceWithStandardFlashcard(
  collection: Flashcard[],
  id: number,
  question: string,
  answer: string,
): Flashcard[] {
  return collection.map((flashcard) => {
    if (flashcard.id !== id) {
      return flashcard;
    }

    const updatedFlashcard: StandardFlashcard = {
      id,
      deckId: flashcard.deckId,
      question,
      answer,
      type: 'standard',
    };

    return updatedFlashcard;
  });
}

function removeFlashcardFromCollection(collection: Flashcard[], id: number): Flashcard[] {
  return collection.filter((flashcard) => flashcard.id !== id);
}

function removeCardDifficultyEntry(
  cardDifficulty: Record<number, DifficultyRating>,
  flashcardId: number,
): Record<number, DifficultyRating> {
  if (!(flashcardId in cardDifficulty)) {
    return cardDifficulty;
  }

  const { [flashcardId]: _removed, ...remainingDifficulty } = cardDifficulty;
  return remainingDifficulty;
}

function removeAnsweredFlashcardId(
  answeredFlashcardIds: Set<number>,
  flashcardId: number,
): Set<number> {
  if (!answeredFlashcardIds.has(flashcardId)) {
    return answeredFlashcardIds;
  }

  const nextAnsweredFlashcardIds = new Set(answeredFlashcardIds);
  nextAnsweredFlashcardIds.delete(flashcardId);
  return nextAnsweredFlashcardIds;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  decks: [],
  ...createEmptyDeckContentState(),
  isLoading: false,
  isInitialized: false,
  ...createIdleQuizProgressState(),

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
    if (!deck) {
      set(createEmptyDeckContentState());
      return;
    }

    set({ currentDeck: deck, flashcards: [] });
    await get().loadFlashcards(id);
  },

  refreshAfterRestore: async () => {
    set({
      ...createEmptyDeckContentState(),
      ...createIdleQuizProgressState(),
    });
    await get().loadDecks();
  },

  addDeck: async (title: string, description?: string) => {
    const deck = await db.createDeck(title, description);
    set((state) => ({ decks: [deck, ...state.decks] }));
    return deck;
  },

  editDeck: async (id: number, title: string, description?: string) => {
    await db.updateDeck(id, title, description);
    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? { ...d, title, description } : d)),
      currentDeck:
        state.currentDeck?.id === id
          ? { ...state.currentDeck, title, description }
          : state.currentDeck,
    }));
  },

  removeDeck: async (id: number) => {
    await db.deleteDeck(id);
    set((state) =>
      state.currentDeck?.id === id
        ? {
            decks: state.decks.filter((deck) => deck.id !== id),
            ...createEmptyDeckContentState(),
          }
        : {
            decks: state.decks.filter((deck) => deck.id !== id),
          },
    );
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

  appendQuizCard: (card: Flashcard) => {
    set((state) => ({
      shuffledFlashcards: [...state.shuffledFlashcards, card],
    }));
  },

  addFlashcard: async (deckId: number, question: string, answer: string) => {
    const flashcard = await db.createFlashcard(deckId, question, answer);
    set((state) => ({
      flashcards: [...state.flashcards, flashcard],
    }));
    return flashcard;
  },

  addMultipleChoiceFlashcard: async (
    deckId: number,
    question: string,
    options: Array<{ text: string; isCorrect: boolean }>,
  ) => {
    const flashcard = await db.createMultipleChoiceFlashcard(deckId, question, options);
    set((state) => ({
      flashcards: [...state.flashcards, flashcard],
    }));
    return flashcard;
  },

  editFlashcard: async (id: number, question: string, answer: string) => {
    await db.updateFlashcard(id, question, answer);
    set((state) => ({
      flashcards: replaceWithStandardFlashcard(state.flashcards, id, question, answer),
      shuffledFlashcards: replaceWithStandardFlashcard(state.shuffledFlashcards, id, question, answer),
    }));
  },

  editMultipleChoiceFlashcard: async (
    id: number,
    question: string,
    options: Array<{ text: string; isCorrect: boolean }>,
  ) => {
    await db.updateMultipleChoiceFlashcard(id, question, options);
    // Reload from DB to get proper option IDs
    const updated = await db.getFlashcardById(id);
    if (updated) {
      set((state) => ({
        flashcards: replaceFlashcardInCollection(state.flashcards, updated),
        shuffledFlashcards: replaceFlashcardInCollection(state.shuffledFlashcards, updated),
      }));
    }
  },

  removeFlashcard: async (id: number) => {
    await db.deleteFlashcard(id);
    set((state) => ({
      flashcards: removeFlashcardFromCollection(state.flashcards, id),
      shuffledFlashcards: removeFlashcardFromCollection(state.shuffledFlashcards, id),
      answeredFlashcardIds: removeAnsweredFlashcardId(state.answeredFlashcardIds, id),
      cardDifficulty: removeCardDifficultyEntry(state.cardDifficulty, id),
    }));
  },

  importDeck: async (
    title: string,
    description: string | undefined,
    flashcards: Array<
      | { question: string; answer: string }
      | {
          question: string;
          type: 'multiple_choice';
          options: Array<{ text: string; isCorrect: boolean }>;
        }
    >,
  ) => {
    const deck = await db.createDeck(title, description);

    for (const fc of flashcards) {
      if ('type' in fc && fc.type === 'multiple_choice') {
        await db.createMultipleChoiceFlashcard(deck.id, fc.question, fc.options);
      } else {
        const stdFc = fc as { question: string; answer: string };
        await db.createFlashcard(deck.id, stdFc.question, stdFc.answer);
      }
    }

    set((state) => ({
      decks: [deck, ...state.decks],
    }));
    return deck;
  },

  startQuizSession: async (deckId: number) => {
    const sessionId = await db.createQuizSession(deckId);
    set({
      ...createIdleQuizProgressState(),
      currentSessionId: sessionId,
      sessionStartTime: Date.now(),
      shuffledFlashcards: [],
    });
    return sessionId;
  },

  recordAnswer: async (flashcardId: number, responseType: DifficultyRating) => {
    const { currentSessionId, answeredFlashcardIds } = get();
    if (!currentSessionId) return;
    await db.createQuizAnswer(currentSessionId, flashcardId, responseType);

    const newSet = new Set(answeredFlashcardIds);
    newSet.add(flashcardId);
    set({ answeredFlashcardIds: newSet });
  },

  setCardDifficulty: (flashcardId: number, rating: DifficultyRating) => {
    set((state) => ({
      cardDifficulty: { ...state.cardDifficulty, [flashcardId]: rating },
    }));
  },

  endQuizSession: async () => {
    const { currentSessionId, sessionStartTime, cardDifficulty } = get();
    if (!currentSessionId || !sessionStartTime) return;

    const endTime = Date.now();
    const totalTimeSpent = endTime - sessionStartTime;
    const ratings = Object.values(cardDifficulty);
    const totalCards = ratings.length;
    const easyCount = ratings.filter((r) => r === 'easy').length;
    const hardCount = ratings.filter((r) => r === 'hard').length;

    await db.updateQuizSession(
      currentSessionId,
      new Date().toISOString(),
      totalTimeSpent,
      totalCards,
      easyCount,
      hardCount,
    );
    set(createIdleQuizProgressState());
  },

  discardQuizSession: async () => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    await db.deleteQuizSession(currentSessionId);
    set(createIdleQuizProgressState());
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

  resetAllData: async () => {
    await db.resetAllData();
    set({
      decks: [],
      ...createEmptyDeckContentState(),
      ...createIdleQuizProgressState(),
    });
  },
}));
