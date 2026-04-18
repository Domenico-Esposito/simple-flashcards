import * as SQLite from 'expo-sqlite';

import { detectFts5Support, isFts5Supported, resetFts5Detection } from './fts';
import { runMigrations } from './migrationRunner';

const DATABASE_NAME = 'flashcards.db';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  return db;
}

async function rebuildFtsIndexes(): Promise<void> {
  const database = getDb();

  await database.execAsync(`
    INSERT INTO flashcards_fts(flashcards_fts) VALUES('rebuild');
  `);

  await database.execAsync(`
    INSERT INTO decks_fts(decks_fts) VALUES('rebuild');
  `);
}

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await detectFts5Support(db);
  await runMigrations(db);

  if (isFts5Supported()) {
    await rebuildFtsIndexes();
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function reinitializeDatabase(): Promise<void> {
  await closeDatabase();
  resetFts5Detection();
  await initDatabase();
}
