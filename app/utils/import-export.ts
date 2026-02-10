import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { DeckExport, DeckWithFlashcards } from '@/types';
import * as db from './database';

/**
 * Wrap HTML content with <html> tags for storage
 */
function wrapHtml(content: string): string {
	return `<html>${content}</html>`;
}

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
 * Export all decks to a single JSON array
 */
export async function exportAllDecksToJson(): Promise<string> {
	const decks = await db.getAllDecks();
	const exportData: DeckExport[] = [];

	for (const deck of decks) {
		const flashcards = await db.getFlashcardsByDeckId(deck.id);
		exportData.push({
			title: deck.title,
			description: deck.description,
			flashcards: flashcards.map((fc) => ({
				question: fc.question,
				answer: fc.answer,
			})),
		});
	}

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

	// Create flashcards - wrap HTML content
	const flashcards = [];
	for (const fc of deckData.flashcards) {
		const questionHtml = wrapHtml(fc.question);
		const answerHtml = wrapHtml(fc.answer);
		const flashcard = await db.createFlashcard(deck.id, questionHtml, answerHtml);
		flashcards.push(flashcard);
	}

	return {
		...deck,
		flashcards,
	};
}

/**
 * JSON format documentation
 */
export const JSON_FORMAT_DOCS = `
## Formato JSON per Import/Export

\`\`\`json
{
  "title": "Nome del mazzo",
  "description": "Descrizione opzionale",
  "flashcards": [
    {
      "question": "Qual è la capitale d'Italia?",
      "answer": "La capitale d'Italia è <b>Roma</b>."
    },
    {
      "question": "<h3>Domanda con heading</h3><p>Testo della domanda</p>",
      "answer": "Risposta con <i>corsivo</i> e <code>codice</code>"
    }
  ]
}
\`\`\`

### Campi:
- **title** (obbligatorio): Nome del mazzo
- **description** (opzionale): Descrizione del mazzo
- **flashcards** (obbligatorio): Array di flashcard
  - **question** (obbligatorio): Testo della domanda (HTML)
  - **answer** (obbligatorio): Testo della risposta (HTML)

### Formattazione HTML supportata:
- **Grassetto**: \`<b>testo</b>\` o \`<strong>testo</strong>\`
- *Corsivo*: \`<i>testo</i>\` o \`<em>testo</em>\`
- ~~Barrato~~: \`<s>testo</s>\` o \`<del>testo</del>\`
- \`Codice inline\`: \`<code>codice</code>\`
- Heading: \`<h1>\`, \`<h2>\`, \`<h3>\`
- Liste: \`<ul><li>item</li></ul>\` o \`<ol><li>item</li></ol>\`
- Paragrafi: \`<p>testo</p>\`
- A capo: \`<br>\`
`;
