import { useState, useEffect, useMemo } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { MarkdownTextInput, useMarkdownEditor } from '@domenico-esposito/react-native-markdown-editor';
import type { MarkdownEditorHandle } from '@domenico-esposito/react-native-markdown-editor';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createSegmentComponents } from '@/components/ui/markdown-theme';
import { getColors } from '@/constants/colors';

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
};

// Export hook for external use
export { useKeyboardHeight };
export { useMarkdownEditor };

export function RichTextEditor({ editor, placeholder, minHeight = 150 }: RichTextEditorProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
	const segmentComponents = useMemo(() => createSegmentComponents(colorScheme), [colorScheme]);

	return (
		<View backgroundColor="transparent" minHeight={minHeight} flex={1}>
			<MarkdownTextInput
				editor={editor}
				placeholder={placeholder}
				placeholderTextColor={colors.placeholder}
				style={styles.inputContainer}
				segmentComponents={segmentComponents}
				autoCorrect={false}
				textInputStyle={{
					color: colors.textInput,
					fontSize: 16,
					minHeight: minHeight - 24,
					paddingHorizontal: 0,
					paddingVertical: 0,
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		backgroundColor: 'transparent',
		borderWidth: 0,
		borderColor: 'transparent',
		padding: 0,
	},
});
