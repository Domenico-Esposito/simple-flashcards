export { initDatabase, closeDatabase, reinitializeDatabase } from './connection';
export {
  backupDatabaseToBytes,
  backupDatabaseToFile,
  restoreDatabaseFromBytes,
  restoreDatabaseFromFile,
} from './backup';
export { getAllDecks, getDeckById, createDeck, updateDeck, deleteDeck } from './decks';
export {
  getFlashcardsByDeckId,
  getFlashcardById,
  createFlashcard,
  createMultipleChoiceFlashcard,
  updateFlashcard,
  updateMultipleChoiceFlashcard,
  deleteFlashcard,
  getFlashcardCount,
} from './flashcards';
export { searchDecks, searchFlashcards, search, type SearchResult } from './search';
export { createQuizSession, updateQuizSession, deleteQuizSession, createQuizAnswer } from './quiz';
export { getStats, getKPIs, resetAllStats } from './stats';
export { resetAllData } from './reset';
