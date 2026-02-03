import * as SQLite from 'expo-sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import { Deck, Flashcard, QuizSession, QuizAnswer, StatsSeries } from '@/types';
import { runMigrations } from './migrationRunner';

const DATABASE_NAME = 'flashcards.db';
const BACKUP_DIRECTORY_NAME = 'flashcards-backups';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and run migrations
 */
export async function initDatabase(): Promise<void> {
	db = await SQLite.openDatabaseAsync(DATABASE_NAME);

	// Run all pending migrations
	await runMigrations(db);

	// Rebuild FTS indexes to ensure they're in sync with existing data
	await rebuildFtsIndexes();
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
	if (db) {
		await db.closeAsync();
		db = null;
	}
}

/**
 * Reinitialize the database connection and rebuild indexes
 */
export async function reinitializeDatabase(): Promise<void> {
	await closeDatabase();
	await initDatabase();
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

function getBackupDirectory(): Directory {
	const backupDirectory = new Directory(Paths.document, BACKUP_DIRECTORY_NAME);
	backupDirectory.create({ idempotent: true });
	return backupDirectory;
}

/**
 * Backup the database into a file on disk
 */
export async function backupDatabaseToFile(): Promise<File> {
	const backupDirectory = getBackupDirectory();
	const filename = `flashcards_backup_${Date.now()}.db`;
	const backupFile = new File(backupDirectory, filename);

	if (backupFile.exists) {
		backupFile.delete();
	}

	const serialized = await getDb().serializeAsync();
	backupFile.create({ intermediates: true });
	backupFile.write(serialized);

	return backupFile;
}

/**
 * Restore the database from a backup file
 */
export async function restoreDatabaseFromFile(file: File): Promise<void> {
	const backupDirectory = getBackupDirectory();
	const tempFile = new File(backupDirectory, `restore_${Date.now()}.db`);

	if (tempFile.exists) {
		tempFile.delete();
	}

	tempFile.create({ intermediates: true });
	if (tempFile.exists) {
		tempFile.delete();
	}
	file.copy(tempFile);

	const serialized = await tempFile.bytes();
	const sourceDb = await SQLite.deserializeDatabaseAsync(serialized);
	try {
		await SQLite.backupDatabaseAsync({
			sourceDatabase: sourceDb,
			destDatabase: getDb(),
		});
	} finally {
		await sourceDb.closeAsync();
		if (tempFile.exists) {
			tempFile.delete();
		}
	}

	await reinitializeDatabase();
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
export async function createDeck(title: string, description?: string, emoji?: string): Promise<Deck> {
	const createdAt = new Date().toISOString();
	const result = await getDb().runAsync('INSERT INTO decks (title, description, emoji, createdAt) VALUES (?, ?, ?, ?)', [title, description || null, emoji || null, createdAt]);

	return {
		id: result.lastInsertRowId,
		title,
		description,
		emoji,
		createdAt,
	};
}

/**
 * Update an existing deck
 */
export async function updateDeck(id: number, title: string, description?: string, emoji?: string): Promise<void> {
	await getDb().runAsync('UPDATE decks SET title = ?, description = ?, emoji = ? WHERE id = ?', [title, description || null, emoji || null, id]);
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

export async function deleteQuizSession(id: number): Promise<void> {
	await getDb().runAsync('DELETE FROM quiz_sessions WHERE id = ?', [id]);
}

export async function createQuizAnswer(sessionId: number, flashcardId: number, responseType: string): Promise<void> {
	const answeredAt = new Date().toISOString();
	await getDb().runAsync('INSERT INTO quiz_answers (sessionId, flashcardId, responseType, answeredAt) VALUES (?, ?, ?, ?)', [sessionId, flashcardId, responseType, answeredAt]);
}

// ==================== STATS OPERATIONS ====================

export async function getStats(interval: 'day' | 'month' | 'quarter' | 'semester' | 'year', deckId?: number, startDate?: string): Promise<StatsSeries[]> {
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

/**
 * Reset all statistics by deleting all quiz sessions and answers
 */
export async function resetAllStats(): Promise<void> {
	await getDb().runAsync('DELETE FROM quiz_answers');
	await getDb().runAsync('DELETE FROM quiz_sessions');
}
