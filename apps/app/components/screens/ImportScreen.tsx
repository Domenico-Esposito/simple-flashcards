import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, YStack } from 'tamagui';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { ImportFormatSection } from '@/components/screens/import/ImportFormatSection';
import { ImportModeToggle } from '@/components/screens/import/ImportModeToggle';
import { useFlashcardsStore } from '@/store/flashcards';
import { importDeckFromUrl, importDeckFromJson } from '@/utils/import-export';
import { useAppAlert } from '@/hooks/useAppAlert';

type ImportMode = 'url' | 'json';

export function ImportScreen() {
  const { t } = useTranslation();
  const { loadDecks } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();

  const [importMode, setImportMode] = useState<ImportMode>('url');
  const [importUrl, setImportUrl] = useState('');
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const formatFieldLabels = [
    t('import.fieldsLabel'),
    t('import.titleField'),
    t('import.descriptionField'),
    t('import.flashcardsField'),
    t('import.questionField'),
    t('import.answerField'),
    t('import.typeField'),
    t('import.optionsField'),
    t('import.optionTextField'),
    t('import.optionCorrectField'),
  ];

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      showAlert(t('common.error'), t('import.invalidUrl'));
      return;
    }

    setIsImporting(true);
    try {
      const deck = await importDeckFromUrl(importUrl.trim());
      await loadDecks();
      showAlert(
        t('import.successTitle'),
        t('import.successMessage', {
          title: deck.title,
          count: deck.flashcards.length,
        }),
        [{ text: 'OK', onPress: () => setImportUrl('') }],
      );
    } catch (error) {
      showAlert(t('common.error'), error instanceof Error ? error.message : t('import.error'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromJson = async () => {
    if (!importJson.trim()) {
      showAlert(t('common.error'), t('import.missingJson'));
      return;
    }

    setIsImporting(true);
    try {
      const data = JSON.parse(importJson.trim());
      const deck = await importDeckFromJson(data);
      await loadDecks();
      showAlert(
        t('import.successTitle'),
        t('import.successMessage', {
          title: deck.title,
          count: deck.flashcards.length,
        }),
        [{ text: 'OK', onPress: () => setImportJson('') }],
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        showAlert(t('common.error'), t('import.invalidJson'));
      } else {
        showAlert(t('common.error'), error instanceof Error ? error.message : t('import.error'));
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View flex={1} backgroundColor="$background" testID="import-screen">
      <Header title={t('import.title')} showBackButton />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" gap="$6">
          <YStack gap="$3">
            <ImportModeToggle
              importMode={importMode}
              urlLabel={t('import.fromUrl')}
              jsonLabel={t('import.fromJson')}
              onChange={setImportMode}
            />

            {importMode === 'url' ? (
              <>
                <Text fontSize={14} color="$secondary">
                  {t('import.urlDescription')}
                </Text>
                <YStack gap="$1">
                  <Label htmlFor="importUrl">{t('import.urlLabel')}</Label>
                  <Input
                    id="importUrl"
                    testID="import-url-input"
                    accessibilityLabel="import-url-input"
                    size="$4"
                    value={importUrl}
                    onChangeText={setImportUrl}
                    placeholder={t('import.urlPlaceholder')}
                  />
                </YStack>
                <Button
                  size="$4"
                  onPress={handleImportFromUrl}
                  disabled={isImporting}
                  themeInverse
                  testID="import-from-url-button"
                  accessibilityLabel="import-from-url-button"
                >
                  {isImporting ? t('common.importing') : t('import.fromUrlButton')}
                </Button>
              </>
            ) : (
              <>
                <Text fontSize={14} color="$secondary">
                  {t('import.jsonDescription')}
                </Text>
                <YStack gap="$1">
                  <Label htmlFor="importJson">{t('import.jsonLabel')}</Label>
                  <TextArea
                    id="importJson"
                    testID="import-json-input"
                    accessibilityLabel="import-json-input"
                    size="$4"
                    value={importJson}
                    onChangeText={setImportJson}
                    placeholder={t('import.jsonPlaceholder')}
                    numberOfLines={8}
                    minHeight={160}
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    importantForAutofill="no"
                    keyboardType="visible-password" // prevents auto-capitalization and auto-correction
                  />
                </YStack>
                <Button
                  size="$4"
                  onPress={handleImportFromJson}
                  disabled={isImporting}
                  themeInverse
                  testID="import-from-json-button"
                  accessibilityLabel="import-from-json-button"
                >
                  {isImporting ? t('common.importing') : t('import.fromJsonButton')}
                </Button>
              </>
            )}
          </YStack>

          <ImportFormatSection
            isVisible={showFormat}
            toggleLabel={showFormat ? t('import.hideFormat') : t('import.showFormat')}
            title={t('import.formatTitle')}
            example={t('import.formatExample')}
            fieldLabels={formatFieldLabels}
            onToggle={() => setShowFormat((current) => !current)}
          />
        </YStack>
      </ScrollView>
      {AlertDialog}
    </View>
  );
}
