import { useShallow } from 'zustand/react/shallow';

import { useFlashcardsStore } from './flashcards';

export function useFlashcardsInitialization() {
  return useFlashcardsStore((state) => state.initialize);
}

export function useDecksState() {
  return useFlashcardsStore((state) => state.decks);
}

export function useCurrentDeckState() {
  return useFlashcardsStore((state) => state.currentDeck);
}

export function useFlashcardsState() {
  return useFlashcardsStore((state) => state.flashcards);
}

export function useShuffledFlashcardsState() {
  return useFlashcardsStore((state) => state.shuffledFlashcards);
}

export function useQuizSessionState() {
  return useFlashcardsStore(
    useShallow((state) => ({
      cardDifficulty: state.cardDifficulty,
      sessionStartTime: state.sessionStartTime,
    })),
  );
}

export function useDeckActions() {
  return useFlashcardsStore(
    useShallow((state) => ({
      loadDecks: state.loadDecks,
      loadDeck: state.loadDeck,
      addDeck: state.addDeck,
      editDeck: state.editDeck,
      removeDeck: state.removeDeck,
    })),
  );
}

export function useFlashcardActions() {
  return useFlashcardsStore(
    useShallow((state) => ({
      loadFlashcards: state.loadFlashcards,
      loadFlashcardsForQuiz: state.loadFlashcardsForQuiz,
      appendQuizCard: state.appendQuizCard,
      addFlashcard: state.addFlashcard,
      addMultipleChoiceFlashcard: state.addMultipleChoiceFlashcard,
      editFlashcard: state.editFlashcard,
      editMultipleChoiceFlashcard: state.editMultipleChoiceFlashcard,
      removeFlashcard: state.removeFlashcard,
    })),
  );
}

export function useQuizActions() {
  return useFlashcardsStore(
    useShallow((state) => ({
      startQuizSession: state.startQuizSession,
      recordAnswer: state.recordAnswer,
      setCardDifficulty: state.setCardDifficulty,
      endQuizSession: state.endQuizSession,
      discardQuizSession: state.discardQuizSession,
    })),
  );
}

export function useStatisticsActions() {
  return useFlashcardsStore(
    useShallow((state) => ({
      getGlobalStats: state.getGlobalStats,
      getDeckStats: state.getDeckStats,
      getKPIs: state.getKPIs,
      resetStats: state.resetStats,
    })),
  );
}

export function useMaintenanceActions() {
  return useFlashcardsStore(
    useShallow((state) => ({
      refreshAfterRestore: state.refreshAfterRestore,
      resetAllData: state.resetAllData,
    })),
  );
}
