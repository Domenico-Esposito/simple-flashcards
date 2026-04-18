import { Button, YStack } from 'tamagui';

type FlashcardFormActionsProps = {
  showSave: boolean;
  saveLabel: string;
  onSave: () => void;
};

export function FlashcardFormActions({ showSave, saveLabel, onSave }: FlashcardFormActionsProps) {
  if (!showSave) {
    return null;
  }

  return (
    <YStack gap="$3">
      <Button
        size="$4"
        onPress={onSave}
        themeInverse
        testID="flashcard-form-save-button"
        accessibilityLabel="flashcard-form-save-button"
      >
        {saveLabel}
      </Button>
    </YStack>
  );
}
