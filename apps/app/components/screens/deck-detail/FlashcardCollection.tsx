import { FlatList, ScrollView } from 'react-native';
import { View } from 'tamagui';

import { FlashcardListItem } from '@/components/flashcards/FlashcardListItem';
import type { Flashcard } from '@/types';

const LIST_BOTTOM_PADDING = 20;

type FlashcardCollectionProps = {
  flashcards: Flashcard[];
  isLargeScreen: boolean;
  onEdit: (flashcardId: number) => void;
  onDelete: (flashcardId: number) => void;
};

export function FlashcardCollection({
  flashcards,
  isLargeScreen,
  onEdit,
  onDelete,
}: FlashcardCollectionProps) {
  if (isLargeScreen) {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <View testID="deck-detail-flashcard-grid" flexDirection="row" flexWrap="wrap" margin={-6}>
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
