import { Button, XStack } from 'tamagui';

type ImportMode = 'url' | 'json';

type ImportModeToggleProps = {
  importMode: ImportMode;
  urlLabel: string;
  jsonLabel: string;
  onChange: (mode: ImportMode) => void;
};

export function ImportModeToggle({
  importMode,
  urlLabel,
  jsonLabel,
  onChange,
}: ImportModeToggleProps) {
  return (
    <XStack gap="$2">
      <Button
        size="$3"
        flex={1}
        onPress={() => onChange('url')}
        themeInverse={importMode === 'url'}
        chromeless={importMode !== 'url'}
        testID="import-mode-url-button"
        accessibilityLabel="import-mode-url-button"
      >
        {urlLabel}
      </Button>
      <Button
        size="$3"
        flex={1}
        onPress={() => onChange('json')}
        themeInverse={importMode === 'json'}
        chromeless={importMode !== 'json'}
        testID="import-mode-json-button"
        accessibilityLabel="import-mode-json-button"
      >
        {jsonLabel}
      </Button>
    </XStack>
  );
}
