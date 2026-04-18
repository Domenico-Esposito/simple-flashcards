import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';
import { Platform } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { YStack } from 'tamagui';

import { FormErrorText } from '@/components/ui/FormErrorText';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

type MarkdownEditorFieldProps = {
  editor: MarkdownEditorHandle;
  placeholder: string;
  testID: string;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  isMarkdownEditorFocused?: boolean;
};

export function MarkdownEditorField({
  editor,
  placeholder,
  testID,
  error,
  onFocus,
  onBlur,
  onLayout,
  isMarkdownEditorFocused = false,
}: MarkdownEditorFieldProps) {
  if (Platform.OS === 'ios') {
    return (
      <RichTextEditor
        editor={editor}
        placeholder={placeholder}
        testID={testID}
        inputProps={{
          onFocus,
          onBlur,
          scrollEnabled: false,
        }}
      />
    );
  }

  return (
    <YStack
      gap="$1"
      onLayout={onLayout}
      flex={isMarkdownEditorFocused ? 1 : undefined}
      minHeight={isMarkdownEditorFocused ? 0 : undefined}
    >
      <RichTextEditor
        editor={editor}
        placeholder={placeholder}
        testID={testID}
        fill={isMarkdownEditorFocused}
        inputProps={{
          onFocus,
          onBlur,
          scrollEnabled: isMarkdownEditorFocused,
        }}
      />
      <FormErrorText message={error} />
    </YStack>
  );
}
