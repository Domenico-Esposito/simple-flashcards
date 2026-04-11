import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
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

const LIST_BOTTOM_PADDING = 20;

function EmptyState({ message }: { message: string }) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <Text color="$gray10" fontSize={16} textAlign="center">
        {message}
      </Text>
    </YStack>
  );
}

type ActionTileProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  iconColor: string;
  textColor: string;
  backgroundColor: string;
  onPress: () => void;
  testID: string;
};

function ActionTile({
  icon,
  label,
  iconColor,
  textColor,
  backgroundColor,
  onPress,
  testID,
}: ActionTileProps) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }} testID={testID} accessibilityLabel={testID}>
      <View
        backgroundColor={backgroundColor}
        borderRadius="$4"
        padding="$4"
        alignItems="center"
        justifyContent="center"
        gap="$2"
      >
        <MaterialIcons name={icon} size={24} color={iconColor} />
        <Text fontSize={14} fontWeight="600" color={textColor}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function flashcardMatchesQuery(flashcard: Flashcard, query: string) {
  if (flashcard.question.toLowerCase().includes(query)) {
    return true;
  }

  if (flashcard.type === 'multiple_choice') {
    return flashcard.options.some((option) => option.text.toLowerCase().includes(query));
  }

  return flashcard.answer.toLowerCase().includes(query);
}

function FlashcardGrid({ flashcards, onEdit, onDelete }: FlashcardListContentProps) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
      showsVerticalScrollIndicator={false}
    >
      <View flexDirection="row" flexWrap="wrap" margin={-6} testID="deck-detail-flashcard-grid">
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
      contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
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
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$gray10">{t('common.loading')}</Text>
      </View>
    );
  }

  const hasFlashcards = flashcards.length > 0;
  const normalizedSearchQuery = searchQuery.trim();

  let content: ReactNode;

  if (!hasFlashcards) {
    content = <EmptyState message={t('deck.noFlashcards')} />;
  } else if (filteredFlashcards.length === 0) {
    content = <EmptyState message={t('deck.noSearchResults', { query: normalizedSearchQuery })} />;
  } else {
    content = isLargeScreen ? (
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
            marginTop="$2"
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
