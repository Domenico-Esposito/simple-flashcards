import type { Deck } from '@/types';

import { getDb } from './connection';

export async function getAllDecks(): Promise<Deck[]> {
  return await getDb().getAllAsync<Deck>('SELECT * FROM decks ORDER BY createdAt DESC');
}

export async function getDeckById(id: number): Promise<Deck | null> {
  const result = await getDb().getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
  return result || null;
}

export async function createDeck(title: string, description?: string): Promise<Deck> {
  const createdAt = new Date().toISOString();
  const result = await getDb().runAsync(
    'INSERT INTO decks (title, description, createdAt) VALUES (?, ?, ?)',
    [title, description || null, createdAt],
  );

  return {
    id: result.lastInsertRowId,
    title,
    description,
    createdAt,
  };
}

export async function updateDeck(id: number, title: string, description?: string): Promise<void> {
  await getDb().runAsync('UPDATE decks SET title = ?, description = ? WHERE id = ?', [
    title,
    description || null,
    id,
  ]);
}

export async function deleteDeck(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM flashcards WHERE deckId = ?', [id]);
  await getDb().runAsync('DELETE FROM decks WHERE id = ?', [id]);
}
