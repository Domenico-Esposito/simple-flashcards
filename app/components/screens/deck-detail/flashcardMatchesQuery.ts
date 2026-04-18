import type { Flashcard } from '@/types';

export function flashcardMatchesQuery(flashcard: Flashcard, query: string) {
  if (flashcard.question.toLowerCase().includes(query)) {
    return true;
  }

  if (flashcard.type === 'multiple_choice') {
    return flashcard.options.some((option) => option.text.toLowerCase().includes(query));
  }

  return flashcard.answer.toLowerCase().includes(query);
}
