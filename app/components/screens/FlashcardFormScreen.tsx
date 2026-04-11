import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Platform, ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CompactBooleanToggle } from '@/components/flashcard-form/CompactBooleanToggle';
import { FlashcardEditorToolbar } from '@/components/flashcard-form/FlashcardEditorToolbar';
import { FlashcardFormActions } from '@/components/flashcard-form/FlashcardFormActions';
import { MarkdownEditorField } from '@/components/flashcard-form/MarkdownEditorField';
import { MultipleChoiceOptionsField } from '@/components/flashcard-form/MultipleChoiceOptionsField';
import type { EditorSection } from '@/components/flashcard-form/types';
import { Header } from '@/components/Header';
import { useKeyboardHeight, useMarkdownEditor } from '@/components/ui/RichTextEditor';
import { getColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { useFlashcardFormState } from '@/components/screens/flashcard-form/useFlashcardFormState';

const FORM_CONTENT_PADDING = 16;
const FORM_CONTENT_BOTTOM_PADDING = 24;
const TOOLBAR_KEYBOARD_GAP_IOS = 8;
const TOOLBAR_KEYBOARD_GAP_ANDROID = 35;
const TOOLBAR_INITIAL_HEIGHT = 56;

type FlashcardFormScreenProps = {
  mode: 'new' | 'edit';
  deckId?: number;
  flashcardId?: number;
};

export function FlashcardFormScreen({ mode, deckId, flashcardId }: FlashcardFormScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isLargeScreen = useIsLargeScreen();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { showAlert, AlertDialog } = useAppAlert({ useModal: true });
  const [activeSection, setActiveSection] = useState<EditorSection>('question');
  const [focusedEditorSection, setFocusedEditorSection] = useState<EditorSection | null>(null);
  const [toolbarHeight, setToolbarHeight] = useState(TOOLBAR_INITIAL_HEIGHT);

  const {
    isLoading,
    cardType,
    options,
    questionText,
    answerText,
    onQuestionChange,
    onAnswerChange,
    questionError,
    answerError,
    optionsError,
    canDelete,
    handleTypeChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionTextChange,
    handleSetCorrectOption,
    handleSave,
    deleteCurrentFlashcard,
  } = useFlashcardFormState({ mode, deckId, flashcardId });

  const questionEditor = useMarkdownEditor({
    value: questionText,
    onChangeText: onQuestionChange,
  });

  const answerEditor = useMarkdownEditor({
    value: answerText,
    onChangeText: onAnswerChange,
  });

  const activeEditor = focusedEditorSection === 'answer' ? answerEditor : questionEditor;
  const toolbarBottomOffset = Platform.OS === 'ios' ? insets.bottom + TOOLBAR_KEYBOARD_GAP_IOS : 8;
  const toolbarKeyboardGap =
    Platform.OS === 'android' ? TOOLBAR_KEYBOARD_GAP_ANDROID : TOOLBAR_KEYBOARD_GAP_IOS;

  useEffect(() => {
    if (cardType === 'multiple_choice' && focusedEditorSection === 'answer') {
      setFocusedEditorSection(null);
    }
  }, [cardType, focusedEditorSection]);

  useEffect(() => {
    const focusedSection = focusedEditorSection;

    if (focusedSection == null) {
      return;
    }

    const isFocusedEditorVisible =
      focusedSection === 'question'
        ? activeSection === 'question'
        : cardType === 'standard' && activeSection === 'answer';

    if (isFocusedEditorVisible) {
      return;
    }

    setFocusedEditorSection(null);
    Keyboard.dismiss();
  }, [activeSection, cardType, focusedEditorSection]);

  const isMarkdownEditorFocused =
    focusedEditorSection != null &&
    (focusedEditorSection === 'question'
      ? activeSection === 'question'
      : cardType === 'standard' && activeSection === 'answer');

  const showToolbar =
    isMarkdownEditorFocused && (cardType === 'standard' || focusedEditorSection === 'question');

  const bottomOverlayOffset =
    keyboardHeight > 0 ? keyboardHeight + toolbarKeyboardGap : toolbarBottomOffset;
  const editorBottomPadding = showToolbar
    ? bottomOverlayOffset + toolbarHeight + FORM_CONTENT_PADDING
    : Math.max(insets.bottom, FORM_CONTENT_BOTTOM_PADDING);
  const scrollContentBottomPadding = Math.max(insets.bottom, FORM_CONTENT_BOTTOM_PADDING);

  const handleDonePress = useCallback(() => {
    activeEditor.inputRef.current?.blur();
    Keyboard.dismiss();
  }, [activeEditor]);

  const handleDelete = () => {
    if (!canDelete) {
      return;
    }

    showAlert(t('flashcard.delete.title'), t('flashcard.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: deleteCurrentFlashcard,
      },
    ]);
  };

  const handleCardTypeToggle = useCallback(
    (enabled: boolean) => {
      setActiveSection('question');
      handleTypeChange(enabled ? 'multiple_choice' : 'standard');
    },
    [handleTypeChange],
  );

  const handleSectionToggle = useCallback(
    (enabled: boolean) => {
      setActiveSection(
        enabled ? (cardType === 'multiple_choice' ? 'options' : 'answer') : 'question',
      );
    },
    [cardType],
  );

  const handleEditorFocus = useCallback((section: EditorSection) => {
    setFocusedEditorSection(section);
  }, []);

  const handleEditorBlur = useCallback((section: EditorSection) => {
    setFocusedEditorSection((currentSection) =>
      currentSection === section ? null : currentSection,
    );
  }, []);

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

  const isMultipleChoice = cardType === 'multiple_choice';
  const isSecondarySectionActive = activeSection === (isMultipleChoice ? 'options' : 'answer');
  const showQuestionEditor = activeSection === 'question';
  const showAnswerEditor = cardType === 'standard' && activeSection === 'answer';
  const questionHasError = questionError.length > 0;
  const answerHasError = answerError.length > 0;
  const optionsHasError = optionsError.length > 0;
  const secondarySectionHasError = isMultipleChoice ? optionsHasError : answerHasError;

  return (
    <View flex={1} backgroundColor="$background" testID="flashcard-form-screen">
      <Header
        title={mode === 'new' ? t('flashcard.createTitle') : t('flashcard.editTitle')}
        isModal
      />
      <View flex={1} minHeight={0}>
        <View backgroundColor="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
          <XStack gap="$2" paddingHorizontal="$4" paddingVertical="$2">
            <CompactBooleanToggle
              value={isMultipleChoice}
              onChange={handleCardTypeToggle}
              accentColor={colors.accent}
              errorColor={colors.error}
              activeBackgroundColor={colors.accentBgTint}
              inactiveIconColor={colors.toolbarInactive}
              inactiveTextColor="$secondary"
              falseLabel={t('flashcard.typeStandard')}
              trueLabel={t('flashcard.typeMultipleChoice')}
              falseIcon="short-text"
              trueIcon="playlist-add-check"
              falseTestID="flashcard-form-single-answer-toggle"
              trueTestID="flashcard-form-multiple-choice-toggle"
              showActiveLabel={isLargeScreen}
              equalSegmentWidths={isLargeScreen}
            />
            <CompactBooleanToggle
              value={isSecondarySectionActive}
              onChange={handleSectionToggle}
              accentColor={colors.accent}
              errorColor={colors.error}
              activeBackgroundColor={colors.accentBgTint}
              inactiveIconColor={colors.toolbarInactive}
              inactiveTextColor="$secondary"
              falseLabel={t('flashcard.question')}
              trueLabel={isMultipleChoice ? t('flashcard.options') : t('flashcard.answer')}
              falseIcon="help-outline"
              trueIcon={isMultipleChoice ? 'format-list-bulleted' : 'chat-bubble-outline'}
              falseTestID="flashcard-form-question-toggle"
              trueTestID="flashcard-form-answer-toggle"
              falseHasError={questionHasError}
              trueHasError={secondarySectionHasError}
              showActiveLabel={isLargeScreen}
              equalSegmentWidths={isLargeScreen}
            />
          </XStack>
        </View>

        {(showQuestionEditor || showAnswerEditor) && (
          <RNScrollView
            style={{ flex: 1 }}
            scrollEnabled={!isMarkdownEditorFocused}
            automaticallyAdjustContentInsets={false}
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustsScrollIndicatorInsets={false}
            contentInsetAdjustmentBehavior="never"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={!isMarkdownEditorFocused}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: FORM_CONTENT_PADDING,
              paddingBottom: editorBottomPadding,
            }}
          >
            <YStack
              flex={isMarkdownEditorFocused ? 1 : undefined}
              minHeight={isMarkdownEditorFocused ? 0 : undefined}
              gap="$4"
              paddingHorizontal="$4"
            >
              {showQuestionEditor && (
                <MarkdownEditorField
                  editor={questionEditor}
                  placeholder={t('flashcard.questionPlaceholder')}
                  testID="flashcard-form-question-input"
                  error={questionError}
                  fillAvailableSpace={isMarkdownEditorFocused}
                  onFocus={() => handleEditorFocus('question')}
                  onBlur={() => handleEditorBlur('question')}
                />
              )}

              {showAnswerEditor && (
                <MarkdownEditorField
                  editor={answerEditor}
                  placeholder={t('flashcard.answerPlaceholder')}
                  testID="flashcard-form-answer-input"
                  error={answerError}
                  fillAvailableSpace={isMarkdownEditorFocused}
                  onFocus={() => handleEditorFocus('answer')}
                  onBlur={() => handleEditorBlur('answer')}
                />
              )}

              {!isMarkdownEditorFocused && (
                <FlashcardFormActions
                  canDelete={canDelete}
                  saveLabel={t('common.save')}
                  deleteLabel={t('common.delete')}
                  cancelLabel={t('common.cancel')}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onCancel={() => router.back()}
                />
              )}
            </YStack>
          </RNScrollView>
        )}

        {cardType === 'multiple_choice' && activeSection === 'options' && (
          <RNScrollView
            style={{ flex: 1 }}
            automaticallyAdjustContentInsets={false}
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustsScrollIndicatorInsets={false}
            contentInsetAdjustmentBehavior="never"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: FORM_CONTENT_PADDING,
              paddingBottom: scrollContentBottomPadding,
            }}
          >
            <YStack gap="$4" paddingHorizontal="$4">
              <View>
                <MultipleChoiceOptionsField
                  options={options}
                  colors={colors}
                  addOptionLabel={t('flashcard.addOption')}
                  getOptionPlaceholder={(index) =>
                    t('flashcard.optionPlaceholder', { index: index + 1 })
                  }
                  optionsError={optionsError}
                  onAddOption={handleAddOption}
                  onOptionTextChange={handleOptionTextChange}
                  onSetCorrectOption={handleSetCorrectOption}
                  onRemoveOption={handleRemoveOption}
                />
              </View>
              <FlashcardFormActions
                canDelete={canDelete}
                saveLabel={t('common.save')}
                deleteLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => router.back()}
              />
            </YStack>
          </RNScrollView>
        )}
      </View>
      {showToolbar && (
        <FlashcardEditorToolbar
          editor={activeEditor}
          bottomOffset={bottomOverlayOffset}
          doneLabel={t('common.done')}
          accentColor={colors.accent}
          colors={colors}
          onDone={handleDonePress}
          onHeightChange={(nextHeight) => {
            setToolbarHeight((currentHeight) =>
              Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight,
            );
          }}
        />
      )}
      {AlertDialog}
    </View>
  );
}
