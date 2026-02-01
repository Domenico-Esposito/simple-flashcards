import { useRef, useCallback, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { StyleSheet, Pressable, Keyboard, ScrollView, Platform } from 'react-native';
import { View, XStack, Text } from 'tamagui';
import { EnrichedTextInput } from 'react-native-enriched';
import type { EnrichedTextInputInstance, OnChangeStateEvent, OnChangeHtmlEvent } from 'react-native-enriched';
import type { NativeSyntheticEvent } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';

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

export type RichTextEditorRef = {
	getHtml: () => Promise<string>;
	focus: () => void;
	blur: () => void;
	getStylesState: () => OnChangeStateEvent | null;
	toggleBold: () => void;
	toggleItalic: () => void;
	toggleUnderline: () => void;
	toggleStrikeThrough: () => void;
	toggleInlineCode: () => void;
	toggleBlockQuote: () => void;
	toggleUnorderedList: () => void;
	toggleOrderedList: () => void;
	toggleH1: () => void;
	toggleH2: () => void;
	toggleH3: () => void;
	toggleH4: () => void;
	toggleH5: () => void;
	toggleH6: () => void;
};

type RichTextEditorProps = {
	placeholder?: string;
	initialValue?: string;
	onChangeHtml?: (html: string) => void;
	onChangeState?: (state: OnChangeStateEvent) => void;
	minHeight?: number;
};

type ToolbarButtonProps = {
	icon: keyof typeof MaterialIcons.glyphMap;
	isActive?: boolean;
	onPress: () => void;
	colorScheme: 'light' | 'dark';
};

function ToolbarButton({ icon, isActive, onPress, colorScheme }: ToolbarButtonProps) {
	const activeColor = colorScheme === 'dark' ? '#60A5FA' : '#3B82F6';
	const inactiveColor = colorScheme === 'dark' ? '#A3A3A3' : '#737373';
	const activeBg = colorScheme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)';

	return (
		<Pressable onPress={onPress} style={[styles.toolbarButton, isActive && { backgroundColor: activeBg }]}>
			<MaterialIcons name={icon} size={20} color={isActive ? activeColor : inactiveColor} />
		</Pressable>
	);
}

type FormattingToolbarProps = {
	stylesState: OnChangeStateEvent | null;
	onToggleBold: () => void;
	onToggleItalic: () => void;
	onToggleUnderline: () => void;
	onToggleStrikeThrough: () => void;
	onToggleInlineCode: () => void;
	onToggleBlockQuote: () => void;
	onToggleUnorderedList: () => void;
	onToggleOrderedList: () => void;
	onToggleH1: () => void;
	onToggleH2: () => void;
	onToggleH3: () => void;
	onToggleH4: () => void;
	onToggleH5: () => void;
	onToggleH6: () => void;
	onDismiss: () => void;
	colorScheme: 'light' | 'dark';
};

// Header button component with text label
type HeaderButtonProps = {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	isActive?: boolean;
	onPress: () => void;
	colorScheme: 'light' | 'dark';
};

function HeaderButton({ level, isActive, onPress, colorScheme }: HeaderButtonProps) {
	const activeColor = colorScheme === 'dark' ? '#60A5FA' : '#3B82F6';
	const inactiveColor = colorScheme === 'dark' ? '#A3A3A3' : '#737373';
	const activeBg = colorScheme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)';

	return (
		<Pressable onPress={onPress} style={[styles.toolbarButton, isActive && { backgroundColor: activeBg }]}>
			<Text style={[styles.headerButtonText, { color: isActive ? activeColor : inactiveColor }]}>H{level}</Text>
		</Pressable>
	);
}

function FormattingToolbar({
	stylesState,
	onToggleBold,
	onToggleItalic,
	onToggleUnderline,
	onToggleStrikeThrough,
	onToggleInlineCode,
	onToggleBlockQuote,
	onToggleUnorderedList,
	onToggleOrderedList,
	onToggleH1,
	onToggleH2,
	onToggleH3,
	onToggleH4,
	onToggleH5,
	onToggleH6,
	onDismiss,
	colorScheme,
}: FormattingToolbarProps) {
	return (
		<XStack borderRadius="$4" paddingVertical="$2" backgroundColor="$background" borderTopColor="$borderColor" alignItems="center" marginHorizontal="$4">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.toolbarScrollContent, { paddingHorizontal: 8 }]}
				keyboardShouldPersistTaps="always">
				<ToolbarButton icon="format-bold" isActive={stylesState?.bold?.isActive} onPress={onToggleBold} colorScheme={colorScheme} />
				<ToolbarButton icon="format-italic" isActive={stylesState?.italic?.isActive} onPress={onToggleItalic} colorScheme={colorScheme} />
				<ToolbarButton icon="format-underlined" isActive={stylesState?.underline?.isActive} onPress={onToggleUnderline} colorScheme={colorScheme} />
				<ToolbarButton icon="strikethrough-s" isActive={stylesState?.strikeThrough?.isActive} onPress={onToggleStrikeThrough} colorScheme={colorScheme} />
				<View width={1} height={20} backgroundColor="$borderColor" marginHorizontal={4} />
				<HeaderButton level={1} isActive={stylesState?.h1?.isActive} onPress={onToggleH1} colorScheme={colorScheme} />
				<HeaderButton level={2} isActive={stylesState?.h2?.isActive} onPress={onToggleH2} colorScheme={colorScheme} />
				<HeaderButton level={3} isActive={stylesState?.h3?.isActive} onPress={onToggleH3} colorScheme={colorScheme} />
				<HeaderButton level={4} isActive={stylesState?.h4?.isActive} onPress={onToggleH4} colorScheme={colorScheme} />
				<HeaderButton level={5} isActive={stylesState?.h5?.isActive} onPress={onToggleH5} colorScheme={colorScheme} />
				<HeaderButton level={6} isActive={stylesState?.h6?.isActive} onPress={onToggleH6} colorScheme={colorScheme} />
				<View width={1} height={20} backgroundColor="$borderColor" marginHorizontal={4} />
				<ToolbarButton icon="code" isActive={stylesState?.inlineCode?.isActive} onPress={onToggleInlineCode} colorScheme={colorScheme} />
				<ToolbarButton icon="format-quote" isActive={stylesState?.blockQuote?.isActive} onPress={onToggleBlockQuote} colorScheme={colorScheme} />
				<View width={1} height={20} backgroundColor="$borderColor" marginHorizontal={4} />
				<ToolbarButton icon="format-list-bulleted" isActive={stylesState?.unorderedList?.isActive} onPress={onToggleUnorderedList} colorScheme={colorScheme} />
				<ToolbarButton icon="format-list-numbered" isActive={stylesState?.orderedList?.isActive} onPress={onToggleOrderedList} colorScheme={colorScheme} />
			</ScrollView>
			<Pressable onPress={onDismiss} style={styles.doneButton} hitSlop={8}>
				<Text color={colorScheme === 'dark' ? '#60A5FA' : '#3B82F6'} fontWeight="600">
					Fatto
				</Text>
			</Pressable>
		</XStack>
	);
}

