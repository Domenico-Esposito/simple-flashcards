import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { View, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useCurrentDeckState, useDeckActions } from '@/store/flashcards.selectors';
import { Header } from '@/components/layout/header';
import { DeckFormActions } from '@/components/screens/deck-form/DeckFormActions';
import { DeckFormFields } from '@/components/screens/deck-form/DeckFormFields';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useFormTextField } from '@/hooks/useFormTextField';
import { useKeyboardHeight } from '@/components/ui/RichTextEditor';

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
  const keyboardHeight = useKeyboardHeight();
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const { showAlert, AlertDialog } = useAppAlert();

  const currentDeck = useCurrentDeckState();
  const { loadDeck, addDeck, editDeck, removeDeck } = useDeckActions();

  const {
    value: title,
    trimmedValue: trimmedTitle,
    error: titleError,
    setValue: setTitle,
    onChangeText: onTitleChangeText,
    clearError: clearTitleError,
    validateRequired: validateTitle,
  } = useFormTextField();
  const {
    value: description,
    trimmedValue: trimmedDescription,
    setValue: setDescription,
    onChangeText: onDescriptionChangeText,
  } = useFormTextField();

  const descriptionMaxHeight =
    Platform.OS === 'ios' && keyboardHeight > 0 && scrollViewportHeight > 0
      ? scrollViewportHeight
      : undefined;

  useEffect(() => {
    if (isEditing) {
      loadDeck(deckId);
    }
  }, [deckId, isEditing, loadDeck]);

  useEffect(() => {
    if (isEditing && currentDeck) {
      setTitle(currentDeck.title);
      setDescription(currentDeck.description || '');
      clearTitleError();
    }
  }, [isEditing, currentDeck, setTitle, setDescription, clearTitleError]);

  const handleSave = async () => {
    if (!validateTitle(t('form.titleRequired'))) {
      return;
    }

    if (isEditing) {
      await editDeck(deckId, trimmedTitle, trimmedDescription || undefined);
    } else {
      await addDeck(trimmedTitle, trimmedDescription || undefined);
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
      <View flex={1} bg="$background" testID="deck-form-screen">
        <Header
          title={isEditing ? t('deck.editTitle') : t('deck.createTitle')}
          isModal={isEditing}
        />
        <ScrollView
          style={{ flex: 1 }}
          onLayout={(e) => setScrollViewportHeight(e.nativeEvent.layout.height)}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$4" flex={1} p="$4">
            <DeckFormFields
              title={title}
              titleError={titleError}
              description={description}
              descriptionMaxHeight={descriptionMaxHeight}
              titlePlaceholder={t('form.titlePlaceholder')}
              descriptionPlaceholder={t('form.descriptionPlaceholder')}
              onTitleChangeText={onTitleChangeText}
              onDescriptionChangeText={onDescriptionChangeText}
            />

            <DeckFormActions
              isEditing={isEditing}
              saveLabel={t('common.save')}
              deleteLabel={t('deck.delete.title')}
              cancelLabel={t('common.cancel')}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancel={() => router.back()}
            />
          </YStack>
        </ScrollView>
      </View>
      {AlertDialog}
    </KeyboardAvoidingView>
  );
}
