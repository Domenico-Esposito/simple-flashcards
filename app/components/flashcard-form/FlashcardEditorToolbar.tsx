import { Pressable, ScrollView as RNScrollView, View as RNView } from 'react-native';
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
  return (
    <RNView
      onLayout={(event) => {
        onHeightChange(event.nativeEvent.layout.height);
      }}
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <View
        borderRadius="$4"
        paddingVertical="$2"
        paddingRight="$2"
        backgroundColor={colors.toolbarBg}
        borderTopColor="$borderColor"
        marginHorizontal="$4"
        flexDirection="row"
        alignItems="center"
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
          <Text color={accentColor} fontWeight="600">
            {doneLabel}
          </Text>
        </Pressable>
      </View>
    </RNView>
  );
}
