import { Pressable } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';
import { Flashcard } from '@/types';
import { stripMarkdown } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FlashcardListItemProps {
  flashcard: Flashcard;
  onPress: () => void;
  onLongPress?: () => void;
  testID?: string;
}

/**
 * List item displaying a flashcard preview
 */
export function FlashcardListItem({
  flashcard,
  onPress,
  onLongPress,
  testID,
}: FlashcardListItemProps) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const questionPreview = stripMarkdown(flashcard.question);
  const answerPreview =
    flashcard.type === 'multiple_choice'
      ? flashcard.options.map((o) => o.text).join(' · ')
      : stripMarkdown(flashcard.answer);
  const flashcardItemTestID = testID ?? 'flashcard-list-item';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      testID={flashcardItemTestID}
      accessibilityLabel={flashcardItemTestID}
    >
      {({ pressed }) => (
        <View
          bg={pressed ? '$backgroundPress' : '$backgroundStrong'}
          p="$4"
          borderRadius={16}
        >
          <XStack gap="$3" alignItems="center">
            <YStack flex={1} gap="$2">
              <Text
                fontSize={15}
                lineHeight={20}
                fontWeight="600"
                numberOfLines={2}
                height={40}
                color="$color"
                testID={`${flashcardItemTestID}-question`}
              >
                {questionPreview}
              </Text>
              <Text
                fontSize={13}
                lineHeight={18}
                color="$secondary"
                numberOfLines={2}
                height={36}
                testID={`${flashcardItemTestID}-answer`}
              >
                {answerPreview}
              </Text>
            </YStack>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </XStack>
        </View>
      )}
    </Pressable>
  );
}
