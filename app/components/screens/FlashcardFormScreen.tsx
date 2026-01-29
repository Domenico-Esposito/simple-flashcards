import { SetStateAction, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextArea, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';
import { getFlashcardById } from '@/utils/database';

type FlashcardFormScreenProps = {
	mode: 'new' | 'edit';
	deckId?: number;
	flashcardId?: number;
};

export function FlashcardFormScreen({ mode, deckId, flashcardId }: FlashcardFormScreenProps) {
	const router = useRouter();
	const { addFlashcard, editFlashcard, removeFlashcard } = useFlashcardsStore();

	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');
	const [questionError, setQuestionError] = useState('');
	const [answerError, setAnswerError] = useState('');
	const [isLoading, setIsLoading] = useState(mode === 'edit');
	const [activeSection, setActiveSection] = useState<'question' | 'answer'>('question');

	// Load existing flashcard data when in edit mode
	useEffect(() => {
		if (mode === 'edit' && flashcardId) {
			const loadFlashcard = async () => {
				const fc = await getFlashcardById(flashcardId);
				if (fc) {
					setQuestion(fc.question);
					setAnswer(fc.answer);
				}
				setIsLoading(false);
			};
			loadFlashcard();
		}
	}, [mode, flashcardId]);

	const handleSave = async () => {
		let hasError = false;

		if (!question.trim()) {
			setQuestionError('La domanda è obbligatoria');
			hasError = true;
		}

		if (!answer.trim()) {
			setAnswerError('La risposta è obbligatoria');
			hasError = true;
		}

		if (hasError) return;

		if (mode === 'new' && deckId !== undefined) {
			await addFlashcard(deckId, question.trim(), answer.trim());
		} else if (mode === 'edit' && flashcardId !== undefined) {
			await editFlashcard(flashcardId, question.trim(), answer.trim());
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
				<ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
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

						{activeSection === 'question' ? (
							<YStack gap="$1">
								<TextArea
									id="question"
									size="$4"
									value={question}
									onChangeText={(text: SetStateAction<string>) => {
										setQuestion(text);
										setQuestionError('');
									}}
									placeholder="Domanda"
									numberOfLines={6}
									style={{ textAlignVertical: 'top' }}
									borderWidth={0}
									backgroundColor="transparent"
									paddingHorizontal={0}
									paddingVertical={0}
									fontSize={22}
									fontWeight="700"
									color="$color"
									placeholderTextColor="$color9"
								/>
								{questionError && (
									<Text fontSize={12} color="$red10">
										{questionError}
									</Text>
								)}
							</YStack>
						) : (
							<YStack gap="$1">
								<TextArea
									id="answer"
									size="$4"
									value={answer}
									onChangeText={(text: SetStateAction<string>) => {
										setAnswer(text);
										setAnswerError('');
									}}
									placeholder="Risposta (supporta Markdown)"
									numberOfLines={10}
									style={{ textAlignVertical: 'top' }}
									borderWidth={0}
									backgroundColor="transparent"
									paddingHorizontal={0}
									paddingVertical={0}
									fontSize={14}
									color="$color"
									placeholderTextColor="$color9"
								/>
								{answerError && (
									<Text fontSize={12} color="$red10">
										{answerError}
									</Text>
								)}
								<Text fontSize={12} color="$placeholderColor">
									Puoi usare Markdown per formattare la risposta: **grassetto**, *corsivo*, `codice`, ecc.
								</Text>
							</YStack>
						)}

						<View flex={1} minHeight={20} />

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
			</View>
		</KeyboardAvoidingView>
	);
}
