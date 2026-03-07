import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  View as RNView,
  Pressable,
} from 'react-native';
import { Button, Text, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarkdownToolbar } from '@domenico-esposito/react-native-markdown-editor';
import type { MarkdownToolbarButtonState } from '@domenico-esposito/react-native-markdown-editor';
import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';
import { getFlashcardById } from '@/utils/database';
import {
  RichTextEditor,
  useKeyboardHeight,
  useMarkdownEditor,
} from '@/components/ui/RichTextEditor';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppAlert } from '@/hooks/useAppAlert';
import { getColors } from '@/constants/colors';
import { useFormTextField } from '@/hooks/useFormTextField';

type EditorSection = 'question' | 'answer';

type FlashcardFormScreenProps = {
  mode: 'new' | 'edit';
  deckId?: number;
  flashcardId?: number;
};

export function FlashcardFormScreen({ mode, deckId, flashcardId }: FlashcardFormScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const { addFlashcard, editFlashcard, removeFlashcard } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert();
  const keyboardHeight = useKeyboardHeight();
  const insets = useSafeAreaInsets();

  const {
    value: questionText,
    error: questionError,
    setValue: setQuestionText,
    onChangeText: onQuestionChangeText,
    clearError: clearQuestionError,
    validateRequired: validateQuestion,
  } = useFormTextField();
  const {
    value: answerText,
    error: answerError,
    setValue: setAnswerText,
    onChangeText: onAnswerChangeText,
    clearError: clearAnswerError,
    validateRequired: validateAnswer,
  } = useFormTextField();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [activeSection, setActiveSection] = useState<EditorSection>('question');

  const questionEditor = useMarkdownEditor({
    value: questionText,
    onChangeText: onQuestionChangeText,
  });

  const answerEditor = useMarkdownEditor({
    value: answerText,
    onChangeText: onAnswerChangeText,
  });

  // Get the active editor
  const activeEditor = activeSection === 'question' ? questionEditor : answerEditor;
  const toolbarBottomOffset = Platform.OS === 'ios' ? insets.bottom + 38 : 8;

  const handleDonePress = () => {
    activeEditor.inputRef.current?.blur();
    Keyboard.dismiss();
  };

  // Load existing flashcard data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && flashcardId) {
      const loadFlashcard = async () => {
        const fc = await getFlashcardById(flashcardId);
        if (fc) {
          setQuestionText(fc.question);
          setAnswerText(fc.answer);
          clearQuestionError();
          clearAnswerError();
        }
        setIsLoading(false);
      };
      loadFlashcard();
    }
  }, [mode, flashcardId, setQuestionText, setAnswerText, clearQuestionError, clearAnswerError]);

  const handleSave = async () => {
    const isQuestionValid = validateQuestion(t('flashcard.questionRequired'));
    const isAnswerValid = validateAnswer(t('flashcard.answerRequired'));

    if (!isQuestionValid || !isAnswerValid) return;

    if (mode === 'new' && deckId !== undefined) {
      await addFlashcard(deckId, questionText, answerText);
    } else if (mode === 'edit' && flashcardId !== undefined) {
      await editFlashcard(flashcardId, questionText, answerText);
    }

    router.back();
  };

  const handleDelete = () => {
    if (mode !== 'edit' || flashcardId === undefined) return;

    showAlert(t('flashcard.delete.title'), t('flashcard.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await removeFlashcard(flashcardId);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$secondary">{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        <Header
          title={mode === 'new' ? t('flashcard.createTitle') : t('flashcard.editTitle')}
          isModal
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: keyboardHeight > 0 ? 80 : 0,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$4" flex={1} paddingHorizontal="$4">
            <XStack gap="$2" padding="$1" borderRadius="$4" backgroundColor="$color2">
              <Button
                size="$3"
                flex={1}
                onPress={() => setActiveSection('question')}
                borderWidth={0}
                backgroundColor={activeSection === 'question' ? '$background' : 'transparent'}
                pressStyle={{ backgroundColor: '$background' }}
              >
                {t('flashcard.question')}
              </Button>
              <Button
                size="$3"
                flex={1}
                onPress={() => setActiveSection('answer')}
                borderWidth={0}
                backgroundColor={activeSection === 'answer' ? '$background' : 'transparent'}
                pressStyle={{ backgroundColor: '$background' }}
              >
                {t('flashcard.answer')}
              </Button>
            </XStack>

            {/* Question Editor - always mounted, hidden when not active */}
            <YStack gap="$1" flex={1} display={activeSection === 'question' ? 'flex' : 'none'}>
              <RichTextEditor
                editor={questionEditor}
                placeholder={t('flashcard.questionPlaceholder')}
              />
              {!!questionError && (
                <Text fontSize={12} color="$red10">
                  {questionError}
                </Text>
              )}
            </YStack>

            {/* Answer Editor - always mounted, hidden when not active */}
            <YStack gap="$1" flex={1} display={activeSection === 'answer' ? 'flex' : 'none'}>
              <RichTextEditor
                editor={answerEditor}
                placeholder={t('flashcard.answerPlaceholder')}
              />
              {!!answerError && (
                <Text fontSize={12} color="$red10">
                  {answerError}
                </Text>
              )}
            </YStack>

            <YStack gap="$3">
              <Button size="$4" onPress={handleSave} themeInverse>
                {t('common.save')}
              </Button>
              {mode === 'edit' && (
                <Button size="$4" onPress={handleDelete} theme="red">
                  {t('common.delete')}
                </Button>
              )}
              <Button size="$4" onPress={() => router.back()} chromeless>
                {t('common.cancel')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Floating toolbar above keyboard */}
        {keyboardHeight > 0 && (
          <RNView
            style={{
              position: 'absolute',
              bottom: toolbarBottomOffset,
              left: 0,
              right: 0,
              zIndex: 100,
            }}
          >
            <XStack
              borderRadius="$4"
              paddingVertical="$2"
              backgroundColor={colors.toolbarBg}
              borderTopColor="$borderColor"
              alignItems="center"
              marginHorizontal="$4"
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                keyboardShouldPersistTaps="always"
                style={{ flex: 1 }}
              >
                <MarkdownToolbar
                  editor={activeEditor}
                  style={{ flexWrap: 'nowrap', marginBottom: 0, gap: 2 }}
                  buttonStyle={(state: MarkdownToolbarButtonState) => ({
                    borderWidth: 0,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    backgroundColor: state.active ? colors.toolbarActiveBg : 'transparent',
                  })}
                  buttonTextStyle={(state: MarkdownToolbarButtonState) => ({
                    color: state.active ? colors.toolbarActive : colors.toolbarInactive,
                    fontSize: 14,
                    fontWeight: '600',
                  })}
                />
              </ScrollView>
              <Pressable onPress={handleDonePress} style={{ paddingHorizontal: 12 }} hitSlop={8}>
                <Text color={colors.accent} fontWeight="600">
                  {t('common.done')}
                </Text>
              </Pressable>
            </XStack>
          </RNView>
        )}
      </View>
      {AlertDialog}
    </KeyboardAvoidingView>
  );
}
