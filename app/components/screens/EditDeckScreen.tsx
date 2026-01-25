import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';

type EditDeckScreenProps = {
  deckId: number;
};

export function EditDeckScreen({ deckId }: EditDeckScreenProps) {
  const router = useRouter();
  
  const { currentDeck, loadDeck, editDeck, removeDeck } = useFlashcardsStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeck(deckId);
  }, [deckId, loadDeck]);

  useEffect(() => {
    if (currentDeck) {
      setTitle(currentDeck.title);
      setDescription(currentDeck.description || '');
    }
  }, [currentDeck]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Il titolo è obbligatorio');
      return;
    }
    
    await editDeck(deckId, title.trim(), description.trim() || undefined);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina mazzo',
      'Sei sicuro di voler eliminare questo mazzo e tutte le sue flashcard?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive', 
          onPress: async () => {
            await removeDeck(deckId);
            router.dismissAll();
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        <Header title="Modifica Mazzo" isModal />
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
            <Button size="$4" onPress={handleDelete} theme="red">Elimina mazzo</Button>
            <Button size="$4" onPress={() => router.back()} chromeless>Annulla</Button>
          </YStack>
        </YStack>
      </View>
    </KeyboardAvoidingView>
  );
}
