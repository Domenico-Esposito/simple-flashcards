import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Input, Label, Text, View, YStack, XStack } from 'tamagui';
import Markdown from 'react-native-markdown-display';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { importDeckFromUrl, JSON_FORMAT_DOCS } from '@/utils/import-export';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { loadDecks } = useFlashcardsStore();
  
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showFormat, setShowFormat] = useState(false);

  const handleImport = async () => {
    if (!importUrl.trim()) {
      Alert.alert('Errore', 'Inserisci un URL valido');
      return;
    }
    
    setIsImporting(true);
    try {
      const deck = await importDeckFromUrl(importUrl.trim());
      await loadDecks();
      Alert.alert(
        'Importazione completata',
        `Mazzo "${deck.title}" importato con ${deck.flashcards.length} flashcard!`,
        [{ text: 'OK', onPress: () => setImportUrl('') }]
      );
    } catch (error) {
      Alert.alert('Errore', error instanceof Error ? error.message : 'Errore durante l\'importazione');
    } finally {
      setIsImporting(false);
    }
  };

  const markdownStyles = {
    body: {
      color: colorScheme === 'dark' ? '#F5F5F5' : '#171717',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: colorScheme === 'dark' ? '#262626' : '#F5F5F5',
      padding: 12,
      borderRadius: 8,
      fontSize: 12,
    },
    code_inline: {
      backgroundColor: colorScheme === 'dark' ? '#404040' : '#E5E5E5',
      color: colorScheme === 'dark' ? '#93C5FD' : '#2563EB',
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    heading2: {
      color: colorScheme === 'dark' ? '#F5F5F5' : '#171717',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading3: {
      color: colorScheme === 'dark' ? '#F5F5F5' : '#171717',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
    },
    list_item: {
      color: colorScheme === 'dark' ? '#F5F5F5' : '#171717',
    },
    strong: {
      fontWeight: 'bold',
    },
  };

  return (
    <View flex={1} backgroundColor="$background">
      <Header title="Impostazioni" showBackButton={false} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" gap="$6">

          {/* Import Section */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              Importa mazzo
            </Text>
            <Text fontSize={14} color="$secondary">
              Importa un mazzo da un file JSON ospitato sul web.
            </Text>
            <YStack gap="$1">
              <Label htmlFor="importUrl">URL del file JSON</Label>
              <Input
                id="importUrl"
                size="$4"
                value={importUrl}
                onChangeText={setImportUrl}
                placeholder="https://esempio.com/mazzo.json"
              />
            </YStack>
            <Button 
              size="$4"
              onPress={handleImport}
              disabled={isImporting}
              themeInverse
            >
              {isImporting ? "Importando..." : "Importa"}
            </Button>
          </YStack>

          {/* Format Documentation */}
          <YStack gap="$3">
            <Button 
              size="$4"
              onPress={() => setShowFormat(!showFormat)}
              chromeless
            >
              {showFormat ? "Nascondi formato JSON" : "Mostra formato JSON"}
            </Button>
            {showFormat && (
              <View 
                backgroundColor="$backgroundStrong" 
                padding="$4" 
                borderRadius="$3"
              >
                <Markdown style={markdownStyles}>
                  {JSON_FORMAT_DOCS}
                </Markdown>
              </View>
            )}
          </YStack>

          {/* App Info */}
          <YStack gap="$3" marginTop="$4">
            <Text fontSize={18} fontWeight="600" color="$color">
              Informazioni
            </Text>
            <View 
              backgroundColor="$backgroundStrong" 
              padding="$4" 
              borderRadius="$3"
              gap="$2"
            >
              <XStack justifyContent="space-between">
                <Text color="$secondary">Versione</Text>
                <Text color="$color">1.0.0</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text color="$secondary">Sviluppato con</Text>
                <Text color="$color">React Native + Expo</Text>
              </XStack>
            </View>
            <Text fontSize={12} color="$placeholderColor" textAlign="center" marginTop="$2">
              Minimal Flashcards - Studia in modo semplice ed efficace
            </Text>
          </YStack>

          {/* Theme info */}
          <YStack gap="$2" marginTop="$2">
            <Text fontSize={14} color="$secondary" textAlign="center">
              Il tema segue le impostazioni di sistema.
            </Text>
            <Text fontSize={12} color="$placeholderColor" textAlign="center">
              Tema attuale: {colorScheme === 'dark' ? 'Scuro' : 'Chiaro'}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
