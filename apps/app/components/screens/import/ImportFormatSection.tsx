import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, Text, View, XStack, YStack, useTheme } from 'tamagui';

type CopySection = 'format' | 'ai';

type ImportFormatSectionProps = {
  formatTitle: string;
  formatDescription: string;
  formatExpandLabel: string;
  formatCollapseLabel: string;
  formatExampleLabel: string;
  formatExample: string;
  fieldLabels: string[];
  aiTitle: string;
  aiDescription: string;
  aiExpandLabel: string;
  aiCollapseLabel: string;
  aiExampleLabel: string;
  aiPrompt: string;
  markdownSupportTitle: string;
  markdownSupportDescription: string;
  markdownSupportItems: string[];
  copyLabel: string;
  copiedLabel: string;
  copiedSection: CopySection | null;
  isFormatExpanded: boolean;
  isAiExpanded: boolean;
  onCopyFormat: () => void;
  onCopyAi: () => void;
  onToggleFormat: () => void;
  onToggleAi: () => void;
};

export function ImportFormatSection({
  formatTitle,
  formatDescription,
  formatExpandLabel,
  formatCollapseLabel,
  formatExampleLabel,
  formatExample,
  fieldLabels,
  aiTitle,
  aiDescription,
  aiExpandLabel,
  aiCollapseLabel,
  aiExampleLabel,
  aiPrompt,
  markdownSupportTitle,
  markdownSupportDescription,
  markdownSupportItems,
  copyLabel,
  copiedLabel,
  copiedSection,
  isFormatExpanded,
  isAiExpanded,
  onCopyFormat,
  onCopyAi,
  onToggleFormat,
  onToggleAi,
}: ImportFormatSectionProps) {
  const theme = useTheme();
  const iconColor = String(theme.color.val);

  return (
    <YStack gap="$6">
      <YStack gap="$3" testID="import-format-panel">
        <XStack justifyContent="space-between" alignItems="center" gap="$3">
          <YStack gap="$1" flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              {formatTitle}
            </Text>
            <Text fontSize={14} color="$secondary">
              {formatDescription}
            </Text>
          </YStack>
          <Button size="$3" onPress={onToggleFormat} chromeless iconAfter={
            <MaterialIcons
              name={isFormatExpanded ? 'expand-less' : 'expand-more'}
              size={18}
              color={iconColor}
            />
          }>
            {isFormatExpanded ? formatCollapseLabel : formatExpandLabel}
          </Button>
        </XStack>
        {isFormatExpanded ? (
          <View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$3">
            <XStack justifyContent="space-between" alignItems="center" gap="$3">
              <Text fontSize={12} fontWeight="600" color="$secondary" flex={1}>
                {formatExampleLabel}
              </Text>
              <Button size="$3" onPress={onCopyFormat} chromeless>
                {copiedSection === 'format' ? copiedLabel : copyLabel}
              </Button>
            </XStack>
            <View backgroundColor="$background" padding="$3" borderRadius="$3">
              <Text fontFamily="$mono" fontSize={12} color="$color">
                {formatExample}
              </Text>
            </View>
            <YStack gap="$2" paddingTop="$1">
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
        ) : null}
      </YStack>

      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center" gap="$3">
          <YStack gap="$1" flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              {aiTitle}
            </Text>
            <Text fontSize={14} color="$secondary">
              {aiDescription}
            </Text>
          </YStack>
          <Button size="$3" onPress={onToggleAi} chromeless iconAfter={
            <MaterialIcons
              name={isAiExpanded ? 'expand-less' : 'expand-more'}
              size={18}
              color={iconColor}
            />
          }>
            {isAiExpanded ? aiCollapseLabel : aiExpandLabel}
          </Button>
        </XStack>
        {isAiExpanded ? (
          <View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$4">
            <XStack justifyContent="space-between" alignItems="center" gap="$3">
              <Text fontSize={12} fontWeight="600" color="$secondary" flex={1}>
                {aiExampleLabel}
              </Text>
              <Button size="$3" onPress={onCopyAi} chromeless>
                {copiedSection === 'ai' ? copiedLabel : copyLabel}
              </Button>
            </XStack>
            <View backgroundColor="$background" padding="$3" borderRadius="$3">
              <Text fontFamily="$mono" fontSize={12} color="$color">
                {aiPrompt}
              </Text>
            </View>
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="$color">
                {markdownSupportTitle}
              </Text>
              <Text fontSize={14} color="$secondary">
                {markdownSupportDescription}
              </Text>
              <YStack gap="$2">
                {markdownSupportItems.map((item) => (
                  <Text key={item} fontSize={13} color="$secondary">
                    {item}
                  </Text>
                ))}
              </YStack>
            </YStack>
          </View>
        ) : null}
      </YStack>
    </YStack>
  );
}
