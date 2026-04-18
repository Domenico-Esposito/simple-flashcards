import { TextInput as RNTextInput } from 'react-native';
import { Text, TextArea, YStack, useTheme } from 'tamagui';

import {
  DESCRIPTION_MIN_HEIGHT,
  TITLE_LINE_HEIGHT,
} from '@/components/screens/deck-form/constants';

type DeckFormFieldsProps = {
  title: string;
  titleError: string;
  description: string;
  descriptionMaxHeight?: number;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  onTitleChangeText: (value: string) => void;
  onDescriptionChangeText: (value: string) => void;
};

export function DeckFormFields({
  title,
  titleError,
  description,
  descriptionMaxHeight,
  titlePlaceholder,
  descriptionPlaceholder,
  onTitleChangeText,
  onDescriptionChangeText,
}: DeckFormFieldsProps) {
  const theme = useTheme();

  return (
    <>
      <YStack gap="$2">
        <RNTextInput
          testID="deck-form-title-input"
          accessibilityLabel="deck-form-title-input"
          value={title}
          onChangeText={onTitleChangeText}
          placeholder={titlePlaceholder}
          multiline
          scrollEnabled={false}
          style={{
            fontSize: 24,
            lineHeight: TITLE_LINE_HEIGHT,
            fontWeight: '700',
            padding: 0,
            color: theme.color.val,
          }}
          placeholderTextColor={theme.color9.val}
        />
        {titleError && (
          <Text fontSize={12} color="$red10">
            {titleError}
          </Text>
        )}
      </YStack>

      <YStack gap="$1" flex={1}>
        <TextArea
          id="description"
          testID="deck-form-description-input"
          accessibilityLabel="deck-form-description-input"
          size="$4"
          flex={1}
          minHeight={DESCRIPTION_MIN_HEIGHT}
          maxHeight={descriptionMaxHeight}
          value={description}
          onChangeText={onDescriptionChangeText}
          placeholder={descriptionPlaceholder}
          borderWidth={0}
          backgroundColor="transparent"
          paddingHorizontal={0}
          paddingVertical={0}
          fontSize={16}
          color="$color"
          placeholderTextColor="$color9"
        />
      </YStack>
    </>
  );
}
