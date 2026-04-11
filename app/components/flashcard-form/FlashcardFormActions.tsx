import { Button, YStack } from 'tamagui';

type FlashcardFormActionsProps = {
  canDelete: boolean;
  saveLabel: string;
  deleteLabel: string;
  cancelLabel: string;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

export function FlashcardFormActions({
  canDelete,
  saveLabel,
  deleteLabel,
  cancelLabel,
  onSave,
  onDelete,
  onCancel,
}: FlashcardFormActionsProps) {
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
      {canDelete && (
        <Button
          size="$4"
          onPress={onDelete}
          theme="red"
          testID="flashcard-form-delete-button"
          accessibilityLabel="flashcard-form-delete-button"
        >
          {deleteLabel}
        </Button>
      )}
      <Button
        size="$4"
        onPress={onCancel}
        chromeless
        testID="flashcard-form-cancel-button"
        accessibilityLabel="flashcard-form-cancel-button"
      >
        {cancelLabel}
      </Button>
    </YStack>
  );
}
