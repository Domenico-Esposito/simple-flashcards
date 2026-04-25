import { useCallback, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, View } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { FlashcardEditorToolbar } from '@/components/flashcard-form/FlashcardEditorToolbar';
import type { EditorSection } from '@/components/flashcard-form/types';
import { createHeaderAction, Header } from '@/components/layout/header';
import {
  FORM_CONTENT_PADDING,
  FORM_CONTENT_BOTTOM_PADDING,
  TOOLBAR_INITIAL_HEIGHT,
  TOOLBAR_KEYBOARD_GAP_ANDROID,
  TOOLBAR_KEYBOARD_GAP_IOS,
} from '@/components/screens/flashcard-form/constants';
import { FlashcardEditorSection } from '@/components/screens/flashcard-form/FlashcardEditorSection';
import { FlashcardOptionsSection } from '@/components/screens/flashcard-form/FlashcardOptionsSection';
import { FlashcardFormToggleBar } from '@/components/screens/flashcard-form/FlashcardFormToggleBar';
import { useKeyboardHeight, useMarkdownEditor } from '@/components/ui/RichTextEditor';
import { getColors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppAlert } from '@/hooks/useAppAlert';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { useFlashcardFormState } from '@/components/screens/flashcard-form/useFlashcardFormState';

type FlashcardFormScreenProps = {
  mode: 'new' | 'edit';
  deckId?: number;
  flashcardId?: number;
};

export function FlashcardFormScreen({ mode, deckId, flashcardId }: FlashcardFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const isIos = Platform.OS === 'ios';
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
    shouldShowSave,
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
  const toolbarBottomOffset = isIos ? insets.bottom + TOOLBAR_KEYBOARD_GAP_IOS : 8;
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

  const bottomOverlayOffset = isIos
    ? keyboardHeight > 0
      ? toolbarKeyboardGap
      : toolbarBottomOffset
    : keyboardHeight > 0
      ? keyboardHeight + toolbarKeyboardGap
      : toolbarBottomOffset;
  const editorBottomPadding = showToolbar
    ? bottomOverlayOffset + toolbarHeight + FORM_CONTENT_PADDING
    : Math.max(insets.bottom, FORM_CONTENT_BOTTOM_PADDING);
  const scrollContentBottomPadding = Math.max(insets.bottom, FORM_CONTENT_BOTTOM_PADDING);
  const keyboardDismissMode = isIos ? 'interactive' : 'on-drag';

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
        bg="$background"
        justifyContent="center"
        alignItems="center"
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
  const screenTitle = mode === 'new' ? t('flashcard.createTitle') : t('flashcard.editTitle');
  const headerActions = canDelete
    ? [
        createHeaderAction({
          icon: 'delete-outline',
          label: t('common.delete'),
          onPress: handleDelete,
          testID: 'flashcard-form-delete-button',
          display: 'icon',
          color: colors.destructiveMuted,
          showLabelOnLargeScreen: true,
        }),
      ]
    : [];
  const secondarySectionLabel = isMultipleChoice ? t('flashcard.options') : t('flashcard.answer');
  const screenContent = (
    <View flex={1} bg="$background" testID="flashcard-form-screen">
      <Header title={screenTitle} isModal actions={headerActions} />
      <View flex={1} minHeight={0}>
        <FlashcardFormToggleBar
          colors={colors}
          isLargeScreen={isLargeScreen}
          isMultipleChoice={isMultipleChoice}
          isSecondarySectionActive={isSecondarySectionActive}
          questionHasError={questionHasError}
          secondarySectionHasError={secondarySectionHasError}
          standardTypeLabel={t('flashcard.typeStandard')}
          multipleChoiceTypeLabel={t('flashcard.typeMultipleChoice')}
          questionLabel={t('flashcard.question')}
          secondarySectionLabel={secondarySectionLabel}
          onCardTypeToggle={handleCardTypeToggle}
          onSectionToggle={handleSectionToggle}
        />

        {(showQuestionEditor || showAnswerEditor) && (
          <FlashcardEditorSection
            isIos={isIos}
            questionEditor={questionEditor}
            answerEditor={answerEditor}
            questionError={questionError}
            answerError={answerError}
            questionPlaceholder={t('flashcard.questionPlaceholder')}
            answerPlaceholder={t('flashcard.answerPlaceholder')}
            isMarkdownEditorFocused={isMarkdownEditorFocused}
            showQuestionEditor={showQuestionEditor}
            showAnswerEditor={showAnswerEditor}
            showSave={shouldShowSave}
            saveLabel={t('common.save')}
            editorBottomPadding={editorBottomPadding}
            onSave={handleSave}
            onEditorFocus={handleEditorFocus}
            onEditorBlur={handleEditorBlur}
          />
        )}

        {isMultipleChoice && activeSection === 'options' && (
          <FlashcardOptionsSection
            options={options}
            colors={colors}
            addOptionLabel={t('flashcard.addOption')}
            getOptionPlaceholder={(index) => t('flashcard.optionPlaceholder', { index: index + 1 })}
            optionsError={optionsError}
            saveLabel={t('common.save')}
            showSave={shouldShowSave}
            scrollContentBottomPadding={scrollContentBottomPadding}
            keyboardDismissMode={keyboardDismissMode}
            onAddOption={handleAddOption}
            onOptionTextChange={handleOptionTextChange}
            onSetCorrectOption={handleSetCorrectOption}
            onRemoveOption={handleRemoveOption}
            onSave={handleSave}
          />
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

  if (!isIos) {
    return screenContent;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background.val }}
      behavior="padding"
      keyboardVerticalOffset={toolbarHeight + toolbarKeyboardGap}
    >
      {screenContent}
    </KeyboardAvoidingView>
  );
}