// Export toolbar for external use
export { FormattingToolbar };
export type { FormattingToolbarProps, OnChangeStateEvent };

// Export keyboard height hook
export { useKeyboardHeight };

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ placeholder, initialValue, onChangeHtml, onChangeState, minHeight = 150 }, ref) => {
	const colorScheme = useColorScheme() ?? 'light';
	const inputRef = useRef<EnrichedTextInputInstance>(null);
	const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null);

	useImperativeHandle(ref, () => ({
		getHtml: async () => {
			if (inputRef.current) {
				return await inputRef.current.getHTML();
			}
			return '';
		},
		focus: () => inputRef.current?.focus(),
		blur: () => inputRef.current?.blur(),
		getStylesState: () => stylesState,
		toggleBold: () => inputRef.current?.toggleBold(),
		toggleItalic: () => inputRef.current?.toggleItalic(),
		toggleUnderline: () => inputRef.current?.toggleUnderline(),
		toggleStrikeThrough: () => inputRef.current?.toggleStrikeThrough(),
		toggleInlineCode: () => inputRef.current?.toggleInlineCode(),
		toggleBlockQuote: () => inputRef.current?.toggleBlockQuote(),
		toggleUnorderedList: () => inputRef.current?.toggleUnorderedList(),
		toggleOrderedList: () => inputRef.current?.toggleOrderedList(),
		toggleH1: () => inputRef.current?.toggleH1(),
		toggleH2: () => inputRef.current?.toggleH2(),
		toggleH3: () => inputRef.current?.toggleH3(),
		toggleH4: () => inputRef.current?.toggleH4(),
		toggleH5: () => inputRef.current?.toggleH5(),
		toggleH6: () => inputRef.current?.toggleH6(),
	}));

	const handleChangeHtml = useCallback(
		(event: NativeSyntheticEvent<OnChangeHtmlEvent>) => {
			onChangeHtml?.(event.nativeEvent.value);
		},
		[onChangeHtml],
	);

	const handleChangeState = useCallback(
		(event: NativeSyntheticEvent<OnChangeStateEvent>) => {
			const state = event.nativeEvent;
			setStylesState(state);
			onChangeState?.(state);
		},
		[onChangeState],
	);

	return (
		<View backgroundColor="transparent" minHeight={minHeight} flex={1}>
			<EnrichedTextInput
				ref={inputRef}
				defaultValue={initialValue}
				placeholder={placeholder}
				placeholderTextColor={colorScheme === 'dark' ? '#737373' : '#A3A3A3'}
				onChangeHtml={handleChangeHtml}
				onChangeState={handleChangeState}
				style={{
					color: colorScheme === 'dark' ? '#FAFAFA' : '#171717',
					fontSize: 16,
					minHeight: minHeight - 24,
				}}
				htmlStyle={{
					code: {
						backgroundColor: colorScheme === 'dark' ? '#262626' : '#F5F5F5',
						color: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6',
					},
					blockquote: {
						borderWidth: 3,
						borderColor: colorScheme === 'dark' ? '#60A5FA' : '#3B82F6',
						gapWidth: 12,
					},
					h1: { fontSize: 28, bold: true },
					h2: { fontSize: 24, bold: true },
					h3: { fontSize: 20, bold: true },
					h4: { fontSize: 18, bold: true },
					h5: { fontSize: 15, bold: false },
					h6: { fontSize: 13, bold: false },
				}}
			/>
		</View>
	);
});

RichTextEditor.displayName = 'RichTextEditor';

const styles = StyleSheet.create({
	toolbarButton: {
		padding: 8,
		borderRadius: 6,
		marginRight: 2,
	},
	toolbarScrollContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	doneButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	headerButtonText: {
		fontSize: 14,
		fontWeight: '600',
	},
});
