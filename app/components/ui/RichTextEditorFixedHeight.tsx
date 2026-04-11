import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { TextInputProps } from 'react-native';
import { View } from 'tamagui';
import {
  MarkdownTextInput,
  type MarkdownEditorHandle,
} from '@domenico-esposito/react-native-markdown-editor';

import { createSegmentComponents } from '@/components/ui/markdown-theme';
import { getColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FIXED_EDITOR_HEIGHT = 280;

type RichTextEditorFixedHeightProps = {
  editor: MarkdownEditorHandle;
  placeholder?: string;
  testID?: string;
  fill?: boolean;
  inputProps?: Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'onSelectionChange' | 'multiline' | 'onContentSizeChange'
  >;
};

export function RichTextEditorFixedHeight({
  editor,
  placeholder,
  testID,
  fill = false,
  inputProps,
}: RichTextEditorFixedHeightProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const segmentComponents = useMemo(() => createSegmentComponents(colorScheme), [colorScheme]);

  return (
    <View
      backgroundColor="transparent"
      height={fill ? undefined : FIXED_EDITOR_HEIGHT}
      flex={fill ? 1 : undefined}
      minHeight={fill ? 0 : undefined}
      flexShrink={0}
    >
      <MarkdownTextInput
        editor={editor}
        testID={testID}
        accessibilityLabel={testID}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        {...inputProps}
        style={styles.inputContainer}
        segmentComponents={segmentComponents}
        autoCorrect={false}
        textInputStyle={{
          color: colors.textInput,
          fontSize: 16,
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
  },
});
