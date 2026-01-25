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
  const deck = await db.createDeck(
    deckData.title,
    deckData.description
  );
  
  // Create flashcards
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
      "question": "Domanda 1",
      "answer": "Risposta 1 (supporta **Markdown**)"
    },
    {
      "question": "Domanda 2",
      "answer": "Risposta 2"
    }
  ]
}
\`\`\`

### Campi:
- **title** (obbligatorio): Nome del mazzo
- **description** (opzionale): Descrizione del mazzo
- **flashcards** (obbligatorio): Array di flashcard
  - **question** (obbligatorio): Testo della domanda
  - **answer** (obbligatorio): Testo della risposta (supporta Markdown)
`;
