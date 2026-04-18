/**
 * Core type definitions for the Flashcards app
 */

/**
 * Flashcard type discriminator
 */
export type FlashcardType = 'standard' | 'multiple_choice';

/**
 * A single option in a multiple-choice flashcard
 */
export type FlashcardOption = {
  id: number;
  flashcardId: number;
  text: string;
  sortOrder: number;
  isCorrect: boolean;
};

/**
 * Base fields shared by every flashcard
 */
type FlashcardBase = {
  id: number;
  question: string;
  deckId: number;
};

/**
 * Classic flashcard with a free-text answer
 */
export type StandardFlashcard = FlashcardBase & {
  type: 'standard';
  answer: string;
};

/**
 * Multiple-choice flashcard — no `answer` field; uses options instead
 */
export type MultipleChoiceFlashcard = FlashcardBase & {
  type: 'multiple_choice';
  options: FlashcardOption[];
};

/**
 * Union of all flashcard variants
 */
export type Flashcard = StandardFlashcard | MultipleChoiceFlashcard;

/**
 * Represents a deck (collection) of flashcards
 */
export type Deck = {
  id: number;
  title: string;
  description?: string;
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
  flashcards: Array<
    | { question: string; answer: string }
    | {
        question: string;
        type: 'multiple_choice';
        options: Array<{ text: string; isCorrect: boolean }>;
      }
  >;
};

/**
 * Difficulty rating for quiz responses
 */
export type DifficultyRating = 'easy' | 'medium' | 'hard';

export type StatisticsInterval = 'day' | 'month' | 'quarter' | 'semester' | 'year';

export type StatisticsKpis = {
  totalQuizzes: number;
  totalCards: number;
  easyCount: number;
  hardCount: number;
  totalTime: number;
  totalDecks: number;
};

/**
 * Statistics data series for charts
 */
export type StatsSeries = {
  period: string;
  easy: number;
  medium: number;
  hard: number;
};
