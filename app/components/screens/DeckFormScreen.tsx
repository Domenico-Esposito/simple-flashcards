import { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Button, Text, TextArea, View, YStack, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';
import { useAppAlert } from '@/hooks/useAppAlert';

const TITLE_LINE_HEIGHT = 32;

type DeckFormScreenProps = {
  deckId?: number;
};

/**
 * Unified deck form screen for creating and editing decks.
 * When deckId is provided, operates in edit mode; otherwise in create mode.
 */
export function DeckFormScreen({ deckId }: DeckFormScreenProps) {
  const isEditing = deckId != null;
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { showAlert, AlertDialog } = useAppAlert();

  const { currentDeck, loadDeck, addDeck, editDeck, removeDeck } = useFlashcardsStore();

  const titleRef = useRef<RNTextInput>(null);
  const descriptionRef = useRef<RNTextInput>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadDeck(deckId);
    }
  }, [deckId, isEditing, loadDeck]);

  useEffect(() => {
    if (isEditing && currentDeck) {
      setTitle(currentDeck.title);
      setDescription(currentDeck.description || '');
      // Update the actual input values
      if (titleRef.current) {
        titleRef.current.setNativeProps({ text: currentDeck.title });
      }
      if (descriptionRef.current) {
        descriptionRef.current.setNativeProps({
          text: currentDeck.description || '',
        });
      }
    }
  }, [isEditing, currentDeck]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t('form.titleRequired'));
      return;
    }

    if (isEditing) {
      await editDeck(deckId, title.trim(), description.trim() || undefined);
    } else {
      await addDeck(title.trim(), description.trim() || undefined);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!isEditing) return;
    showAlert(t('deck.delete.title'), t('deck.delete.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await removeDeck(deckId);
          router.dismissAll();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        <Header
          title={isEditing ? t('deck.editTitle') : t('deck.createTitle')}
          isModal={isEditing}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$4" flex={1} padding="$4">
            <YStack gap="$2">
              <RNTextInput
                ref={titleRef}
                defaultValue={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError('');
                }}
                placeholder={t('form.titlePlaceholder')}
                multiline
                scrollEnabled={false}
                style={{
                  fontSize: 24,
                  lineHeight: TITLE_LINE_HEIGHT,
                  fontWeight: '700',
                  padding: 0,
                  color: theme.color.val,
                }}
                placeholderTextColor={theme.color9.val}
              />
              {error && (
                <Text fontSize={12} color="$red10">
                  {error}
                </Text>
              )}
            </YStack>

            <YStack gap="$1" flex={1}>
              <TextArea
                ref={descriptionRef}
                id="description"
                size="$4"
                flex={1}
                defaultValue={description}
                onChangeText={setDescription}
                placeholder={t('form.descriptionPlaceholder')}
                borderWidth={0}
                backgroundColor="transparent"
                paddingHorizontal={0}
                paddingVertical={0}
                fontSize={16}
                color="$color"
                placeholderTextColor="$color9"
              />
            </YStack>

            <YStack gap="$3">
              <Button size="$4" onPress={handleSave} themeInverse>
                {t('common.save')}
              </Button>
              {isEditing && (
                <Button size="$4" onPress={handleDelete} theme="red">
                  {t('deck.delete.title')}
                </Button>
              )}
              <Button size="$4" onPress={() => router.back()} chromeless>
                {t('common.cancel')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </View>
      {AlertDialog}
    </KeyboardAvoidingView>
  );
}
