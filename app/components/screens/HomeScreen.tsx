import { useEffect, useState, useCallback } from 'react';
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

type DeckListContentProps = {
  decks: Deck[];
  deckCounts: Record<number, number>;
  onPress: (deckId: number) => void;
  onLongPress: (deck: Deck) => void;
};

/** Large screen: grid layout for deck cards */
function DeckGrid({ decks, deckCounts, onPress, onLongPress }: DeckListContentProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
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

/** Mobile: flat list for deck cards */
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
      contentContainerStyle={{ paddingBottom: 20 }}
      ItemSeparatorComponent={() => <View height={12} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

type SearchResultsContentProps = {
  sections: SearchResultSection[];
  onFlashcardPress: (flashcardId: number) => void;
};

/** Large screen: grid layout for search results */
function SearchResultsGrid({ sections, onFlashcardPress }: SearchResultsContentProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      {sections.map((section) => (
        <View key={section.deckId}>
          <View backgroundColor="$background" paddingVertical="$2" marginTop="$3">
            <Text
              fontSize={13}
              fontWeight="600"
              color="$gray10"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {section.deckTitle}
            </Text>
          </View>
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

/** Mobile: section list for search results */
function SearchResultsMobileList({ sections, onFlashcardPress }: SearchResultsContentProps) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section }) => (
        <View backgroundColor="$background" paddingVertical="$2" marginTop="$3">
          <Text
            fontSize={13}
            fontWeight="600"
            color="$gray10"
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            {section.deckTitle}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <FlashcardListItem
          flashcard={item}
          onPress={() => onFlashcardPress(item.id)}
          testID={`home-search-flashcard-${item.id}`}
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
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
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const isLargeScreen = useIsLargeScreen();
  const [searchResults, setSearchResults] = useState<SearchResultSection[]>([]);

  // Perform search using FTS5
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredDecks(decks);
        setSearchResults([]);
        return;
      }

      const { matchingDeckIds, flashcardsByDeck } = await search(searchQuery.trim());

      setFilteredDecks(decks.filter((deck) => matchingDeckIds.includes(deck.id)));

      // Build sections for flashcard results
      const sections: SearchResultSection[] = [];
      for (const deck of decks) {
        if (flashcardsByDeck[deck.id]?.length > 0) {
          sections.push({
            deckId: deck.id,
            deckTitle: deck.title,
            data: flashcardsByDeck[deck.id],
          });
        }
      }
      setSearchResults(sections);
    };

    performSearch();
  }, [decks, searchQuery]);

  const loadCounts = useCallback(async () => {
    const counts: Record<number, number> = {};
    for (const deck of decks) {
      counts[deck.id] = await getFlashcardCount(deck.id);
    }
    setDeckCounts(counts);
  }, [decks]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Reload counts every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCounts();
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
        {/* Search bar */}
        {decks.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.searchPlaceholder')}
            testID="home-search-input"
            clearButtonTestID="home-search-clear-button"
          />
        )}

        {decks.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Text color="$gray10" fontSize={16} textAlign="center" testID="home-empty-state">
              {t('home.noDecks')}
            </Text>
          </YStack>
        ) : filteredDecks.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Text color="$gray10" fontSize={16} textAlign="center" testID="home-search-empty-state">
              {t('home.noSearchResults', { query: searchQuery })}
            </Text>
          </YStack>
        ) : searchQuery.trim() && searchResults.length > 0 ? (
          isLargeScreen ? (
            <SearchResultsGrid sections={searchResults} onFlashcardPress={handleFlashcardPress} />
          ) : (
            <SearchResultsMobileList
              sections={searchResults}
              onFlashcardPress={handleFlashcardPress}
            />
          )
        ) : isLargeScreen ? (
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
        )}
      </YStack>
      {AlertDialog}
    </View>
  );
}
