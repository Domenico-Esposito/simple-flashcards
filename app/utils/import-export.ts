import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { DeckExport, DeckWithFlashcards } from '@/types';
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
		flashcards: flashcards.map((fc) => ({
			question: fc.question,
			answer: fc.answer,
		})),
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
		if (!fc.answer || typeof fc.answer !== 'string') {
			throw new Error(i18n.t('errors.answerMissing', { index: i + 1 }));
		}
	}

	// Create deck
	const deck = await db.createDeck(deckData.title, deckData.description);

	// Create flashcards - store markdown content directly
	const flashcards = [];
	for (const fc of deckData.flashcards) {
		const flashcard = await db.createFlashcard(deck.id, fc.question, fc.answer);
		flashcards.push(flashcard);
	}

	return {
		...deck,
		flashcards,
	};
}
