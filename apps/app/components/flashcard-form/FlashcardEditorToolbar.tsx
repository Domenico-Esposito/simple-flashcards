import { Platform, Pressable, ScrollView as RNScrollView, View as RNView } from 'react-native';
import {
  MarkdownToolbar,
  type MarkdownToolbarButtonState,
  type MarkdownEditorHandle,
} from '@domenico-esposito/react-native-markdown-editor';
import { Text, View } from 'tamagui';

type FlashcardEditorToolbarProps = {
  editor: MarkdownEditorHandle;
  bottomOffset: number;
  doneLabel: string;
  accentColor: string;
  colors: {
    toolbarBg: string;
    toolbarActiveBg: string;
    toolbarActive: string;
    toolbarInactive: string;
  };
  onDone: () => void;
  onHeightChange: (height: number) => void;
};

export function FlashcardEditorToolbar({
  editor,
  bottomOffset,
  doneLabel,
  accentColor,
  colors,
  onDone,
  onHeightChange,
}: FlashcardEditorToolbarProps) {
  const containerStyle =
    Platform.OS === 'ios'
      ? undefined
      : {
          position: 'absolute' as const,
          bottom: bottomOffset,
          left: 0,
          right: 0,
          zIndex: 100,
        };

  return (
    <RNView
      onLayout={(event) => {
        onHeightChange(event.nativeEvent.layout.height);
      }}
      style={containerStyle}
    >
      <View
        py="$2"
        pr="$2"
        borderTopColor="$borderColor"
        style={{
          borderRadius: 16,
          backgroundColor: colors.toolbarBg,
          marginHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          keyboardShouldPersistTaps="always"
          style={{ flex: 1 }}
        >
          <MarkdownToolbar
            editor={editor}
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
          onPress={onDone}
          style={{ paddingHorizontal: 8, paddingVertical: 6, marginLeft: 8 }}
          hitSlop={8}
          testID="flashcard-form-keyboard-done-button"
          accessibilityLabel="flashcard-form-keyboard-done-button"
        >
          <Text fontWeight="600" style={{ color: accentColor }}>
            {doneLabel}
          </Text>
        </Pressable>
      </View>
    </RNView>
  );
}
