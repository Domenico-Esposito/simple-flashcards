import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FormErrorText } from '@/components/ui/FormErrorText';
import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';
import type { LayoutChangeEvent } from 'react-native';
import { YStack } from 'tamagui';

type MarkdownEditorFieldProps = {
  editor: MarkdownEditorHandle;
  placeholder: string;
  testID: string;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function MarkdownEditorField({
  editor,
  placeholder,
  testID,
  error,
  onFocus,
  onBlur,
  onLayout,
}: MarkdownEditorFieldProps) {
  return (
    <YStack gap="$1" onLayout={onLayout}>
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
      <FormErrorText message={error} />
    </YStack>
  );
}
