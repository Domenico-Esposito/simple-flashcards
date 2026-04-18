import type {
  Flashcard,
  FlashcardOption,
  MultipleChoiceFlashcard,
  StandardFlashcard,
} from '@/types';

import { getDb } from './connection';

type FlashcardRow = {
  id: number;
  question: string;
  answer: string;
  deckId: number;
  type: string;
};

function buildFlashcard(row: FlashcardRow, options: FlashcardOption[]): Flashcard {
  if (row.type === 'multiple_choice') {
    return {
      id: row.id,
      question: row.question,
      deckId: row.deckId,
      type: 'multiple_choice',
      options,
    } as MultipleChoiceFlashcard;
  }

  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    deckId: row.deckId,
    type: 'standard',
  } as StandardFlashcard;
}

export async function getFlashcardsByDeckId(deckId: number): Promise<Flashcard[]> {
  const rows = await getDb().getAllAsync<FlashcardRow>(
    'SELECT * FROM flashcards WHERE deckId = ?',
    [deckId],
  );

  const multipleChoiceIds = rows
    .filter((row) => row.type === 'multiple_choice')
    .map((row) => row.id);
  let optionsByCard: Record<number, FlashcardOption[]> = {};

  if (multipleChoiceIds.length > 0) {
    const placeholders = multipleChoiceIds.map(() => '?').join(',');
    const allOptions = await getDb().getAllAsync<FlashcardOption>(
      `SELECT * FROM flashcard_options WHERE flashcardId IN (${placeholders}) ORDER BY sortOrder`,
      multipleChoiceIds,
    );

    for (const option of allOptions) {
      if (!optionsByCard[option.flashcardId]) {
        optionsByCard[option.flashcardId] = [];
      }

      optionsByCard[option.flashcardId].push({ ...option, isCorrect: !!option.isCorrect });
    }
  }

  return rows.map((row) => buildFlashcard(row, optionsByCard[row.id] || []));
}

export async function getFlashcardById(id: number): Promise<Flashcard | null> {
  const row = await getDb().getFirstAsync<FlashcardRow>('SELECT * FROM flashcards WHERE id = ?', [
    id,
  ]);

  if (!row) return null;

  let options: FlashcardOption[] = [];
  if (row.type === 'multiple_choice') {
    options = await getDb().getAllAsync<FlashcardOption>(
      'SELECT * FROM flashcard_options WHERE flashcardId = ? ORDER BY sortOrder',
      [id],
    );
    options = options.map((option) => ({ ...option, isCorrect: !!option.isCorrect }));
  }

  return buildFlashcard(row, options);
}

export async function createFlashcard(
  deckId: number,
  question: string,
  answer: string,
): Promise<Flashcard> {
  const result = await getDb().runAsync(
    "INSERT INTO flashcards (deckId, question, answer, type) VALUES (?, ?, ?, 'standard')",
    [deckId, question, answer],
  );

  return {
    id: result.lastInsertRowId,
    deckId,
    question,
    answer,
    type: 'standard',
  };
}

export async function createMultipleChoiceFlashcard(
  deckId: number,
  question: string,
  options: Array<{ text: string; isCorrect: boolean }>,
): Promise<Flashcard> {
  const result = await getDb().runAsync(
    "INSERT INTO flashcards (deckId, question, answer, type) VALUES (?, ?, '', 'multiple_choice')",
    [deckId, question],
  );

  const flashcardId = result.lastInsertRowId;
  const savedOptions: FlashcardOption[] = [];

  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    const optionResult = await getDb().runAsync(
      'INSERT INTO flashcard_options (flashcardId, text, sortOrder, isCorrect) VALUES (?, ?, ?, ?)',
      [flashcardId, option.text, index, option.isCorrect ? 1 : 0],
    );
    savedOptions.push({
      id: optionResult.lastInsertRowId,
      flashcardId,
      text: option.text,
      sortOrder: index,
      isCorrect: option.isCorrect,
    });
  }

  return {
    id: flashcardId,
    deckId,
    question,
    type: 'multiple_choice',
    options: savedOptions,
  };
}

export async function updateFlashcard(id: number, question: string, answer: string): Promise<void> {
  await getDb().runAsync(
    "UPDATE flashcards SET question = ?, answer = ?, type = 'standard' WHERE id = ?",
    [question, answer, id],
  );
  await getDb().runAsync('DELETE FROM flashcard_options WHERE flashcardId = ?', [id]);
}

export async function updateMultipleChoiceFlashcard(
  id: number,
  question: string,
  options: Array<{ text: string; isCorrect: boolean }>,
): Promise<void> {
  await getDb().runAsync(
    "UPDATE flashcards SET question = ?, answer = '', type = 'multiple_choice' WHERE id = ?",
    [question, id],
  );
  await getDb().runAsync('DELETE FROM flashcard_options WHERE flashcardId = ?', [id]);

  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    await getDb().runAsync(
      'INSERT INTO flashcard_options (flashcardId, text, sortOrder, isCorrect) VALUES (?, ?, ?, ?)',
      [id, option.text, index, option.isCorrect ? 1 : 0],
    );
  }
}

export async function deleteFlashcard(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
}

export async function getFlashcardCount(deckId: number): Promise<number> {
  const result = await getDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM flashcards WHERE deckId = ?',
    [deckId],
  );
  return result?.count || 0;
}
