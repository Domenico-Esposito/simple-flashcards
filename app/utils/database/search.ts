import type { Flashcard } from '@/types';

import { getDb } from './connection';
import { getAllDecks } from './decks';
import { isFts5Supported } from './fts';

export interface SearchResult {
  matchingDeckIds: number[];
  flashcardsByDeck: Record<number, Flashcard[]>;
}

export async function searchDecks(query: string): Promise<number[]> {
  if (!query.trim()) {
    const allDecks = await getAllDecks();
    return allDecks.map((deck) => deck.id);
  }

  if (isFts5Supported()) {
    const escapedQuery = query.replace(/"/g, '""');
    const result = await getDb().getAllAsync<{ id: number }>(
      `SELECT DISTINCT d.id FROM decks d
       LEFT JOIN flashcards f ON f.deckId = d.id
       WHERE d.id IN (SELECT rowid FROM decks_fts WHERE decks_fts MATCH ?)
          OR f.id IN (SELECT rowid FROM flashcards_fts WHERE flashcards_fts MATCH ?)
       ORDER BY d.createdAt DESC`,
      [`"${escapedQuery}"`, `"${escapedQuery}"`],
    );
    return result.map((row) => row.id);
  }

  const likeQuery = `%${query}%`;
  const result = await getDb().getAllAsync<{ id: number }>(
    `SELECT DISTINCT d.id FROM decks d
     LEFT JOIN flashcards f ON f.deckId = d.id
     WHERE d.title LIKE ? OR d.description LIKE ?
        OR f.question LIKE ? OR f.answer LIKE ?
     ORDER BY d.createdAt DESC`,
    [likeQuery, likeQuery, likeQuery, likeQuery],
  );
  return result.map((row) => row.id);
}

export async function searchFlashcards(query: string): Promise<Record<number, Flashcard[]>> {
  if (!query.trim()) {
    return {};
  }

  let result: Flashcard[];

  if (isFts5Supported()) {
    const escapedQuery = query.replace(/"/g, '""');
    result = await getDb().getAllAsync<Flashcard>(
      `SELECT f.* FROM flashcards f
       WHERE f.id IN (SELECT rowid FROM flashcards_fts WHERE flashcards_fts MATCH ?)
       ORDER BY f.deckId, f.id`,
      [`"${escapedQuery}"`],
    );
  } else {
    const likeQuery = `%${query}%`;
    result = await getDb().getAllAsync<Flashcard>(
      `SELECT f.* FROM flashcards f
       WHERE f.question LIKE ? OR f.answer LIKE ?
       ORDER BY f.deckId, f.id`,
      [likeQuery, likeQuery],
    );
  }

  const grouped: Record<number, Flashcard[]> = {};
  for (const flashcard of result) {
    if (!grouped[flashcard.deckId]) {
      grouped[flashcard.deckId] = [];
    }
    grouped[flashcard.deckId].push(flashcard);
  }

  return grouped;
}

export async function search(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    const allDecks = await getAllDecks();
    return {
      matchingDeckIds: allDecks.map((deck) => deck.id),
      flashcardsByDeck: {},
    };
  }

  const [matchingDeckIds, flashcardsByDeck] = await Promise.all([
    searchDecks(query),
    searchFlashcards(query),
  ]);

  const flashcardDeckIds = Object.keys(flashcardsByDeck).map(Number);
  const allMatchingDeckIds = [...new Set([...matchingDeckIds, ...flashcardDeckIds])];

  return {
    matchingDeckIds: allMatchingDeckIds,
    flashcardsByDeck,
  };
}
