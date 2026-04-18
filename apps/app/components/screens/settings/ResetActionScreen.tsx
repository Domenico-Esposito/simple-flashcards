import { Button, Text, View, YStack } from 'tamagui';

import { Header } from '@/components/layout/header';
import { useAppAlert } from '@/hooks/useAppAlert';

type ResetActionScreenProps = {
  title: string;
  descriptions: string[];
  confirmMessage: string;
  successMessage: string;
  buttonLabel: string;
  testID: string;
  buttonTestID: string;
  confirmLabel: string;
  cancelLabel: string;
  completedTitle: string;
  onConfirm: () => Promise<void>;
};

export function ResetActionScreen({
  title,
  descriptions,
  confirmMessage,
  successMessage,
  buttonLabel,
  testID,
  buttonTestID,
  confirmLabel,
  cancelLabel,
  completedTitle,
  onConfirm,
}: ResetActionScreenProps) {
  const { showAlert, AlertDialog } = useAppAlert();

  const handleReset = () => {
    showAlert(title, confirmMessage, [
      { text: cancelLabel, style: 'cancel' },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: async () => {
          await onConfirm();
          showAlert(completedTitle, successMessage);
        },
      },
    ]);
  };

  return (
    <View flex={1} backgroundColor="$background" testID={testID}>
      <Header title={title} showBackButton />

      <YStack padding="$4" gap="$4">
        {descriptions.map((description) => (
          <Text key={description} fontSize={14} color="$secondary">
            {description}
          </Text>
        ))}

        <Button
          size="$4"
          theme="red"
          onPress={handleReset}
          marginTop="$4"
          testID={buttonTestID}
          accessibilityLabel={buttonTestID}
        >
          {buttonLabel}
        </Button>
      </YStack>
      {AlertDialog}
    </View>
  );
}
