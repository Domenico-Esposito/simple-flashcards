import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';

export function NewDeckScreen() {
  const router = useRouter();
  const addDeck = useFlashcardsStore((state) => state.addDeck);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }

    await addDeck(title.trim(), description.trim() || undefined);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View flex={1} backgroundColor="$background">
        <Header title="Nuovo Mazzo" />
        <YStack gap="$4" flex={1} padding="$4">
          <YStack gap="$1">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              size="$4"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError('');
              }}
              placeholder="Es: Vocabolario inglese"
              borderColor={error ? '$red10' : undefined}
            />
            {error && <Text fontSize={12} color="$red10">{error}</Text>}
          </YStack>

          <YStack gap="$1">
            <Label htmlFor="description">Descrizione</Label>
            <TextArea
              id="description"
              size="$4"
              value={description}
              onChangeText={setDescription}
              placeholder="Descrizione opzionale del mazzo"
              numberOfLines={3}
            />
          </YStack>

          <View flex={1} />

          <YStack gap="$3">
            <Button size="$4" onPress={handleSave} themeInverse>Salva</Button>
            <Button size="$4" onPress={() => router.back()} chromeless>Annulla</Button>
          </YStack>
        </YStack>
      </View>
    </KeyboardAvoidingView>
  );
}
