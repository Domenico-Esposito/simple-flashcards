import { useState } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { Text, View, YStack, ListItem } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { useDecksState } from '@/store/flashcards.selectors';
import { exportDeckToJson, shareJsonFile } from '@/utils/import-export';
import type { Deck } from '@/types';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ExportScreen() {
  const { t } = useTranslation();
  const decks = useDecksState();
  const { showAlert, AlertDialog } = useAppAlert();
  const [exportingDeckId, setExportingDeckId] = useState<number | null>(null);

  const handleExportDeck = async (deck: Deck) => {
    setExportingDeckId(deck.id);
    try {
      const json = await exportDeckToJson(deck.id);
      const sanitizedTitle = deck.title.replace(/[^a-zA-Z0-9]/g, '_') || 'deck';
      const filename = `flashcards_${sanitizedTitle}_${Date.now()}.json`;
      await shareJsonFile(json, filename);
    } catch (error) {
      showAlert(t('common.error'), error instanceof Error ? error.message : t('export.error'));
    } finally {
      setExportingDeckId(null);
    }
  };

  const renderDeckItem = ({ item }: { item: Deck }) => {
    const isExporting = exportingDeckId === item.id;

    return (
      <ListItem
        testID={`export-deck-item-${item.id}`}
        accessibilityLabel={`export-deck-item-${item.id}`}
        pressTheme
        onPress={() => !isExporting && handleExportDeck(item)}
        bg="$background"
        hoverTheme
        disabled={isExporting}
        opacity={isExporting ? 0.5 : 1}
        borderRadius={16}
        paddingVertical={14}
        paddingHorizontal={16}
        iconAfter={
          isExporting ? (
            <MaterialIcons name="hourglass-empty" size={24} color="gray" />
          ) : (
            <MaterialIcons name="ios-share" size={24} color="gray" />
          )
        }
      >
        <ListItem.Text fontSize={16} fontWeight="500" color="$color">
          {item.title}
        </ListItem.Text>
      </ListItem>
    );
  };

  return (
    <View flex={1} bg="$background" testID="export-screen">
      <Header title={t('export.title')} showBackButton />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack p="$4" gap="$6">
          <YStack gap="$6">
            <Text fontSize={18} fontWeight="600" color="$color">
              {t('export.selectDeck')}
            </Text>
            <Text fontSize={14} color="$secondary">
              {t('export.description')}
            </Text>
          </YStack>

          {decks.length === 0 ? (
            <YStack p="$4" pt="$8" alignItems="center">
              <MaterialIcons name="folder-open" size={64} color="gray" style={{ opacity: 0.3 }} />
              <Text
                fontSize={16}
                color="$placeholderColor"
                mt="$4"
                textAlign="center"
                testID="export-empty-state"
              >
                {t('export.noDecks')}
              </Text>
            </YStack>
          ) : (
            <FlatList
              data={decks}
              renderItem={renderDeckItem}
              ItemSeparatorComponent={() => <YStack height="$0.5" />}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
            />
          )}
        </YStack>
      </ScrollView>
      {AlertDialog}
    </View>
  );
}
