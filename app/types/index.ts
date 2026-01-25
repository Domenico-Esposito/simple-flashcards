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
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
};
