import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { View, YStack } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header, createHeaderAction } from '@/components/layout/header';
import { SearchBar } from '@/components/search/SearchBar';
import { getFlashcardCount } from '@/utils/database';
import { Deck } from '@/types';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { CenteredEmptyState } from '@/components/screens/common/CenteredEmptyState';
import { HomeDeckCollection } from '@/components/screens/home/HomeDeckCollection';
import { HomeSearchResults } from '@/components/screens/home/HomeSearchResults';
import { useHomeSearch } from '@/components/screens/home/useHomeSearch';

export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { decks, loadDecks, removeDeck } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();
  const [deckCounts, setDeckCounts] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const isLargeScreen = useIsLargeScreen();
  const { filteredDecks, searchState, trimmedSearchQuery } = useHomeSearch(decks, searchQuery);

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
    content = <CenteredEmptyState message={t('home.noDecks')} testID="home-empty-state" />;
  } else if (filteredDecks.length === 0) {
    content = (
      <CenteredEmptyState
        message={t('home.noSearchResults', { query: trimmedSearchQuery })}
        testID="home-search-empty-state"
      />
    );
  } else if (hasSearchResults) {
    content = (
      <HomeSearchResults
        sections={searchState.sections}
        isLargeScreen={isLargeScreen}
        onFlashcardPress={handleFlashcardPress}
      />
    );
  } else {
    content = (
      <HomeDeckCollection
        decks={filteredDecks}
        deckCounts={deckCounts}
        isLargeScreen={isLargeScreen}
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
