import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView as RNScrollView,
  View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkdownToolbar,
  type MarkdownToolbarButtonState,
} from '@domenico-esposito/react-native-markdown-editor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, Text, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { MarkdownEditorFieldClone } from '@/components/flashcard-form/MarkdownEditorFieldClone';
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
const COMPACT_TOGGLE_HEIGHT = 40;
const TOGGLE_SEGMENT_GAP = 4;
const ACTIVE_SEGMENT_WIDTH = 44;
const INACTIVE_SEGMENT_FLEX = 1;

type CompactBooleanToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accentColor: string;
  errorColor: string;
  borderColor: string;
  activeBackgroundColor: string;
  inactiveIconColor: string;
  inactiveTextColor: string;
  falseLabel: string;
  trueLabel: string;
  falseIcon: ComponentProps<typeof MaterialIcons>['name'];
  trueIcon: ComponentProps<typeof MaterialIcons>['name'];
  falseTestID: string;
  trueTestID: string;
  falseHasError?: boolean;
  trueHasError?: boolean;
  showActiveLabel?: boolean;
  equalSegmentWidths?: boolean;
};

function CompactBooleanToggle({
  value,
  onChange,
  accentColor,
  errorColor,
  borderColor,
  activeBackgroundColor,
  inactiveIconColor,
  inactiveTextColor,
  falseLabel,
  trueLabel,
  falseIcon,
  trueIcon,
  falseTestID,
  trueTestID,
  falseHasError = false,
  trueHasError = false,
  showActiveLabel = false,
  equalSegmentWidths = false,
}: CompactBooleanToggleProps) {
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);
  const thumbTranslateX = useSharedValue(0);
  const thumbWidth = useSharedValue(0);

  useEffect(() => {
    if (leftWidth === 0 || rightWidth === 0) {
      return;
    }

    const nextWidth = value ? rightWidth : leftWidth;
    const nextTranslateX = value ? leftWidth + TOGGLE_SEGMENT_GAP : 0;

    thumbWidth.value = withTiming(nextWidth, { duration: 180 });
    thumbTranslateX.value = withTiming(nextTranslateX, { duration: 180 });
  }, [leftWidth, rightWidth, thumbTranslateX, thumbWidth, value]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    if (thumbWidth.value === 0) {
      return { opacity: 0 };
    }

    return {
      opacity: 1,
      width: thumbWidth.value,
      transform: [
        {
          translateX: thumbTranslateX.value,
        },
      ],
    };
  });

  const leftActive = !value;
  const rightActive = value;
  const leftShowLabel = !leftActive || showActiveLabel;
  const rightShowLabel = !rightActive || showActiveLabel;

  return (
    <View
      flex={1}
      flexBasis={0}
      height={COMPACT_TOGGLE_HEIGHT}
      minWidth={0}
      position="relative"
      padding="$1"
      borderRadius="$10"
      backgroundColor="$color2"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 2,
            top: 2,
            bottom: 2,
            borderRadius: 999,
            backgroundColor: activeBackgroundColor,
            borderWidth: 1,
            borderColor: accentColor,
          },
          animatedThumbStyle,
        ]}
      />
      <XStack height="100%" gap={TOGGLE_SEGMENT_GAP}>
        <Pressable
          style={{
            height: '100%',
            minWidth: 0,
            position: 'relative',
            width:
              leftActive && !showActiveLabel && !equalSegmentWidths
                ? ACTIVE_SEGMENT_WIDTH
                : undefined,
            flex: equalSegmentWidths ? 1 : leftActive ? undefined : INACTIVE_SEGMENT_FLEX,
          }}
          onPress={() => onChange(false)}
          testID={falseTestID}
          accessibilityLabel={falseTestID}
          onLayout={(event) => {
            setLeftWidth(event.nativeEvent.layout.width);
          }}
        >
          <XStack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="$1.5"
            paddingHorizontal="$2"
          >
            <MaterialIcons
              name={falseIcon}
              size={16}
              color={leftActive ? accentColor : inactiveIconColor}
            />
            {leftShowLabel && (
              <Text
                flexShrink={1}
                numberOfLines={1}
                fontSize={13}
                fontWeight="700"
                color={inactiveTextColor}
              >
                {falseLabel}
              </Text>
            )}
          </XStack>
          {falseHasError && (
            <MaterialIcons
              name="error-outline"
              size={14}
              color={errorColor}
              style={{ position: 'absolute', top: 4, right: 4 }}
              testID={`${falseTestID}-error-indicator`}
              accessibilityLabel={`${falseTestID}-error-indicator`}
            />
          )}
        </Pressable>
        <Pressable
          style={{
            height: '100%',
            minWidth: 0,
            position: 'relative',
            width:
              rightActive && !showActiveLabel && !equalSegmentWidths
                ? ACTIVE_SEGMENT_WIDTH
                : undefined,
            flex: equalSegmentWidths ? 1 : rightActive ? undefined : INACTIVE_SEGMENT_FLEX,
          }}
          onPress={() => onChange(true)}
          testID={trueTestID}
          accessibilityLabel={trueTestID}
          onLayout={(event) => {
            setRightWidth(event.nativeEvent.layout.width);
          }}
        >
          <XStack
            height="100%"
            justifyContent="center"
            alignItems="center"
            gap="$1.5"
            paddingHorizontal="$2"
          >
            <MaterialIcons
              name={trueIcon}
              size={16}
              color={rightActive ? accentColor : inactiveIconColor}
            />
            {rightShowLabel && (
              <Text
                flexShrink={1}
                numberOfLines={1}
                fontSize={13}
                fontWeight="700"
                color={inactiveTextColor}
              >
                {trueLabel}
              </Text>
            )}
          </XStack>
          {trueHasError && (
            <MaterialIcons
              name="error-outline"
              size={14}
              color={errorColor}
              style={{ position: 'absolute', top: 4, right: 4 }}
              testID={`${trueTestID}-error-indicator`}
              accessibilityLabel={`${trueTestID}-error-indicator`}
            />
          )}
        </Pressable>
      </XStack>
    </View>
  );
}

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

  const renderFormActions = () => (
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
      {canDelete && (
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
  );

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
              borderColor={colors.border}
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
              borderColor={colors.border}
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
          <YStack
            flex={1}
            minHeight={0}
            gap="$4"
            paddingHorizontal="$4"
            paddingTop="$4"
            paddingBottom={editorBottomPadding}
          >
            {showQuestionEditor && (
              <MarkdownEditorFieldClone
                editor={questionEditor}
                placeholder={t('flashcard.questionPlaceholder')}
                testID="flashcard-form-question-input"
                error={questionError}
                fillAvailableSpace
                onFocus={() => handleEditorFocus('question')}
                onBlur={() => handleEditorBlur('question')}
              />
            )}

            {showAnswerEditor && (
              <MarkdownEditorFieldClone
                editor={answerEditor}
                placeholder={t('flashcard.answerPlaceholder')}
                testID="flashcard-form-answer-input"
                error={answerError}
                fillAvailableSpace
                onFocus={() => handleEditorFocus('answer')}
                onBlur={() => handleEditorBlur('answer')}
              />
            )}

            {!isMarkdownEditorFocused && renderFormActions()}
          </YStack>
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
              {renderFormActions()}
            </YStack>
          </RNScrollView>
        )}
      </View>
      {showToolbar && (
        <RNView
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;
            setToolbarHeight((currentHeight) =>
              Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight,
            );
          }}
          style={{
            position: 'absolute',
            bottom: bottomOverlayOffset,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <View
            borderRadius="$4"
            paddingVertical="$2"
            paddingRight="$2"
            backgroundColor={colors.toolbarBg}
            borderTopColor="$borderColor"
            marginHorizontal="$4"
            flexDirection="row"
            alignItems="center"
          >
            <RNScrollView
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
            </RNScrollView>
            <Pressable
              onPress={handleDonePress}
              style={{ paddingHorizontal: 8, paddingVertical: 6, marginLeft: 8 }}
              hitSlop={8}
              testID="flashcard-form-keyboard-done-button"
              accessibilityLabel="flashcard-form-keyboard-done-button"
            >
              <Text color={colors.accent} fontWeight="600">
                {t('common.done')}
              </Text>
            </Pressable>
          </View>
        </RNView>
      )}
      {AlertDialog}
    </View>
  );
}
