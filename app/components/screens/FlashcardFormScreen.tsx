import { useEffect, useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  View as RNView,
  Pressable,
  TextInput,
} from 'react-native';
import { Button, Text, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MarkdownToolbar } from '@domenico-esposito/react-native-markdown-editor';
import type { MarkdownToolbarButtonState } from '@domenico-esposito/react-native-markdown-editor';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
import { FlashcardType } from '@/types';

type EditorSection = 'question' | 'answer';

type OptionField = {
  id: string;
  text: string;
  isCorrect: boolean;
};

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
  const {
    addFlashcard,
    addMultipleChoiceFlashcard,
    editFlashcard,
    editMultipleChoiceFlashcard,
    removeFlashcard,
  } = useFlashcardsStore();
  const { showAlert, AlertDialog } = useAppAlert({ useModal: true });
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
  const [cardType, setCardType] = useState<FlashcardType>('standard');

  // Use a ref for unique ID generation
  const nextId = useRef(3);
  const [options, setOptions] = useState<OptionField[]>([
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const questionEditor = useMarkdownEditor({
    value: questionText,
    onChangeText: onQuestionChangeText,
  });

  const answerEditor = useMarkdownEditor({
    value: answerText,
    onChangeText: onAnswerChangeText,
  });

  // Get the active editor (only used for standard type's answer section)
  const activeEditor =
    activeSection === 'question' || cardType === 'multiple_choice' ? questionEditor : answerEditor;
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
          clearQuestionError();
          if (fc.type === 'multiple_choice') {
            setCardType('multiple_choice');
            setOptions(
              fc.options.map((o, i) => ({
                id: String(i),
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            );
            nextId.current = fc.options.length;
          } else {
            setCardType('standard');
            setAnswerText(fc.answer);
            clearAnswerError();
          }
        }
        setIsLoading(false);
      };
      loadFlashcard();
    }
  }, [mode, flashcardId, setQuestionText, setAnswerText, clearQuestionError, clearAnswerError]);

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: String(nextId.current++), text: '', isCorrect: false }]);
    setOptionsError(null);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed option was correct and there are remaining options, make first one correct
      if (prev[index].isCorrect && updated.length > 0) {
        updated[0] = { ...updated[0], isCorrect: true };
      }
      return updated;
    });
    setOptionsError(null);
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text } : o)));
    setOptionsError(null);
  };

  const handleSetCorrectOption = (index: number) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
    setOptionsError(null);
  };

  const handleTypeChange = (newType: FlashcardType) => {
    setCardType(newType);
    setOptionsError(null);
    clearAnswerError();
    if (newType === 'multiple_choice') {
      setActiveSection('question');
    }
  };

  const validateOptions = (): boolean => {
    setOptionsError(null);
    const filledOptions = options.filter((o) => o.text.trim().length > 0);
    if (filledOptions.length < 2) {
      setOptionsError(t('flashcard.minOptionsRequired'));
      return false;
    }
    if (!options.some((o) => o.isCorrect)) {
      setOptionsError(t('flashcard.correctOptionRequired'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    const isQuestionValid = validateQuestion(t('flashcard.questionRequired'));
    if (!isQuestionValid) return;

    if (cardType === 'multiple_choice') {
      const isOptionsValid = validateOptions();
      if (!isOptionsValid) return;

      // Only save options that have text
      const filledOptions = options.filter((o) => o.text.trim().length > 0);
      if (mode === 'new' && deckId !== undefined) {
        await addMultipleChoiceFlashcard(deckId, questionText, filledOptions);
      } else if (mode === 'edit' && flashcardId !== undefined) {
        await editMultipleChoiceFlashcard(flashcardId, questionText, filledOptions);
      }
    } else {
      const isAnswerValid = validateAnswer(t('flashcard.answerRequired'));
      if (!isAnswerValid) return;

      if (mode === 'new' && deckId !== undefined) {
        await addFlashcard(deckId, questionText, answerText);
      } else if (mode === 'edit' && flashcardId !== undefined) {
        await editFlashcard(flashcardId, questionText, answerText);
      }
    }

    router.back();
  };

  const handleDelete = () => {
    if (mode !== 'edit' || flashcardId === undefined) return;

    // Avoid tap-through with focused editors by dismissing keyboard first,
    // then opening the alert on the next frame.
    questionEditor.inputRef.current?.blur();
    answerEditor.inputRef.current?.blur();
    Keyboard.dismiss();

    requestAnimationFrame(() => {
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
    });
  };

  if (isLoading) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
        testID="flashcard-form-loading"
      >
        <Text color="$secondary">{t('common.loading')}</Text>
      </View>
    );
  }

  const showToolbar =
    keyboardHeight > 0 && (cardType === 'standard' || activeSection === 'question');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background" testID="flashcard-form-screen">
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
            {/* Type toggle */}
            <XStack gap="$2" padding="$1" borderRadius="$4" backgroundColor="$color2">
              <Button
                size="$3"
                flex={1}
                onPress={() => handleTypeChange('standard')}
                borderWidth={0}
                backgroundColor={cardType === 'standard' ? '$background' : 'transparent'}
                pressStyle={{ backgroundColor: '$background' }}
                testID="flashcard-form-type-standard"
                accessibilityLabel="flashcard-form-type-standard"
              >
                {t('flashcard.typeStandard')}
              </Button>
              <Button
                size="$3"
                flex={1}
                onPress={() => handleTypeChange('multiple_choice')}
                borderWidth={0}
                backgroundColor={cardType === 'multiple_choice' ? '$background' : 'transparent'}
                pressStyle={{ backgroundColor: '$background' }}
                testID="flashcard-form-type-multiple-choice"
                accessibilityLabel="flashcard-form-type-multiple-choice"
              >
                {t('flashcard.typeMultipleChoice')}
              </Button>
            </XStack>

            {/* Section toggle (only for standard type) */}
            {cardType === 'standard' && (
              <XStack gap="$2" padding="$1" borderRadius="$4" backgroundColor="$color2">
                <Button
                  size="$3"
                  flex={1}
                  onPress={() => setActiveSection('question')}
                  borderWidth={0}
                  backgroundColor={activeSection === 'question' ? '$background' : 'transparent'}
                  pressStyle={{ backgroundColor: '$background' }}
                  testID="flashcard-form-section-question"
                  accessibilityLabel="flashcard-form-section-question"
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
                  testID="flashcard-form-section-answer"
                  accessibilityLabel="flashcard-form-section-answer"
                >
                  {t('flashcard.answer')}
                </Button>
              </XStack>
            )}

            {/* Question Editor - always visible for MC, toggle for standard */}
            <YStack
              gap="$1"
              flex={cardType === 'multiple_choice' ? undefined : 1}
              display={
                cardType === 'multiple_choice' || activeSection === 'question' ? 'flex' : 'none'
              }
            >
              <RichTextEditor
                editor={questionEditor}
                placeholder={t('flashcard.questionPlaceholder')}
                testID="flashcard-form-question-input"
              />
              {!!questionError && (
                <Text fontSize={12} color="$red10">
                  {questionError}
                </Text>
              )}
            </YStack>

            {/* Answer Editor - always mounted, hidden when not active or MC mode */}
            <YStack
              gap="$1"
              flex={1}
              display={cardType === 'standard' && activeSection === 'answer' ? 'flex' : 'none'}
            >
              <RichTextEditor
                editor={answerEditor}
                placeholder={t('flashcard.answerPlaceholder')}
                testID="flashcard-form-answer-input"
              />
              {!!answerError && (
                <Text fontSize={12} color="$red10">
                  {answerError}
                </Text>
              )}
            </YStack>

            {/* Multiple choice options */}
            {cardType === 'multiple_choice' && (
              <YStack gap="$3">
                {options.map((option, index) => (
                  <XStack key={option.id} gap="$2" alignItems="center">
                    <Pressable
                      onPress={() => handleSetCorrectOption(index)}
                      hitSlop={8}
                      testID={`flashcard-form-option-correct-${index}`}
                      accessibilityLabel={`flashcard-form-option-correct-${index}`}
                    >
                      <MaterialIcons
                        name={option.isCorrect ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={24}
                        color={option.isCorrect ? colors.success : colors.iconDefault}
                      />
                    </Pressable>
                    <View flex={1}>
                      <TextInput
                        testID={`flashcard-form-option-input-${index}`}
                        accessibilityLabel={`flashcard-form-option-input-${index}`}
                        value={option.text}
                        onChangeText={(text) => handleOptionTextChange(index, text)}
                        placeholder={t('flashcard.optionPlaceholder', { index: index + 1 })}
                        placeholderTextColor={colors.placeholder}
                        style={{
                          fontSize: 16,
                          color: colors.text,
                          borderWidth: 1,
                          borderColor: option.isCorrect ? colors.success : colors.border,
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: colors.inputBg,
                        }}
                      />
                    </View>
                    {options.length > 2 && (
                      <Pressable
                        onPress={() => handleRemoveOption(index)}
                        hitSlop={8}
                        testID={`flashcard-form-option-remove-${index}`}
                        accessibilityLabel={`flashcard-form-option-remove-${index}`}
                      >
                        <MaterialIcons name="close" size={20} color={colors.error} />
                      </Pressable>
                    )}
                  </XStack>
                ))}
                <Button
                  size="$3"
                  onPress={handleAddOption}
                  chromeless
                  icon={<MaterialIcons name="add" size={18} color={colors.accent} />}
                  testID="flashcard-form-add-option-button"
                  accessibilityLabel="flashcard-form-add-option-button"
                >
                  <Text color={colors.accent}>{t('flashcard.addOption')}</Text>
                </Button>
                {!!optionsError && (
                  <Text fontSize={12} color="$red10">
                    {optionsError}
                  </Text>
                )}
              </YStack>
            )}

            <YStack gap="$3">
              <Button
                size="$4"
                onPress={handleSave}
                themeInverse
                testID="flashcard-form-save-button"
                accessibilityLabel="flashcard-form-save-button"
              >
                {t('common.save')}
              </Button>
              {mode === 'edit' && (
                <Button
                  size="$4"
                  onPress={handleDelete}
                  theme="red"
                  testID="flashcard-form-delete-button"
                  accessibilityLabel="flashcard-form-delete-button"
                >
                  {t('common.delete')}
                </Button>
              )}
              <Button
                size="$4"
                onPress={() => router.back()}
                chromeless
                testID="flashcard-form-cancel-button"
                accessibilityLabel="flashcard-form-cancel-button"
              >
                {t('common.cancel')}
              </Button>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Floating toolbar above keyboard */}
        {showToolbar && (
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
              <Pressable
                onPress={handleDonePress}
                style={{ paddingHorizontal: 12 }}
                hitSlop={8}
                testID="flashcard-form-keyboard-done-button"
                accessibilityLabel="flashcard-form-keyboard-done-button"
              >
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
