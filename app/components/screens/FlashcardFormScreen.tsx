import { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Alert, Keyboard, View as RNView } from 'react-native';
import { Button, Text, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';
import { getFlashcardById } from '@/utils/database';
import { RichTextEditor, RichTextEditorRef, FormattingToolbar, useKeyboardHeight } from '@/components/ui/RichTextEditor';
import type { OnChangeStateEvent } from '@/components/ui/RichTextEditor';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FlashcardFormScreenProps = {
	mode: 'new' | 'edit';
	deckId?: number;
	flashcardId?: number;
};

export function FlashcardFormScreen({ mode, deckId, flashcardId }: FlashcardFormScreenProps) {
	const router = useRouter();
	const colorScheme = useColorScheme() ?? 'light';
	const { addFlashcard, editFlashcard, removeFlashcard } = useFlashcardsStore();
	const keyboardHeight = useKeyboardHeight();
	const insets = useSafeAreaInsets();

	const questionEditorRef = useRef<RichTextEditorRef>(null);
	const answerEditorRef = useRef<RichTextEditorRef>(null);

	const [initialQuestion, setInitialQuestion] = useState('');
	const [initialAnswer, setInitialAnswer] = useState('');
	// Track current HTML content in refs to avoid re-renders that reset cursor
	const questionHtmlRef = useRef('');
	const answerHtmlRef = useRef('');
	const [questionError, setQuestionError] = useState('');
	const [answerError, setAnswerError] = useState('');
	const [isLoading, setIsLoading] = useState(mode === 'edit');
	const [activeSection, setActiveSection] = useState<'question' | 'answer'>('question');
	const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null);

	// Get the active editor ref
	const activeEditorRef = activeSection === 'question' ? questionEditorRef : answerEditorRef;

	// Load existing flashcard data when in edit mode
	useEffect(() => {
		if (mode === 'edit' && flashcardId) {
			const loadFlashcard = async () => {
				const fc = await getFlashcardById(flashcardId);
				if (fc) {
					setInitialQuestion(fc.question);
					setInitialAnswer(fc.answer);
					questionHtmlRef.current = fc.question;
					answerHtmlRef.current = fc.answer;
				}
				setIsLoading(false);
			};
			loadFlashcard();
		}
	}, [mode, flashcardId]);

	// Helper to strip HTML tags and check if content is empty
	const isHtmlEmpty = (html: string): boolean => {
		const stripped = html.replace(/<[^>]*>/g, '').trim();
		return stripped.length === 0;
	};

	const handleSave = async () => {
		let hasError = false;

		if (isHtmlEmpty(questionHtmlRef.current)) {
			setQuestionError('La domanda è obbligatoria');
			hasError = true;
		}

		if (isHtmlEmpty(answerHtmlRef.current)) {
			setAnswerError('La risposta è obbligatoria');
			hasError = true;
		}

		if (hasError) return;

		if (mode === 'new' && deckId !== undefined) {
			await addFlashcard(deckId, questionHtmlRef.current, answerHtmlRef.current);
		} else if (mode === 'edit' && flashcardId !== undefined) {
			await editFlashcard(flashcardId, questionHtmlRef.current, answerHtmlRef.current);
		}

		router.back();
	};

	const handleDelete = () => {
		if (mode !== 'edit' || flashcardId === undefined) return;

		Alert.alert('Elimina flashcard', 'Sei sicuro di voler eliminare questa flashcard?', [
			{ text: 'Annulla', style: 'cancel' },
			{
				text: 'Elimina',
				style: 'destructive',
				onPress: async () => {
					await removeFlashcard(flashcardId);
					router.back();
				},
			},
		]);
	};

	if (isLoading) {
		return (
			<View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
				<Text color="$secondary">Caricamento...</Text>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<View flex={1} backgroundColor="$background">
				<Header title={mode === 'new' ? 'Nuova Flashcard' : 'Modifica Flashcard'} isModal />
				<ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
					<YStack gap="$4" flex={1} paddingHorizontal="$4">
						<XStack gap="$2" padding="$1" borderRadius="$4" backgroundColor="$color2">
							<Button
								size="$3"
								flex={1}
								onPress={() => setActiveSection('question')}
								borderWidth={0}
								backgroundColor={activeSection === 'question' ? '$background' : 'transparent'}
								pressStyle={{ backgroundColor: '$background' }}>
								Domanda
							</Button>
							<Button
								size="$3"
								flex={1}
								onPress={() => setActiveSection('answer')}
								borderWidth={0}
								backgroundColor={activeSection === 'answer' ? '$background' : 'transparent'}
								pressStyle={{ backgroundColor: '$background' }}>
								Risposta
							</Button>
						</XStack>

						{/* Question Editor - always mounted, hidden when not active */}
						<YStack gap="$1" flex={1} display={activeSection === 'question' ? 'flex' : 'none'}>
							<RichTextEditor
								ref={questionEditorRef}
								placeholder="Scrivi la domanda..."
								initialValue={initialQuestion}
								onChangeHtml={(html) => {
									questionHtmlRef.current = html;
									setQuestionError('');
								}}
								onChangeState={activeSection === 'question' ? setStylesState : undefined}
							/>
							{questionError && (
								<Text fontSize={12} color="$red10">
									{questionError}
								</Text>
							)}
						</YStack>

						{/* Answer Editor - always mounted, hidden when not active */}
						<YStack gap="$1" flex={1} display={activeSection === 'answer' ? 'flex' : 'none'}>
							<RichTextEditor
								ref={answerEditorRef}
								placeholder="Scrivi la risposta..."
								initialValue={initialAnswer}
								onChangeHtml={(html) => {
									answerHtmlRef.current = html;
									setAnswerError('');
								}}
								onChangeState={activeSection === 'answer' ? setStylesState : undefined}
							/>
							{answerError && (
								<Text fontSize={12} color="$red10">
									{answerError}
								</Text>
							)}
						</YStack>

						<YStack gap="$3">
							<Button size="$4" onPress={handleSave} themeInverse>
								Salva
							</Button>
							{mode === 'edit' && (
								<Button size="$4" onPress={handleDelete} theme="red">
									Elimina
								</Button>
							)}
							<Button size="$4" onPress={() => router.back()} chromeless>
								Annulla
							</Button>
						</YStack>
					</YStack>
				</ScrollView>

				{/* Floating toolbar above keyboard */}
				{keyboardHeight > 0 && (
					<RNView
						style={{
							position: 'absolute',
							bottom: insets.bottom + 15,
							left: 0,
							right: 0,
							zIndex: 100,
						}}>
						<FormattingToolbar
							stylesState={stylesState}
							onToggleBold={() => activeEditorRef.current?.toggleBold()}
							onToggleItalic={() => activeEditorRef.current?.toggleItalic()}
							onToggleUnderline={() => activeEditorRef.current?.toggleUnderline()}
							onToggleStrikeThrough={() => activeEditorRef.current?.toggleStrikeThrough()}
							onToggleInlineCode={() => activeEditorRef.current?.toggleInlineCode()}
							onToggleBlockQuote={() => activeEditorRef.current?.toggleBlockQuote()}
							onToggleUnorderedList={() => activeEditorRef.current?.toggleUnorderedList()}
							onToggleOrderedList={() => activeEditorRef.current?.toggleOrderedList()}
							onToggleH1={() => activeEditorRef.current?.toggleH1()}
							onToggleH2={() => activeEditorRef.current?.toggleH2()}
							onToggleH3={() => activeEditorRef.current?.toggleH3()}
							onToggleH4={() => activeEditorRef.current?.toggleH4()}
							onToggleH5={() => activeEditorRef.current?.toggleH5()}
							onToggleH6={() => activeEditorRef.current?.toggleH6()}
							onDismiss={() => {
								activeEditorRef.current?.blur();
								Keyboard.dismiss();
							}}
							colorScheme={colorScheme}
						/>
					</RNView>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}
