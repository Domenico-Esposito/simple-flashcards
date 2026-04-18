import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { DeckExport, DeckWithFlashcards, Flashcard } from '@/types';
import * as db from './database';
import i18n from '@/i18n';

/**
 * Export a deck with all its flashcards to JSON format
 */
export async function exportDeckToJson(deckId: number): Promise<string> {
  const deck = await db.getDeckById(deckId);
  if (!deck) {
    throw new Error(i18n.t('errors.deckNotFound'));
  }

  const flashcards = await db.getFlashcardsByDeckId(deckId);

  const exportData: DeckExport = {
    title: deck.title,
    description: deck.description,
    flashcards: flashcards.map((fc) => {
      if (fc.type === 'multiple_choice') {
        return {
          question: fc.question,
          type: 'multiple_choice' as const,
          options: fc.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        };
      }
      return {
        question: fc.question,
        answer: fc.answer,
      };
    }),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Share a JSON file via the system share sheet
 */
export async function shareJsonFile(jsonContent: string, filename: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  file.write(jsonContent);

  if (await isAvailableAsync()) {
    await shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: i18n.t('export.dialogTitle'),
    });
  } else {
    throw new Error(i18n.t('errors.sharingNotAvailable'));
  }
}

/**
 * Import a deck from a JSON URL
 */
export async function importDeckFromUrl(url: string): Promise<DeckWithFlashcards> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(i18n.t('errors.fileDownload', { status: response.status }));
  }

  const data = await response.json();
  return importDeckFromJson(data);
}

/**
 * Import a deck from a JSON object
 */
export async function importDeckFromJson(data: unknown): Promise<DeckWithFlashcards> {
  // Validate structure
  if (!data || typeof data !== 'object') {
    throw new Error(i18n.t('errors.invalidJsonFormat'));
  }

  const deckData = data as DeckExport;

  if (!deckData.title || typeof deckData.title !== 'string') {
    throw new Error(i18n.t('errors.titleRequired'));
  }

  if (!Array.isArray(deckData.flashcards)) {
    throw new Error(i18n.t('errors.flashcardsArrayRequired'));
  }

  // Validate flashcards
  for (let i = 0; i < deckData.flashcards.length; i++) {
    const fc = deckData.flashcards[i];
    if (!fc.question || typeof fc.question !== 'string') {
      throw new Error(i18n.t('errors.questionMissing', { index: i + 1 }));
    }
    if ('type' in fc && fc.type === 'multiple_choice') {
      if (!Array.isArray(fc.options) || fc.options.length < 2) {
        throw new Error(i18n.t('errors.optionsMissing', { index: i + 1 }));
      }
      const correctCount = fc.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new Error(i18n.t('errors.correctOptionMissing', { index: i + 1 }));
      }
    } else {
      const stdFc = fc as { question: string; answer: string };
      if (!stdFc.answer || typeof stdFc.answer !== 'string') {
        throw new Error(i18n.t('errors.answerMissing', { index: i + 1 }));
      }
    }
  }

  // Create deck
  const deck = await db.createDeck(deckData.title, deckData.description);

  // Create flashcards
  const flashcards: Flashcard[] = [];
  for (const fc of deckData.flashcards) {
    if ('type' in fc && fc.type === 'multiple_choice') {
      const flashcard = await db.createMultipleChoiceFlashcard(deck.id, fc.question, fc.options);
      flashcards.push(flashcard);
    } else {
      const stdFc = fc as { question: string; answer: string };
      const flashcard = await db.createFlashcard(deck.id, stdFc.question, stdFc.answer);
      flashcards.push(flashcard);
    }
  }

  return {
    ...deck,
    flashcards,
  };
}
