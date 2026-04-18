import { Button, YStack } from 'tamagui';

type DeckFormActionsProps = {
  isEditing: boolean;
  saveLabel: string;
  deleteLabel: string;
  cancelLabel: string;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

export function DeckFormActions({
  isEditing,
  saveLabel,
  deleteLabel,
  cancelLabel,
  onSave,
  onDelete,
  onCancel,
}: DeckFormActionsProps) {
  return (
    <YStack gap="$3">
      <Button
        size="$4"
        onPress={onSave}
        themeInverse
        testID="deck-form-save-button"
        accessibilityLabel="deck-form-save-button"
      >
        {saveLabel}
      </Button>
      {isEditing && (
        <Button
          size="$4"
          onPress={onDelete}
          theme="red"
          testID="deck-form-delete-button"
          accessibilityLabel="deck-form-delete-button"
        >
          {deleteLabel}
        </Button>
      )}
      <Button
        size="$4"
        onPress={onCancel}
        chromeless
        testID="deck-form-cancel-button"
        accessibilityLabel="deck-form-cancel-button"
      >
        {cancelLabel}
      </Button>
    </YStack>
  );
}
