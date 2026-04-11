import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';
import type { LayoutChangeEvent } from 'react-native';
import { YStack } from 'tamagui';

import { FormErrorText } from '@/components/ui/FormErrorText';
import { RichTextEditorFixedHeight } from '@/components/ui/RichTextEditorFixedHeight';

type MarkdownEditorFieldProps = {
  editor: MarkdownEditorHandle;
  placeholder: string;
  testID: string;
  error?: string;
  fillAvailableSpace?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function MarkdownEditorField({
  editor,
  placeholder,
  testID,
  error,
  fillAvailableSpace = false,
  onFocus,
  onBlur,
  onLayout,
}: MarkdownEditorFieldProps) {
  return (
    <YStack
      gap="$1"
      onLayout={onLayout}
      flex={fillAvailableSpace ? 1 : undefined}
      minHeight={fillAvailableSpace ? 0 : undefined}
    >
      <RichTextEditorFixedHeight
        editor={editor}
        placeholder={placeholder}
        testID={testID}
        fill={fillAvailableSpace}
        inputProps={{
          onFocus,
          onBlur,
          scrollEnabled: true,
        }}
      />
      <FormErrorText message={error} />
    </YStack>
  );
}
