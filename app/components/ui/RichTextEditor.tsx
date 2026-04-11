import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Keyboard, Platform, StyleSheet, Text as RNText } from 'react-native';
import type {
  LayoutChangeEvent,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { View } from 'tamagui';
import {
  MarkdownTextInput,
  useMarkdownEditor,
} from '@domenico-esposito/react-native-markdown-editor';
import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createSegmentComponents } from '@/components/ui/markdown-theme';
import { getColors } from '@/constants/colors';

const IOS_SHRINK_SETTLE_DELAY_MS = 100;
const IOS_WRAP_BOUNCE_GUARD_DELAY_MS = 250;
const EDITOR_CHROME_HEIGHT = 2;
const EDITOR_TRAILING_NEWLINE_SPACER = '\u200B';
const RICH_TEXT_EDITOR_DEBUG = __DEV__;

function clampEditorHeight(height: number, minHeight: number, maxHeight?: number) {
  const boundedHeight = Math.max(height, minHeight);
  return maxHeight == null ? boundedHeight : Math.min(boundedHeight, maxHeight);
}

function logRichTextEditorDebug(message: string, payload: Record<string, unknown>) {
  if (RICH_TEXT_EDITOR_DEBUG) {
    console.log(`[RichTextEditor] ${message}`, payload);
  }
}

// Hook to track keyboard height
function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
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

type RichTextEditorProps = {
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

// Export hook for external use
export { useKeyboardHeight };
export { useMarkdownEditor };

export function RichTextEditor({
  editor,
  placeholder,
  minHeight = 150,
  maxHeight,
  fill = false,
  contentPaddingBottom = 0,
  testID,
  onContentSizeChange,
  inputProps,
}: RichTextEditorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const segmentComponents = useMemo(() => createSegmentComponents(colorScheme), [colorScheme]);
  const { onFocus: inputOnFocus, onBlur: inputOnBlur, ...restInputProps } = inputProps ?? {};

  const stableHeightRef = useRef(minHeight);
  const shrinkTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previousValueLengthRef = useRef(editor.value.length);
  const isFocusedRef = useRef(false);
  const [editorHeight, setEditorHeight] = useState(minHeight);

  const commitHeight = useCallback(
    (nextHeight: number) => {
      const clampedHeight = clampEditorHeight(Math.ceil(nextHeight), minHeight, maxHeight);
      if (clampedHeight === stableHeightRef.current) {
        return;
      }

      stableHeightRef.current = clampedHeight;
      setEditorHeight(clampedHeight);
      logRichTextEditorDebug('height-commit', {
        testID,
        nextHeight,
        clampedHeight,
        textLength: editor.value.length,
      });
    },
    [editor.value.length, maxHeight, minHeight, testID],
  );

  useEffect(() => {
    commitHeight(stableHeightRef.current);
  }, [commitHeight]);

  useEffect(() => {
    previousValueLengthRef.current = editor.value.length;
  }, [editor.value.length]);

  useEffect(
    () => () => {
      clearTimeout(shrinkTimerRef.current);
    },
    [],
  );

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (event) => {
      isFocusedRef.current = true;
      inputOnFocus?.(event);
    },
    [inputOnFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    (event) => {
      isFocusedRef.current = false;
      inputOnBlur?.(event);
    },
    [inputOnBlur],
  );

  const scheduleHeightCommit = useCallback(
    (nextHeight: number) => {
      const measuredHeight = nextHeight + EDITOR_CHROME_HEIGHT;

      if (Platform.OS === 'ios' && measuredHeight < stableHeightRef.current) {
        clearTimeout(shrinkTimerRef.current);
        const isPotentialWrapBounce =
          isFocusedRef.current && editor.value.length >= previousValueLengthRef.current;
        const shrinkDelay = isPotentialWrapBounce
          ? IOS_WRAP_BOUNCE_GUARD_DELAY_MS
          : IOS_SHRINK_SETTLE_DELAY_MS;

        logRichTextEditorDebug(
          isPotentialWrapBounce ? 'height-scheduled-bounce-guard' : 'height-scheduled-shrink',
          {
            testID,
            measuredHeight,
            currentHeight: stableHeightRef.current,
            textLength: editor.value.length,
            previousTextLength: previousValueLengthRef.current,
            shrinkDelay,
          },
        );
        shrinkTimerRef.current = setTimeout(() => {
          commitHeight(measuredHeight);
        }, shrinkDelay);
        return;
      }

      clearTimeout(shrinkTimerRef.current);
      logRichTextEditorDebug('height-scheduled-grow', {
        testID,
        measuredHeight,
        currentHeight: stableHeightRef.current,
        textLength: editor.value.length,
      });
      commitHeight(measuredHeight);
    },
    [commitHeight, editor.value.length, testID],
  );

  const handleContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      if (Platform.OS === 'web') {
        scheduleHeightCommit(e.nativeEvent.contentSize.height);
      }

      onContentSizeChange?.(e);
    },
    [onContentSizeChange, scheduleHeightCommit],
  );

  const handleMirrorLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (Platform.OS === 'web') {
        return;
      }

      scheduleHeightCommit(event.nativeEvent.layout.height);
    },
    [scheduleHeightCommit],
  );

  const trailingMeasureText = editor.value.endsWith('\n') ? EDITOR_TRAILING_NEWLINE_SPACER : '';

  return (
    <View
      backgroundColor="transparent"
      height={fill ? undefined : editorHeight}
      minHeight={fill ? 0 : minHeight}
      maxHeight={fill ? undefined : maxHeight}
      flex={fill ? 1 : undefined}
      flexShrink={0}
    >
      {Platform.OS !== 'web' && (
        <View pointerEvents="none" opacity={0} position="absolute" top={0} left={0} right={0}>
          <RNText
            onLayout={handleMirrorLayout}
            style={[
              styles.measurementText,
              contentPaddingBottom > 0 ? { paddingBottom: contentPaddingBottom } : undefined,
            ]}
          >
            {editor.highlightedSegments.map((segment, index) => {
              const Component = segmentComponents[segment.type];
              return (
                <Component key={index} type={segment.type} meta={segment.meta}>
                  {segment.text}
                </Component>
              );
            })}
            {trailingMeasureText}
          </RNText>
        </View>
      )}
      <MarkdownTextInput
        editor={editor}
        testID={testID}
        accessibilityLabel={testID}
        placeholder={placeholder}
        numberOfLines={5}
        placeholderTextColor={colors.placeholder}
        {...restInputProps}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onContentSizeChange={handleContentSizeChange}
        style={styles.inputContainer}
        segmentComponents={segmentComponents}
        autoCorrect={false}
        textInputStyle={{
          color: colors.textInput,
          fontSize: 16,
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: contentPaddingBottom,
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
  measurementText: {
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
});
