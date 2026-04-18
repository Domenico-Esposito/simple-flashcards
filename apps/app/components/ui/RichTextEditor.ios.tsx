import { ScrollView, StyleSheet } from 'react-native';
import {
  MarkdownTextInput,
  useMarkdownEditor,
} from '@domenico-esposito/react-native-markdown-editor';

import {
  type RichTextEditorProps,
  useKeyboardHeight,
  useRichTextEditorTheme,
} from '@/components/ui/rich-text-editor/shared';

export { useKeyboardHeight };
export { useMarkdownEditor };

export function RichTextEditor({
  editor,
  placeholder,
  minHeight: _minHeight = 150,
  maxHeight: _maxHeight,
  fill: _fill = false,
  contentPaddingBottom: _contentPaddingBottom = 0,
  testID,
  onContentSizeChange,
  inputProps,
}: RichTextEditorProps) {
  const { colors, segmentComponents } = useRichTextEditorTheme();

  return (
    <ScrollView style={{ flex: 1 }}>
      <MarkdownTextInput
        editor={editor}
        testID={testID}
        accessibilityLabel={testID}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onFocus={inputProps?.onFocus}
        onBlur={inputProps?.onBlur}
        onContentSizeChange={onContentSizeChange}
        scrollEnabled={inputProps?.scrollEnabled ?? true}
        style={styles.inputContainer}
        segmentComponents={segmentComponents}
        textInputStyle={{
          color: colors.textInput,
          fontSize: 16,
          lineHeight: 24,
          paddingHorizontal: 0,
          paddingTop: 0,
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    overflow: 'scroll',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
  },
});
