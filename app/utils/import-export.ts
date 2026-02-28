import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { DeckExport, DeckWithFlashcards } from '@/types';
import * as db from './database';

/**
 * Export a deck with all its flashcards to JSON format
 */
export async function exportDeckToJson(deckId: number): Promise<string> {
	const deck = await db.getDeckById(deckId);
	if (!deck) {
		throw new Error('Deck not found');
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
			dialogTitle: 'Esporta mazzo',
		});
	} else {
		throw new Error('La condivisione non è disponibile su questo dispositivo');
	}
}

/**
 * Import a deck from a JSON URL
 */
export async function importDeckFromUrl(url: string): Promise<DeckWithFlashcards> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Errore nel recupero del file: ${response.status}`);
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
		throw new Error('Formato JSON non valido');
	}

	const deckData = data as DeckExport;

	if (!deckData.title || typeof deckData.title !== 'string') {
		throw new Error('Il campo "title" è obbligatorio');
	}

	if (!Array.isArray(deckData.flashcards)) {
		throw new Error('Il campo "flashcards" deve essere un array');
	}

	// Validate flashcards
	for (let i = 0; i < deckData.flashcards.length; i++) {
		const fc = deckData.flashcards[i];
		if (!fc.question || typeof fc.question !== 'string') {
			throw new Error(`Flashcard ${i + 1}: campo "question" mancante`);
		}
		if (!fc.answer || typeof fc.answer !== 'string') {
			throw new Error(`Flashcard ${i + 1}: campo "answer" mancante`);
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
