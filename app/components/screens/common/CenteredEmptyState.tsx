import { Text, YStack } from 'tamagui';

type CenteredEmptyStateProps = {
  message: string;
  testID?: string;
};

export function CenteredEmptyState({ message, testID }: CenteredEmptyStateProps) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <Text color="$gray10" fontSize={16} textAlign="center" testID={testID}>
        {message}
      </Text>
    </YStack>
  );
}
