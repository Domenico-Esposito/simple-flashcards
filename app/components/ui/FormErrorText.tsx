import { Text } from 'tamagui';

type FormErrorTextProps = {
  message?: string | null;
  testID?: string;
  accessibilityLabel?: string;
};

export function FormErrorText({ message, testID, accessibilityLabel }: FormErrorTextProps) {
  if (!message) {
    return null;
  }

  return (
    <Text fontSize={12} color="$red10" testID={testID} accessibilityLabel={accessibilityLabel}>
      {message}
    </Text>
  );
}
