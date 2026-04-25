import { Button, XStack } from 'tamagui';

type ToggleOption<T extends string> = {
  value: T;
  label: string;
  testID: string;
  accessibilityLabel: string;
};

type FlashcardSegmentedToggleProps<T extends string> = {
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
};

export function FlashcardSegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: FlashcardSegmentedToggleProps<T>) {
  return (
    <XStack
      flexWrap="wrap"
      gap="$1"
      p="$1"
      bg="$color2"
      alignSelf="center"
      justifyContent="center"
      borderRadius={32}
      maxWidth="100%"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          size="$2"
          onPress={() => onChange(option.value)}
          borderWidth={0}
          px="$4"
          bg={value === option.value ? '$background' : 'transparent'}
          pressStyle={{ opacity: 0.85 }}
          borderRadius={28}
          testID={option.testID}
          accessibilityLabel={option.accessibilityLabel}
        >
          {option.label}
        </Button>
      ))}
    </XStack>
  );
}
