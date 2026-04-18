import { getDb, reinitializeDatabase } from './connection';

export async function resetAllData(): Promise<void> {
  const database = getDb();

  await database.execAsync(`
    DROP TRIGGER IF EXISTS decks_au;
    DROP TRIGGER IF EXISTS decks_ad;
    DROP TRIGGER IF EXISTS decks_ai;
    DROP TRIGGER IF EXISTS flashcards_au;
    DROP TRIGGER IF EXISTS flashcards_ad;
    DROP TRIGGER IF EXISTS flashcards_ai;
    DROP TABLE IF EXISTS decks_fts;
    DROP TABLE IF EXISTS flashcards_fts;
    DROP TABLE IF EXISTS quiz_answers;
    DROP TABLE IF EXISTS quiz_sessions;
    DROP TABLE IF EXISTS flashcard_options;
    DROP TABLE IF EXISTS flashcards;
    DROP TABLE IF EXISTS decks;
    DROP TABLE IF EXISTS schema_version;
  `);

  await reinitializeDatabase();
}
