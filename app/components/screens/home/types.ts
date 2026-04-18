import type { Deck, Flashcard } from '@/types';

export type SearchResultSection = {
  deckId: number;
  deckTitle: string;
  data: Flashcard[];
};

export type SearchState = {
  matchingDeckIds: number[];
  sections: SearchResultSection[];
};

export type DeckCollectionProps = {
  decks: Deck[];
  deckCounts: Record<number, number>;
  isLargeScreen: boolean;
  onPress: (deckId: number) => void;
  onLongPress: (deck: Deck) => void;
};
