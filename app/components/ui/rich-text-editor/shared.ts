import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import type { TextInputProps } from 'react-native';
import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';

import { createSegmentComponents } from '@/components/ui/markdown-theme';
import { getColors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type RichTextEditorProps = {
  editor: MarkdownEditorHandle;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  fill?: boolean;
  contentPaddingBottom?: number;
  testID?: string;
  onContentSizeChange?: TextInputProps['onContentSizeChange'];
  inputProps?: Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'onSelectionChange' | 'multiline' | 'onContentSizeChange'
  >;
};

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardHeight;
}

export function useRichTextEditorTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const segmentComponents = useMemo(() => createSegmentComponents(colorScheme), [colorScheme]);

  return { colors, segmentComponents };
}
