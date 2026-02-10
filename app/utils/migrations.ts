import * as SQLite from 'expo-sqlite';

/**
 * Migration definition interface
 */
export interface Migration {
	version: number;
	name: string;
	up: (db: SQLite.SQLiteDatabase) => Promise<void>;
	down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * All database migrations in sequential order.
 * Each migration should be idempotent and handle edge cases gracefully.
 *
 * IMPORTANT: Never modify existing migrations once they're in production.
 * Always create new migrations for schema changes.
 */
export const migrations: Migration[] = [
	// Migration 1: Initial schema (baseline)
	// This captures the current state as version 1
	{
		version: 1,
		name: 'initial_schema',
		up: async (db) => {
			await db.execAsync(`
				CREATE TABLE IF NOT EXISTS decks (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					description TEXT,
					emoji TEXT,
					createdAt TEXT NOT NULL
				);
				
				CREATE TABLE IF NOT EXISTS flashcards (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					question TEXT NOT NULL,
					answer TEXT NOT NULL,
					deckId INTEGER NOT NULL,
					FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
				);

				CREATE TABLE IF NOT EXISTS quiz_sessions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					deckId INTEGER NOT NULL,
					startedAt TEXT NOT NULL,
					endedAt TEXT,
					totalTimeSpent INTEGER,
					FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE
				);

				CREATE TABLE IF NOT EXISTS quiz_answers (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					sessionId INTEGER NOT NULL,
					flashcardId INTEGER NOT NULL,
					responseType TEXT NOT NULL,
					answeredAt TEXT NOT NULL,
					FOREIGN KEY (sessionId) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
					FOREIGN KEY (flashcardId) REFERENCES flashcards(id) ON DELETE CASCADE
				);

				-- FTS5 virtual table for full-text search with trigram tokenizer
				CREATE VIRTUAL TABLE IF NOT EXISTS flashcards_fts USING fts5(
					question,
					answer,
					content='flashcards',
					content_rowid='id',
					tokenize='trigram'
				);

				-- FTS5 virtual table for deck search
				CREATE VIRTUAL TABLE IF NOT EXISTS decks_fts USING fts5(
					title,
					description,
					content='decks',
					content_rowid='id',
					tokenize='trigram'
				);

				-- Triggers to keep FTS index in sync with flashcards table
				CREATE TRIGGER IF NOT EXISTS flashcards_ai AFTER INSERT ON flashcards BEGIN
					INSERT INTO flashcards_fts(rowid, question, answer) VALUES (new.id, new.question, new.answer);
				END;

				CREATE TRIGGER IF NOT EXISTS flashcards_ad AFTER DELETE ON flashcards BEGIN
					INSERT INTO flashcards_fts(flashcards_fts, rowid, question, answer) VALUES('delete', old.id, old.question, old.answer);
				END;

				CREATE TRIGGER IF NOT EXISTS flashcards_au AFTER UPDATE ON flashcards BEGIN
					INSERT INTO flashcards_fts(flashcards_fts, rowid, question, answer) VALUES('delete', old.id, old.question, old.answer);
					INSERT INTO flashcards_fts(rowid, question, answer) VALUES (new.id, new.question, new.answer);
				END;

				-- Triggers to keep FTS index in sync with decks table
				CREATE TRIGGER IF NOT EXISTS decks_ai AFTER INSERT ON decks BEGIN
					INSERT INTO decks_fts(rowid, title, description) VALUES (new.id, new.title, COALESCE(new.description, ''));
				END;

				CREATE TRIGGER IF NOT EXISTS decks_ad AFTER DELETE ON decks BEGIN
					INSERT INTO decks_fts(decks_fts, rowid, title, description) VALUES('delete', old.id, old.title, COALESCE(old.description, ''));
				END;

				CREATE TRIGGER IF NOT EXISTS decks_au AFTER UPDATE ON decks BEGIN
					INSERT INTO decks_fts(decks_fts, rowid, title, description) VALUES('delete', old.id, old.title, COALESCE(old.description, ''));
					INSERT INTO decks_fts(rowid, title, description) VALUES (new.id, new.title, COALESCE(new.description, ''));
				END;
			`);
		},
		down: async (db) => {
			await db.execAsync(`
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
				DROP TABLE IF EXISTS flashcards;
				DROP TABLE IF EXISTS decks;
			`);
		},
	},

	// ============================================================
	// ADD NEW MIGRATIONS BELOW THIS LINE
	// ============================================================
	
	// Migration 2: Remove emoji column from decks table
	{
		version: 2,
		name: 'remove_emoji_from_decks',
		up: async (db) => {
			// SQLite doesn't support DROP COLUMN directly, need table recreation
			await db.execAsync(`
				-- Create temporary table without emoji column
				CREATE TABLE decks_new (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					description TEXT,
					createdAt TEXT NOT NULL
				);
				
				-- Copy data from old table
				INSERT INTO decks_new (id, title, description, createdAt)
				SELECT id, title, description, createdAt FROM decks;
				
				-- Drop old table
				DROP TABLE decks;
				
				-- Rename new table
				ALTER TABLE decks_new RENAME TO decks;
				
				-- Rebuild FTS indexes for decks
				INSERT INTO decks_fts(decks_fts) VALUES('rebuild');
			`);
		},
		down: async (db) => {
			// Add emoji column back if needed to rollback
			await db.execAsync(`
				CREATE TABLE decks_new (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					description TEXT,
					emoji TEXT,
					createdAt TEXT NOT NULL
				);
				
				INSERT INTO decks_new (id, title, description, createdAt)
				SELECT id, title, description, createdAt FROM decks;
				
				DROP TABLE decks;
				ALTER TABLE decks_new RENAME TO decks;
				
				INSERT INTO decks_fts(decks_fts) VALUES('rebuild');
			`);
		},
	},
];

/**
 * Get the latest migration version
 */
export function getLatestVersion(): number {
	return migrations.length > 0 ? migrations[migrations.length - 1].version : 0;
}
