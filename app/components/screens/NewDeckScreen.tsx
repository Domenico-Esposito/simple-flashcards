import { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, TextInput as RNTextInput } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';

export function NewDeckScreen() {
  const router = useRouter();
  const addDeck = useFlashcardsStore((state) => state.addDeck);

  const titleRef = useRef<RNTextInput>(null);
  const descriptionRef = useRef<RNTextInput>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }

    await addDeck(title.trim(), description.trim() || undefined, emoji.trim() || undefined);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View flex={1} backgroundColor="$background">
        <Header title="Nuovo Mazzo" />
        <YStack gap="$4" flex={1} padding="$4">
          <YStack gap="$1">
            <Label htmlFor="title">Titolo *</Label>
            <XStack gap="$3" alignItems="center">
              <Input
                id="emoji"
                size="$4"
                defaultValue={emoji}
                onChangeText={(text) => {
                  // Extract only the first emoji/character
                  const firstEmoji = [...text].slice(-1).join('');
                  setEmoji(firstEmoji);
                }}
                placeholder="📚"
                width={60}
                textAlign="center"
                fontSize={28}
              />
              <Input
                ref={titleRef}
                id="title"
                flex={1}
                size="$4"
                defaultValue={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError('');
                }}
                placeholder="Es: Vocabolario inglese"
                borderColor={error ? '$red10' : undefined}
              />
            </XStack>
            {error && <Text fontSize={12} color="$red10">{error}</Text>}
          </YStack>

          <YStack gap="$1" flex={1}>
            <Label htmlFor="description">Descrizione</Label>
            <TextArea
              ref={descriptionRef}
              id="description"
              size="$4"
              flex={1}
              defaultValue={description}
              onChangeText={setDescription}
              placeholder="Descrizione opzionale del mazzo"
              borderWidth={0}
              backgroundColor="transparent"
              paddingHorizontal={0}
              paddingVertical={0}
              placeholderTextColor="$color9"
            />
          </YStack>

          <YStack gap="$3">
            <Button size="$4" onPress={handleSave} themeInverse>Salva</Button>
            <Button size="$4" onPress={() => router.back()} chromeless>Annulla</Button>
          </YStack>
        </YStack>
      </View>
    </KeyboardAvoidingView>
  );
}
