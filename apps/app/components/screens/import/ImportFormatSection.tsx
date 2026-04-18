import { Button, Text, View, YStack } from 'tamagui';

type ImportFormatSectionProps = {
  isVisible: boolean;
  toggleLabel: string;
  title: string;
  example: string;
  fieldLabels: string[];
  onToggle: () => void;
};

export function ImportFormatSection({
  isVisible,
  toggleLabel,
  title,
  example,
  fieldLabels,
  onToggle,
}: ImportFormatSectionProps) {
  return (
    <YStack gap="$3">
      <Button
        size="$4"
        onPress={onToggle}
        chromeless
        testID="import-toggle-format-button"
        accessibilityLabel="import-toggle-format-button"
      >
        {toggleLabel}
      </Button>
      {isVisible && (
        <View
          backgroundColor="$backgroundStrong"
          padding="$4"
          borderRadius="$3"
          gap="$3"
          testID="import-format-panel"
        >
          <Text fontSize={16} fontWeight="600" color="$color">
            {title}
          </Text>
          <View backgroundColor="$background" padding="$3" borderRadius="$2">
            <Text fontFamily="$mono" fontSize={12} color="$color">
              {example}
            </Text>
          </View>
          <YStack gap="$2">
            {fieldLabels.map((fieldLabel, index) => (
              <Text
                key={`${fieldLabel}-${index}`}
                fontSize={13}
                color="$secondary"
                marginLeft={index >= 7 ? '$6' : index >= 3 ? '$3' : undefined}
                fontWeight={index === 0 ? '600' : undefined}
              >
                {fieldLabel}
              </Text>
            ))}
          </YStack>
        </View>
      )}
    </YStack>
  );
}
