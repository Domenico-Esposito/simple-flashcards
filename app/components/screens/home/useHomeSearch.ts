import { useEffect, useMemo, useState } from 'react';

import { search } from '@/utils/database';
import type { Deck } from '@/types';
import type { SearchState } from '@/components/screens/home/types';

const EMPTY_SEARCH_STATE: SearchState = {
  matchingDeckIds: [],
  sections: [],
};

export function useHomeSearch(decks: Deck[], searchQuery: string) {
  const [searchState, setSearchState] = useState<SearchState>(EMPTY_SEARCH_STATE);
  const trimmedSearchQuery = searchQuery.trim();

  useEffect(() => {
    if (!trimmedSearchQuery) {
      setSearchState(EMPTY_SEARCH_STATE);
      return;
    }

    let isActive = true;

    const performSearch = async () => {
      const { matchingDeckIds, flashcardsByDeck } = await search(trimmedSearchQuery);

      if (!isActive) {
        return;
      }

      setSearchState({
        matchingDeckIds,
        sections: decks.flatMap((deck) =>
          flashcardsByDeck[deck.id]?.length
            ? [
                {
                  deckId: deck.id,
                  deckTitle: deck.title,
                  data: flashcardsByDeck[deck.id],
                },
              ]
            : [],
        ),
      });
    };

    void performSearch();

    return () => {
      isActive = false;
    };
  }, [decks, trimmedSearchQuery]);

  const filteredDecks = useMemo(() => {
    if (!trimmedSearchQuery) {
      return decks;
    }

    const matchingDeckIds = new Set(searchState.matchingDeckIds);
    return decks.filter((deck) => matchingDeckIds.has(deck.id));
  }, [decks, searchState.matchingDeckIds, trimmedSearchQuery]);

  return {
    filteredDecks,
    searchState,
    trimmedSearchQuery,
  };
}
