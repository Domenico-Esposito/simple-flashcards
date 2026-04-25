import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  useCurrentDeckState,
  useDeckActions,
  useFlashcardActions,
  useFlashcardsState,
} from '@/store/flashcards.selectors';
import { Header, createHeaderAction } from '@/components/layout/header';
import { SearchBar } from '@/components/search/SearchBar';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/colors';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { CenteredEmptyState } from '@/components/screens/common/CenteredEmptyState';
import { ActionTile } from '@/components/screens/deck-detail/ActionTile';
import { FlashcardCollection } from '@/components/screens/deck-detail/FlashcardCollection';
import { flashcardMatchesQuery } from '@/components/screens/deck-detail/flashcardMatchesQuery';

type DeckDetailScreenProps = {
  deckId: number;
};

export function DeckDetailScreen({ deckId }: DeckDetailScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const isLargeScreen = useIsLargeScreen();

  const currentDeck = useCurrentDeckState();
  const flashcards = useFlashcardsState();
  const { loadDeck } = useDeckActions();
  const { removeFlashcard } = useFlashcardActions();
  const { showAlert, AlertDialog } = useAppAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlashcards = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    if (!normalizedQuery) {
      return flashcards;
    }

    return flashcards.filter((flashcard) => flashcardMatchesQuery(flashcard, normalizedQuery));
  }, [flashcards, searchQuery]);

  useEffect(() => {
    loadDeck(deckId);
  }, [deckId, loadDeck]);

  const handleEditFlashcard = (flashcardId: number) => {
    router.push(`/deck/${deckId}/flashcard/${flashcardId}/edit`);
  };

  const handleDeleteFlashcard = (flashcardId: number) => {
    showAlert(t('flashcard.delete.title'), t('flashcard.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeFlashcard(flashcardId),
      },
    ]);
  };

  if (!currentDeck) {
    return (
      <View flex={1} bg="$background" justifyContent="center" alignItems="center">
        <Text color="$secondary">{t('common.loading')}</Text>
      </View>
    );
  }

  const hasFlashcards = flashcards.length > 0;
  const normalizedSearchQuery = searchQuery.trim();

  let content: ReactNode;

  if (!hasFlashcards) {
    content = <CenteredEmptyState message={t('deck.noFlashcards')} />;
  } else if (filteredFlashcards.length === 0) {
    content = (
      <CenteredEmptyState message={t('deck.noSearchResults', { query: normalizedSearchQuery })} />
    );
  } else {
    content = (
      <FlashcardCollection
        flashcards={filteredFlashcards}
        isLargeScreen={isLargeScreen}
        onEdit={handleEditFlashcard}
        onDelete={handleDeleteFlashcard}
      />
    );
  }

  return (
    <View flex={1} bg="$background" testID="deck-detail-screen">
      <Header
        title={currentDeck.title}
        subtitle={currentDeck.description}
        actions={[
          createHeaderAction({
            icon: 'bar-chart',
            label: t('deck.statistics'),
            onPress: () => router.push(`/deck/${deckId}/statistics`),
            testID: 'deck-detail-stats-action',
          }),
          createHeaderAction({
            icon: 'edit',
            label: t('deck.edit'),
            onPress: () => router.push(`/deck/${deckId}/edit`),
            testID: 'deck-detail-edit-action',
          }),
        ]}
      />

      <YStack flex={1} px="$4" gap="$4">
        <XStack gap="$3">
          <ActionTile
            icon="add"
            label={t('deck.add')}
            iconColor={colors.onAccent}
            textColor={colors.onAccent}
            backgroundColor="$primary"
            onPress={() => router.push(`/deck/${deckId}/flashcard/new`)}
            testID="deck-detail-add-flashcard-button"
          />
          {hasFlashcards && (
            <ActionTile
              icon="menu-book"
              label={t('deck.study')}
              iconColor={colors.accent}
              textColor="$color"
              backgroundColor="$backgroundStrong"
              onPress={() => router.push(`/deck/${deckId}/study`)}
              testID="deck-detail-study-button"
            />
          )}
          {hasFlashcards && (
            <ActionTile
              icon="play-arrow"
              label={t('deck.startQuiz')}
              iconColor={colors.success}
              textColor="$color"
              backgroundColor="$backgroundStrong"
              onPress={() => router.push(`/deck/${deckId}/quiz`)}
              testID="deck-detail-quiz-button"
            />
          )}
        </XStack>

        {hasFlashcards && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('deck.searchPlaceholder')}
            testID="deck-detail-search-input"
            clearButtonTestID="deck-detail-search-clear-button"
          />
        )}

        {hasFlashcards && (
          <Text
            fontSize={18}
            fontWeight="600"
            color="$color"
            mt="$2"
            testID="deck-detail-flashcard-count"
          >
            {t('deck.flashcardCount', { count: flashcards.length })}
          </Text>
        )}

        {content}
      </YStack>
      {AlertDialog}
    </View>
  );
}
