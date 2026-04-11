import type { LayoutChangeEvent } from 'react-native';
import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';
import { YStack } from 'tamagui';

import { FormErrorText } from '@/components/ui/FormErrorText';
import { RichTextEditorFixedHeightClone } from '@/components/ui/RichTextEditorFixedHeightClone';

type MarkdownEditorFieldCloneProps = {
  editor: MarkdownEditorHandle;
  placeholder: string;
  testID: string;
  error?: string;
  fillAvailableSpace?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function MarkdownEditorFieldClone({
  editor,
  placeholder,
  testID,
  error,
  fillAvailableSpace = false,
  onFocus,
  onBlur,
  onLayout,
}: MarkdownEditorFieldCloneProps) {
  return (
    <YStack
      gap="$1"
      onLayout={onLayout}
      flex={fillAvailableSpace ? 1 : undefined}
      minHeight={fillAvailableSpace ? 0 : undefined}
    >
      <RichTextEditorFixedHeightClone
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
