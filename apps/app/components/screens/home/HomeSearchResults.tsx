import { ScrollView, SectionList } from 'react-native';
import { Text, View } from 'tamagui';

import { FlashcardListItem } from '@/components/flashcards/FlashcardListItem';
import type { SearchResultSection } from '@/components/screens/home/types';

const LIST_BOTTOM_PADDING = 20;

type HomeSearchResultsProps = {
  sections: SearchResultSection[];
  isLargeScreen: boolean;
  onFlashcardPress: (flashcardId: number) => void;
};

function SearchSectionHeader({ title }: { title: string }) {
  return (
    <View bg="$background" py="$2" mt="$3">
      <Text
        fontSize={13}
        fontWeight="600"
        color="$secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {title}
      </Text>
    </View>
  );
}

export function HomeSearchResults({
  sections,
  isLargeScreen,
  onFlashcardPress,
}: HomeSearchResultsProps) {
  if (isLargeScreen) {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.deckId}>
            <SearchSectionHeader title={section.deckTitle} />
            <View
              testID={`home-search-results-grid-${section.deckId}`}
              flexDirection="row"
              flexWrap="wrap"
              margin={-6}
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
