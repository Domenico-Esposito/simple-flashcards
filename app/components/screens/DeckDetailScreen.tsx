import { useEffect, useState, useMemo } from 'react';
import { FlatList, Pressable, ScrollView } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { Flashcard } from '@/types';
import { FlashcardListItem } from '@/components/FlashcardListItem';
import { Header, createHeaderAction } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';

type DeckDetailScreenProps = {
  deckId: number;
};

type FlashcardListContentProps = {
  flashcards: Flashcard[];
  onEdit: (flashcardId: number) => void;
  onDelete: (flashcardId: number) => void;
};

/** Large screen: grid layout for flashcard items */
function FlashcardGrid({ flashcards, onEdit, onDelete }: FlashcardListContentProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <View flexDirection="row" flexWrap="wrap" margin={-6}>
        {flashcards.map((item) => (
          <View key={item.id} width="50%" padding={6}>
            <FlashcardListItem
              flashcard={item}
              onPress={() => onEdit(item.id)}
              onLongPress={() => onDelete(item.id)}
              testID={`deck-detail-flashcard-${item.id}`}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** Mobile: flat list for flashcard items */
function FlashcardMobileList({ flashcards, onEdit, onDelete }: FlashcardListContentProps) {
  return (
    <FlatList
      data={flashcards}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <FlashcardListItem
          flashcard={item}
          onPress={() => onEdit(item.id)}
          onLongPress={() => onDelete(item.id)}
          testID={`deck-detail-flashcard-${item.id}`}
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
      ItemSeparatorComponent={() => <View height={10} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function DeckDetailScreen({ deckId }: DeckDetailScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const isLargeScreen = useIsLargeScreen();

  const { currentDeck, flashcards, loadDeck, removeFlashcard } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter flashcards based on search query
  const filteredFlashcards = useMemo(() => {
    if (!searchQuery.trim()) return flashcards;
    const query = searchQuery.toLowerCase().trim();
    return flashcards.filter((fc) => {
      const q = fc.question.toLowerCase().includes(query);
      if (fc.type === 'multiple_choice') {
        return q || fc.options.some((o) => o.text.toLowerCase().includes(query));
      }
      return q || fc.answer.toLowerCase().includes(query);
    });
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
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$gray10">{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background" testID="deck-detail-screen">
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

      <YStack flex={1} paddingHorizontal="$4" gap="$4">
        {/* Action Buttons */}
        <XStack gap="$3">
          <Pressable
            onPress={() => router.push(`/deck/${deckId}/flashcard/new`)}
            style={{ flex: 1 }}
            testID="deck-detail-add-flashcard-button"
            accessibilityLabel="deck-detail-add-flashcard-button"
          >
            <View
              backgroundColor="$primary"
              borderRadius="$4"
              padding="$4"
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              <MaterialIcons name="add" size={24} color={colors.onAccent} />
              <Text fontSize={14} fontWeight="600" color={colors.onAccent}>
                {t('deck.add')}
              </Text>
            </View>
          </Pressable>
          {flashcards.length > 0 && (
            <Pressable
              onPress={() => router.push(`/deck/${deckId}/study`)}
              style={{ flex: 1 }}
              testID="deck-detail-study-button"
              accessibilityLabel="deck-detail-study-button"
            >
              <View
                backgroundColor="$backgroundStrong"
                borderRadius="$4"
                padding="$4"
                alignItems="center"
                justifyContent="center"
                gap="$2"
              >
                <MaterialIcons name="menu-book" size={24} color={colors.accent} />
                <Text fontSize={14} fontWeight="600" color="$color">
                  {t('deck.study')}
                </Text>
              </View>
            </Pressable>
          )}
          {flashcards.length > 0 && (
            <Pressable
              onPress={() => router.push(`/deck/${deckId}/quiz`)}
              style={{ flex: 1 }}
              testID="deck-detail-quiz-button"
              accessibilityLabel="deck-detail-quiz-button"
            >
              <View
                backgroundColor="$backgroundStrong"
                borderRadius="$4"
                padding="$4"
                alignItems="center"
                justifyContent="center"
                gap="$2"
              >
                <MaterialIcons name="play-arrow" size={24} color={colors.success} />
                <Text fontSize={14} fontWeight="600" color="$color">
                  {t('deck.startQuiz')}
                </Text>
              </View>
            </Pressable>
          )}
        </XStack>

        {/* Search bar */}
        {flashcards.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('deck.searchPlaceholder')}
            testID="deck-detail-search-input"
            clearButtonTestID="deck-detail-search-clear-button"
          />
        )}

        {/* Section title */}
        {flashcards.length > 0 && (
          <Text
            fontSize={18}
            fontWeight="600"
            color="$color"
            marginTop="$2"
            testID="deck-detail-flashcard-count"
          >
            {t('deck.flashcardCount', { count: flashcards.length })}
          </Text>
        )}

        {/* Flashcards list */}
        {flashcards.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Text color="$gray10" fontSize={16} textAlign="center">
              {t('deck.noFlashcards')}
            </Text>
          </YStack>
        ) : filteredFlashcards.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Text color="$gray10" fontSize={16} textAlign="center">
              {t('deck.noSearchResults', { query: searchQuery })}
            </Text>
          </YStack>
        ) : isLargeScreen ? (
          <FlashcardGrid
            flashcards={filteredFlashcards}
            onEdit={handleEditFlashcard}
            onDelete={handleDeleteFlashcard}
          />
        ) : (
          <FlashcardMobileList
            flashcards={filteredFlashcards}
            onEdit={handleEditFlashcard}
            onDelete={handleDeleteFlashcard}
          />
        )}
      </YStack>
      {AlertDialog}
    </View>
  );
}
