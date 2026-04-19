import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Label, Text, TextArea, View, YStack } from 'tamagui';
import * as Clipboard from 'expo-clipboard';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { ImportFormatSection } from '@/components/screens/import/ImportFormatSection';
import { useFlashcardsStore } from '@/store/flashcards';
import { importDeckFromJson } from '@/utils/import-export';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ImportScreen() {
  const { t } = useTranslation();
  const { loadDecks } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();

  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [copiedSection, setCopiedSection] = useState<'format' | 'ai' | null>(null);
  const [isFormatExpanded, setIsFormatExpanded] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const markdownSupportItems = [
    t('import.markdownHeadingItem'),
    t('import.markdownBoldItem'),
    t('import.markdownItalicItem'),
    t('import.markdownStrikeItem'),
    t('import.markdownUnorderedListItem'),
    t('import.markdownOrderedListItem'),
    t('import.markdownQuoteItem'),
    t('import.markdownInlineCodeItem'),
    t('import.markdownCodeBlockItem'),
    t('import.markdownLinkItem'),
    t('import.markdownImageItem'),
    t('import.markdownRuleItem'),
  ];

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (section: 'format' | 'ai', content: string) => {
    try {
      await Clipboard.setStringAsync(content);
      setCopiedSection(section);

      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = setTimeout(() => {
        setCopiedSection(null);
      }, 2000);
    } catch {
      showAlert(t('common.error'), t('import.copyError'));
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
            <YStack gap="$1">
              <Text fontSize={18} fontWeight="600" color="$color">
                {t('import.jsonInputTitle')}
              </Text>
              <Text fontSize={14} color="$secondary">
                {t('import.jsonDescription')}
              </Text>
            </YStack>

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
          </YStack>

          <ImportFormatSection
            formatTitle={t('import.formatTitle')}
            formatDescription={t('import.formatDescription')}
            formatExpandLabel={t('import.showDetails')}
            formatCollapseLabel={t('import.hideDetails')}
            formatExampleLabel={t('import.formatExampleLabel')}
            formatExample={t('import.formatExample')}
            fieldLabels={formatFieldLabels}
            aiTitle={t('import.aiTitle')}
            aiDescription={t('import.aiDescription')}
            aiExpandLabel={t('import.showDetails')}
            aiCollapseLabel={t('import.hideDetails')}
            aiExampleLabel={t('import.aiExampleLabel')}
            aiPrompt={t('import.aiPromptExample')}
            markdownSupportTitle={t('import.markdownSupportTitle')}
            markdownSupportDescription={t('import.markdownSupportDescription')}
            markdownSupportItems={markdownSupportItems}
            copyLabel={t('import.copyButton')}
            copiedLabel={t('import.copiedButton')}
            copiedSection={copiedSection}
            isFormatExpanded={isFormatExpanded}
            isAiExpanded={isAiExpanded}
            onCopyFormat={() => handleCopy('format', t('import.formatExample'))}
            onCopyAi={() => handleCopy('ai', t('import.aiPromptExample'))}
            onToggleFormat={() => setIsFormatExpanded((current) => !current)}
            onToggleAi={() => setIsAiExpanded((current) => !current)}
          />
        </YStack>
      </ScrollView>
      {AlertDialog}
    </View>
  );
}
