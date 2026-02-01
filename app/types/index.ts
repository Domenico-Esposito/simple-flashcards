/**
 * Core type definitions for the Flashcards app
 */

/**
 * Represents a single flashcard with a question and answer
 */
export type Flashcard = {
  id: number;
  question: string;
  answer: string;
  deckId: number;
};

/**
 * Represents a deck (collection) of flashcards
 */
export type Deck = {
  id: number;
  title: string;
  description?: string;
  emoji?: string;
  createdAt: string;
};

/**
 * Deck with its associated flashcards
 */
export type DeckWithFlashcards = Deck & {
  flashcards: Flashcard[];
};

/**
 * Data structure for importing/exporting decks
 */
export type DeckExport = {
  title: string;
  description?: string;
  emoji?: string;
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
};

/**
 * Represents a quiz session
 */
export type QuizSession = {
  id: number;
  deckId: number;
  startedAt: string;
  endedAt: string | null;
  totalTimeSpent: number | null;
};

/**
 * Represents a user's answer to a flashcard in a session
 */
export type QuizAnswer = {
  id: number;
  sessionId: number;
  flashcardId: number;
  responseType: 'correct' | 'incorrect';
  answeredAt: string;
};

/**
 * Statistics data series for charts
 */
export type StatsSeries = {
  period: string;
  correct: number;
  incorrect: number;
};
