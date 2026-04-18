import { getDb } from './connection';

export async function createQuizSession(deckId: number): Promise<number> {
  const startedAt = new Date().toISOString();
  const result = await getDb().runAsync(
    'INSERT INTO quiz_sessions (deckId, startedAt) VALUES (?, ?)',
    [deckId, startedAt],
  );
  return result.lastInsertRowId;
}

export async function updateQuizSession(
  id: number,
  endedAt: string,
  totalTimeSpent: number,
  totalCards: number,
  easyCount: number,
  hardCount: number,
): Promise<void> {
  await getDb().runAsync(
    'UPDATE quiz_sessions SET endedAt = ?, totalTimeSpent = ?, totalCards = ?, easyCount = ?, hardCount = ? WHERE id = ?',
    [endedAt, totalTimeSpent, totalCards, easyCount, hardCount, id],
  );
}

export async function deleteQuizSession(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM quiz_sessions WHERE id = ?', [id]);
}

export async function createQuizAnswer(
  sessionId: number,
  flashcardId: number,
  responseType: string,
): Promise<void> {
  const answeredAt = new Date().toISOString();
  await getDb().runAsync(
    'INSERT INTO quiz_answers (sessionId, flashcardId, responseType, answeredAt) VALUES (?, ?, ?, ?)',
    [sessionId, flashcardId, responseType, answeredAt],
  );
}
