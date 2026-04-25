import { Text, YStack } from 'tamagui';

type CenteredEmptyStateProps = {
  message: string;
  testID?: string;
};

export function CenteredEmptyState({ message, testID }: CenteredEmptyStateProps) {
  return (
    <YStack flex={1} gap="$4" justifyContent="center" alignItems="center">
      <Text color="$secondary" fontSize={16} textAlign="center" testID={testID}>
        {message}
      </Text>
    </YStack>
  );
}
