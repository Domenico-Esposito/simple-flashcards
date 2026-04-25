import { FlatList, ScrollView } from 'react-native';
import { View } from 'tamagui';

import { DeckCard } from '@/components/decks/DeckCard';
import type { DeckCollectionProps } from '@/components/screens/home/types';

const LIST_BOTTOM_PADDING = 20;

export function HomeDeckCollection({
  decks,
  deckCounts,
  isLargeScreen,
  onPress,
  onLongPress,
}: DeckCollectionProps) {
  if (isLargeScreen) {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <View testID="home-deck-grid" flexDirection="row" flexWrap="wrap" margin={-6}>
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
