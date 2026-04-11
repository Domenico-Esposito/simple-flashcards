import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FlatList, ScrollView, SectionList } from 'react-native';
import { Text, View, YStack } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { DeckCard } from '@/components/DeckCard';
import { FlashcardListItem } from '@/components/FlashcardListItem';
import { Header, createHeaderAction } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { getFlashcardCount, search } from '@/utils/database';
import { Deck, Flashcard } from '@/types';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';

type SearchResultSection = {
  deckId: number;
  deckTitle: string;
  data: Flashcard[];
};

type SearchState = {
  matchingDeckIds: number[];
  sections: SearchResultSection[];
};

const LIST_BOTTOM_PADDING = 20;

function EmptyState({ message, testID }: { message: string; testID: string }) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <Text color="$gray10" fontSize={16} textAlign="center" testID={testID}>
        {message}
      </Text>
    </YStack>
  );
}

function SearchSectionHeader({ title }: { title: string }) {
  return (
    <View backgroundColor="$background" paddingVertical="$2" marginTop="$3">
      <Text
        fontSize={13}
        fontWeight="600"
        color="$gray10"
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {title}
      </Text>
    </View>
  );
}

type DeckListContentProps = {
  decks: Deck[];
  deckCounts: Record<number, number>;
  onPress: (deckId: number) => void;
  onLongPress: (deck: Deck) => void;
};

function DeckGrid({ decks, deckCounts, onPress, onLongPress }: DeckListContentProps) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
      showsVerticalScrollIndicator={false}
    >
      <View flexDirection="row" flexWrap="wrap" margin={-6} testID="home-deck-grid">
        {decks.map((item) => (
          <View key={item.id} width="50%" padding={6}>
            <DeckCard
              deck={item}
              flashcardCount={deckCounts[item.id] || 0}
              onPress={() => onPress(item.id)}
              onLongPress={() => onLongPress(item)}
              testID={`home-deck-card-${item.id}`}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DeckMobileList({ decks, deckCounts, onPress, onLongPress }: DeckListContentProps) {
  return (
    <FlatList
      data={decks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <DeckCard
          deck={item}
          flashcardCount={deckCounts[item.id] || 0}
          onPress={() => onPress(item.id)}
          onLongPress={() => onLongPress(item)}
          testID={`home-deck-card-${item.id}`}
        />
      )}
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
      ItemSeparatorComponent={() => <View height={12} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

type SearchResultsContentProps = {
  sections: SearchResultSection[];
  onFlashcardPress: (flashcardId: number) => void;
};

function SearchResultsGrid({ sections, onFlashcardPress }: SearchResultsContentProps) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
      showsVerticalScrollIndicator={false}
    >
      {sections.map((section) => (
        <View key={section.deckId}>
          <SearchSectionHeader title={section.deckTitle} />
          <View
            flexDirection="row"
            flexWrap="wrap"
            margin={-6}
            testID={`home-search-results-grid-${section.deckId}`}
          >
            {section.data.map((item) => (
              <View key={item.id} width="50%" padding={6}>
                <FlashcardListItem
                  flashcard={item}
                  onPress={() => onFlashcardPress(item.id)}
                  testID={`home-search-flashcard-${item.id}`}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function SearchResultsMobileList({ sections, onFlashcardPress }: SearchResultsContentProps) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section }) => <SearchSectionHeader title={section.deckTitle} />}
      renderItem={({ item }) => (
        <FlashcardListItem
          flashcard={item}
          onPress={() => onFlashcardPress(item.id)}
          testID={`home-search-flashcard-${item.id}`}
        />
      )}
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
      ItemSeparatorComponent={() => <View height={10} />}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { decks, loadDecks, removeDeck } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();
  const [deckCounts, setDeckCounts] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const isLargeScreen = useIsLargeScreen();
  const [searchState, setSearchState] = useState<SearchState>({
    matchingDeckIds: [],
    sections: [],
  });
  const trimmedSearchQuery = searchQuery.trim();

  useEffect(() => {
    if (!trimmedSearchQuery) {
      setSearchState({ matchingDeckIds: [], sections: [] });
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

  const loadCounts = useCallback(async () => {
    if (decks.length === 0) {
      setDeckCounts({});
      return;
    }

    const entries = await Promise.all(
      decks.map(async (deck) => [deck.id, await getFlashcardCount(deck.id)] as const),
    );

    setDeckCounts(Object.fromEntries(entries));
  }, [decks]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useFocusEffect(
    useCallback(() => {
      void loadCounts();
    }, [loadCounts]),
  );

  const handleDeleteDeck = (deck: Deck) => {
    showAlert(t('deck.delete.title'), t('deck.delete.message', { title: deck.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeDeck(deck.id),
      },
    ]);
  };

  const handleDeckPress = (deckId: number) => router.push(`/deck/${deckId}`);
  const handleFlashcardPress = (flashcardId: number) =>
    router.push(`/flashcard-edit/${flashcardId}`);
  const hasDecks = decks.length > 0;
  const hasSearchResults = trimmedSearchQuery.length > 0 && searchState.sections.length > 0;

  let content: ReactNode;

  if (!hasDecks) {
    content = <EmptyState message={t('home.noDecks')} testID="home-empty-state" />;
  } else if (filteredDecks.length === 0) {
    content = (
      <EmptyState
        message={t('home.noSearchResults', { query: trimmedSearchQuery })}
        testID="home-search-empty-state"
      />
    );
  } else if (hasSearchResults) {
    content = isLargeScreen ? (
      <SearchResultsGrid sections={searchState.sections} onFlashcardPress={handleFlashcardPress} />
    ) : (
      <SearchResultsMobileList
        sections={searchState.sections}
        onFlashcardPress={handleFlashcardPress}
      />
    );
  } else {
    content = isLargeScreen ? (
      <DeckGrid
        decks={filteredDecks}
        deckCounts={deckCounts}
        onPress={handleDeckPress}
        onLongPress={handleDeleteDeck}
      />
    ) : (
      <DeckMobileList
        decks={filteredDecks}
        deckCounts={deckCounts}
        onPress={handleDeckPress}
        onLongPress={handleDeleteDeck}
      />
    );
  }

  return (
    <View flex={1} backgroundColor="$background" testID="home-screen">
      <Header
        title={t('home.title')}
        showBackButton={false}
        actions={[
          createHeaderAction({
            icon: 'add',
            label: t('home.newDeck'),
            onPress: () => router.push('/deck/new'),
            testID: 'home-new-deck-action',
          }),
        ]}
      />

      <YStack flex={1} paddingHorizontal="$4" gap="$4">
        {hasDecks && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.searchPlaceholder')}
            testID="home-search-input"
            clearButtonTestID="home-search-clear-button"
          />
        )}

        {content}
      </YStack>
      {AlertDialog}
    </View>
  );
}
