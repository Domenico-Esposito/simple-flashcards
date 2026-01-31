import * as SQLite from 'expo-sqlite';
import { Deck, Flashcard, QuizSession, QuizAnswer, StatsSeries } from '@/types';

const DATABASE_NAME = 'flashcards.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<void> {
	db = await SQLite.openDatabaseAsync(DATABASE_NAME);

	await db.execAsync(`
    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
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

	// Rebuild FTS indexes to ensure they're in sync with existing data
	await rebuildFtsIndexes();
}

/**
 * Get the database instance
 */
function getDb(): SQLite.SQLiteDatabase {
	if (!db) {
		throw new Error('Database not initialized. Call initDatabase() first.');
	}
	return db;
}

// ==================== DECK OPERATIONS ====================

/**
 * Get all decks
 */
export async function getAllDecks(): Promise<Deck[]> {
	const result = await getDb().getAllAsync<Deck>('SELECT * FROM decks ORDER BY createdAt DESC');
	return result;
}

/**
 * Get a single deck by ID
 */
export async function getDeckById(id: number): Promise<Deck | null> {
	const result = await getDb().getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
	return result || null;
}

/**
 * Create a new deck
 */
export async function createDeck(title: string, description?: string): Promise<Deck> {
	const createdAt = new Date().toISOString();
	const result = await getDb().runAsync('INSERT INTO decks (title, description, createdAt) VALUES (?, ?, ?)', [title, description || null, createdAt]);

	return {
		id: result.lastInsertRowId,
		title,
		description,
		createdAt,
	};
}

/**
 * Update an existing deck
 */
export async function updateDeck(id: number, title: string, description?: string): Promise<void> {
	await getDb().runAsync('UPDATE decks SET title = ?, description = ? WHERE id = ?', [title, description || null, id]);
}

/**
 * Delete a deck and all its flashcards
 */
export async function deleteDeck(id: number): Promise<void> {
	await getDb().runAsync('DELETE FROM flashcards WHERE deckId = ?', [id]);
	await getDb().runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

// ==================== FLASHCARD OPERATIONS ====================

/**
 * Get all flashcards
 */
export async function getAllFlashcards(): Promise<Flashcard[]> {
	const result = await getDb().getAllAsync<Flashcard>('SELECT * FROM flashcards');
	return result;
}

/**
 * Get all flashcards for a deck
 */
export async function getFlashcardsByDeckId(deckId: number): Promise<Flashcard[]> {
	const result = await getDb().getAllAsync<Flashcard>('SELECT * FROM flashcards WHERE deckId = ?', [deckId]);
	return result;
}

/**
 * Get a single flashcard by ID
 */
export async function getFlashcardById(id: number): Promise<Flashcard | null> {
	const result = await getDb().getFirstAsync<Flashcard>('SELECT * FROM flashcards WHERE id = ?', [id]);
	return result || null;
}

/**
 * Create a new flashcard
 */
export async function createFlashcard(deckId: number, question: string, answer: string): Promise<Flashcard> {
	const result = await getDb().runAsync('INSERT INTO flashcards (deckId, question, answer) VALUES (?, ?, ?)', [deckId, question, answer]);

	return {
		id: result.lastInsertRowId,
		deckId,
		question,
		answer,
	};
}

/**
 * Update an existing flashcard
 */
export async function updateFlashcard(id: number, question: string, answer: string): Promise<void> {
	await getDb().runAsync('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?', [question, answer, id]);
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(id: number): Promise<void> {
	await getDb().runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
}

/**
 * Get flashcard count for a deck
 */
export async function getFlashcardCount(deckId: number): Promise<number> {
	const result = await getDb().getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM flashcards WHERE deckId = ?', [deckId]);
	return result?.count || 0;
}

// ==================== FTS5 SEARCH OPERATIONS ====================

/**
 * Rebuild FTS indexes from source tables
 * Called during initialization to ensure indexes are in sync
 */
async function rebuildFtsIndexes(): Promise<void> {
	const database = getDb();

	// Rebuild flashcards FTS index
	await database.execAsync(`
    INSERT INTO flashcards_fts(flashcards_fts) VALUES('rebuild');
  `);

	// Rebuild decks FTS index
	await database.execAsync(`
    INSERT INTO decks_fts(decks_fts) VALUES('rebuild');
  `);
}

/**
 * Search decks using FTS5 with trigram tokenizer
 * Returns deck IDs that match the query
 */
export async function searchDecks(query: string): Promise<number[]> {
	if (!query.trim()) {
		const allDecks = await getAllDecks();
		return allDecks.map((d) => d.id);
	}

	// Escape special FTS5 characters and wrap in quotes for literal matching
	const escapedQuery = query.replace(/"/g, '""');

	// Search in deck title/description OR in flashcard question/answer
	const result = await getDb().getAllAsync<{ id: number }>(
		`SELECT DISTINCT d.id FROM decks d
     LEFT JOIN flashcards f ON f.deckId = d.id
     WHERE d.id IN (SELECT rowid FROM decks_fts WHERE decks_fts MATCH ?)
        OR f.id IN (SELECT rowid FROM flashcards_fts WHERE flashcards_fts MATCH ?)
     ORDER BY d.createdAt DESC`,
		[`"${escapedQuery}"`, `"${escapedQuery}"`],
	);

	return result.map((r) => r.id);
}

/**
 * Search flashcards using FTS5 with trigram tokenizer
 * Returns flashcards grouped by deck ID
 */
export async function searchFlashcards(query: string): Promise<Record<number, Flashcard[]>> {
	if (!query.trim()) {
		return {};
	}

	// Escape special FTS5 characters and wrap in quotes for literal matching
	const escapedQuery = query.replace(/"/g, '""');

	const result = await getDb().getAllAsync<Flashcard>(
		`SELECT f.* FROM flashcards f
     WHERE f.id IN (SELECT rowid FROM flashcards_fts WHERE flashcards_fts MATCH ?)
     ORDER BY f.deckId, f.id`,
		[`"${escapedQuery}"`],
	);

	// Group by deckId
	const grouped: Record<number, Flashcard[]> = {};
	for (const fc of result) {
		if (!grouped[fc.deckId]) {
			grouped[fc.deckId] = [];
		}
		grouped[fc.deckId].push(fc);
	}

	return grouped;
}

export interface SearchResult {
	matchingDeckIds: number[];
	flashcardsByDeck: Record<number, Flashcard[]>;
}

/**
 * Combined search on decks and flashcards using FTS5
 */
export async function search(query: string): Promise<SearchResult> {
	if (!query.trim()) {
		const allDecks = await getAllDecks();
		return {
			matchingDeckIds: allDecks.map((d) => d.id),
			flashcardsByDeck: {},
		};
	}

	const [matchingDeckIds, flashcardsByDeck] = await Promise.all([searchDecks(query), searchFlashcards(query)]);

	// Merge deck IDs: include decks that match directly OR have matching flashcards
	const flashcardDeckIds = Object.keys(flashcardsByDeck).map(Number);
	const allMatchingDeckIds = [...new Set([...matchingDeckIds, ...flashcardDeckIds])];

	return {
		matchingDeckIds: allMatchingDeckIds,
		flashcardsByDeck,
	};
}

// ==================== QUIZ OPERATIONS ====================

export async function createQuizSession(deckId: number): Promise<number> {
	const startedAt = new Date().toISOString();
	const result = await getDb().runAsync('INSERT INTO quiz_sessions (deckId, startedAt) VALUES (?, ?)', [deckId, startedAt]);
	return result.lastInsertRowId;
}

export async function updateQuizSession(id: number, endedAt: string, totalTimeSpent: number): Promise<void> {
	await getDb().runAsync('UPDATE quiz_sessions SET endedAt = ?, totalTimeSpent = ? WHERE id = ?', [endedAt, totalTimeSpent, id]);
}

export async function createQuizAnswer(sessionId: number, flashcardId: number, responseType: string): Promise<void> {
	const answeredAt = new Date().toISOString();
	await getDb().runAsync('INSERT INTO quiz_answers (sessionId, flashcardId, responseType, answeredAt) VALUES (?, ?, ?, ?)', [
		sessionId,
		flashcardId,
		responseType,
		answeredAt,
	]);
}

// ==================== STATS OPERATIONS ====================

export async function getStats(
	interval: 'day' | 'month' | 'quarter' | 'semester' | 'year',
	deckId?: number,
	startDate?: string
): Promise<StatsSeries[]> {
	let periodExpr = "strftime('%Y-%m-%d', a.answeredAt)";

	if (interval === 'month') {
		periodExpr = "strftime('%Y-%m', a.answeredAt)";
	} else if (interval === 'year') {
		periodExpr = "strftime('%Y', a.answeredAt)";
	} else if (interval === 'quarter') {
		periodExpr = "strftime('%Y', a.answeredAt) || '-Q' || ((CAST(strftime('%m', a.answeredAt) AS INTEGER) - 1) / 3 + 1)";
	} else if (interval === 'semester') {
		periodExpr = "strftime('%Y', a.answeredAt) || '-S' || ((CAST(strftime('%m', a.answeredAt) AS INTEGER) - 1) / 6 + 1)";
	}

	let whereClause = '1=1';
	const params: any[] = [];

	if (deckId) {
		whereClause += ' AND s.deckId = ?';
		params.push(deckId);
	}

	if (startDate) {
		whereClause += ' AND a.answeredAt >= ?';
		params.push(startDate);
	}

	const query = `
      SELECT 
        ${periodExpr} as period,
        SUM(CASE WHEN a.responseType = 'correct' THEN 1 ELSE 0 END) as correct,
        SUM(CASE WHEN a.responseType = 'incorrect' THEN 1 ELSE 0 END) as incorrect
      FROM quiz_answers a
      JOIN quiz_sessions s ON a.sessionId = s.id
      WHERE ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `;

	const result = await getDb().getAllAsync<StatsSeries>(query, params);
	return result;
}

export async function getKPIs(deckId?: number): Promise<{
	totalQuizzes: number;
	accuracy: number;
	totalAnswers: number;
	totalTime: number;
	avgTimePerQuiz: number;
}> {
	let whereSession = '1=1';
	let whereAnswer = '1=1';
	const paramsSession: any[] = [];
	const paramsAnswer: any[] = [];

	if (deckId) {
		whereSession += ' AND deckId = ?';
		paramsSession.push(deckId);

		whereAnswer += ' AND sessionId IN (SELECT id FROM quiz_sessions WHERE deckId = ?)';
		paramsAnswer.push(deckId);
	}

	const sessionQuery = `
        SELECT 
            COUNT(*) as totalQuizzes,
            SUM(totalTimeSpent) as totalTime
        FROM quiz_sessions
        WHERE ${whereSession} AND endedAt IS NOT NULL
    `;

	const answerQuery = `
        SELECT
            COUNT(*) as totalAnswers,
            SUM(CASE WHEN responseType = 'correct' THEN 1 ELSE 0 END) as correctAnswers
        FROM quiz_answers
        WHERE ${whereAnswer}
    `;

	const [sessionResult, answerResult] = await Promise.all([
		getDb().getFirstAsync<{ totalQuizzes: number; totalTime: number }>(sessionQuery, paramsSession),
		getDb().getFirstAsync<{ totalAnswers: number; correctAnswers: number }>(answerQuery, paramsAnswer),
	]);

	const totalQuizzes = sessionResult?.totalQuizzes || 0;
	const totalTime = sessionResult?.totalTime || 0;
	const totalAnswers = answerResult?.totalAnswers || 0;
	const correctAnswers = answerResult?.correctAnswers || 0;

	return {
		totalQuizzes,
		totalTime,
		totalAnswers,
		accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
		avgTimePerQuiz: totalQuizzes > 0 ? totalTime / totalQuizzes : 0,
	};
}
