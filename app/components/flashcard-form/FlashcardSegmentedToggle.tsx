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
      alignSelf="center"
      justifyContent="center"
      flexWrap="wrap"
      gap="$1"
      padding="$1"
      borderRadius="$8"
      backgroundColor="$color2"
      maxWidth="100%"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          size="$2"
          onPress={() => onChange(option.value)}
          borderWidth={0}
          borderRadius="$7"
          paddingHorizontal="$4"
          backgroundColor={value === option.value ? '$background' : 'transparent'}
          pressStyle={{ backgroundColor: '$background' }}
          testID={option.testID}
          accessibilityLabel={option.accessibilityLabel}
        >
          {option.label}
        </Button>
      ))}
    </XStack>
  );
}
