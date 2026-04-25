import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';
import { ScrollView as RNScrollView } from 'react-native';
import { View, YStack } from 'tamagui';

import { FlashcardFormActions } from '@/components/flashcard-form/FlashcardFormActions';
import { MarkdownEditorField } from '@/components/flashcard-form/MarkdownEditorField';
import type { EditorSection } from '@/components/flashcard-form/types';
import { FORM_CONTENT_PADDING } from '@/components/screens/flashcard-form/constants';

type FlashcardEditorSectionProps = {
  isIos: boolean;
  questionEditor: MarkdownEditorHandle;
  answerEditor: MarkdownEditorHandle;
  questionError?: string;
  answerError?: string;
  questionPlaceholder: string;
  answerPlaceholder: string;
  isMarkdownEditorFocused: boolean;
  showQuestionEditor: boolean;
  showAnswerEditor: boolean;
  showSave: boolean;
  saveLabel: string;
  editorBottomPadding: number;
  onSave: () => void;
  onEditorFocus: (section: EditorSection) => void;
  onEditorBlur: (section: EditorSection) => void;
};

export function FlashcardEditorSection({
  isIos,
  questionEditor,
  answerEditor,
  questionError,
  answerError,
  questionPlaceholder,
  answerPlaceholder,
  isMarkdownEditorFocused,
  showQuestionEditor,
  showAnswerEditor,
  showSave,
  saveLabel,
  editorBottomPadding,
  onSave,
  onEditorFocus,
  onEditorBlur,
}: FlashcardEditorSectionProps) {
  const editorFields = (
    <>
      {showQuestionEditor && (
        <MarkdownEditorField
          editor={questionEditor}
          placeholder={questionPlaceholder}
          testID="flashcard-form-question-input"
          error={questionError}
          onFocus={() => onEditorFocus('question')}
          onBlur={() => onEditorBlur('question')}
          isMarkdownEditorFocused={isMarkdownEditorFocused}
        />
      )}

      {showAnswerEditor && (
        <MarkdownEditorField
          editor={answerEditor}
          placeholder={answerPlaceholder}
          testID="flashcard-form-answer-input"
          error={answerError}
          onFocus={() => onEditorFocus('answer')}
          onBlur={() => onEditorBlur('answer')}
          isMarkdownEditorFocused={isMarkdownEditorFocused}
        />
      )}

      {!isMarkdownEditorFocused && (
        <FlashcardFormActions showSave={showSave} saveLabel={saveLabel} onSave={onSave} />
      )}
    </>
  );

  if (isIos) {
    return (
      <View flex={1} px="$4">
        {editorFields}
      </View>
    );
  }

  return (
    <RNScrollView
      style={{ flex: 1 }}
      scrollEnabled={!isMarkdownEditorFocused}
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustKeyboardInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode="on-drag"
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
        gap="$4"
        px="$4"
        style={isMarkdownEditorFocused ? { minHeight: 0 } : undefined}
      >
        {editorFields}
      </YStack>
    </RNScrollView>
  );
}
