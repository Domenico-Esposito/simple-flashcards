import { useEffect, useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Text, View, YStack, Button, AlertDialog } from 'tamagui';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence } from 'react-native-reanimated';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { QuizCompletionCard, QuizStats } from '@/components/QuizCompletionCard';
import { SkiaCardShadow } from '@/components/ui/SkiaCardShadow';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Flashcard } from '@/types';
import { getColors } from '@/constants/colors';

type QuizScreenProps = {
	deckId: number;
};

export function QuizScreen({ deckId }: QuizScreenProps) {
	const router = useRouter();

	const { shuffledFlashcards, startQuizSession, endQuizSession, discardQuizSession, recordAnswer, sessionStartTime } = useFlashcardsStore();

	const [votes, setVotes] = useState<Record<number, 'correct' | 'incorrect'>>({});
	const [showCompletionCard, setShowCompletionCard] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);

	useEffect(() => {
		startQuizSession(deckId);
		return () => {
			endQuizSession();
		};
	}, [deckId]);

	const answeredCount = Object.keys(votes).length;
	const totalCount = shuffledFlashcards.length;
	const allAnswered = answeredCount >= totalCount;

	const handleResponse = useCallback(
		async (cardId: number, type: 'correct' | 'incorrect') => {
			const newVotes = { ...votes, [cardId]: type };
			setVotes(newVotes);
			await recordAnswer(cardId, type);

			const isNowComplete = Object.keys(newVotes).length >= shuffledFlashcards.length;
			if (isNowComplete) {
				setTimeout(() => setShowCompletionCard(true), 250);
			}
		},
		[votes, recordAnswer, shuffledFlashcards.length],
	);

	const getQuizStats = useCallback((): QuizStats => {
		const correctCount = Object.values(votes).filter((v) => v === 'correct').length;
		const incorrectCount = Object.values(votes).filter((v) => v === 'incorrect').length;
		const totalTimeMs = sessionStartTime ? Date.now() - sessionStartTime : 0;
		return { correctCount, incorrectCount, totalCount: shuffledFlashcards.length, totalTimeMs };
	}, [votes, sessionStartTime, shuffledFlashcards.length]);

	const handleExit = useCallback(() => {
		if (allAnswered) {
			router.back();
		} else {
			setShowExitDialog(true);
		}
	}, [allAnswered, router]);

	const handleExitDiscard = useCallback(async () => {
		setShowExitDialog(false);
		await discardQuizSession();
		router.back();
	}, [discardQuizSession, router]);

	const handleExitKeep = useCallback(() => {
		setShowExitDialog(false);
		router.back();
	}, [router]);

	const renderAnswerFooter = useCallback(
		(currentCard: Flashcard) => (
			<GestureDetector gesture={Gesture.Tap()}>
				<View position="absolute" bottom={16} left={0} right={0} paddingHorizontal="$6">
					<View flexDirection="row" gap="$3" width="100%">
						<ResponseButton
							type="incorrect"
							onPress={() => handleResponse(currentCard.id, 'incorrect')}
							votedType={votes[currentCard.id]}
						/>
						<ResponseButton
							type="correct"
							onPress={() => handleResponse(currentCard.id, 'correct')}
							votedType={votes[currentCard.id]}
						/>
					</View>
				</View>
			</GestureDetector>
		),
		[handleResponse, votes],
	);

	return (
		<>
			<FlashcardViewer
				deckId={deckId}
				onExit={handleExit}
				answerFooter={renderAnswerFooter}
				answerBottomPadding={72}
				overlay={showCompletionCard ? <QuizCompletionCard stats={getQuizStats()} onClose={() => router.back()} /> : undefined}
			/>

			{/* Exit confirmation dialog */}
			<AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<AlertDialog.Portal>
					<AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
					<AlertDialog.Content key="content" bordered elevate maxWidth={340} paddingHorizontal="$5" paddingVertical="$5" borderRadius="$6">
						<YStack gap="$3">
							<AlertDialog.Title size="$6">Uscire dal quiz?</AlertDialog.Title>
							<AlertDialog.Description size="$3" color="$secondary">
								{`Hai ancora ${totalCount - answeredCount} ${totalCount - answeredCount === 1 ? 'domanda' : 'domande'} senza risposta. Sei sicuro di voler uscire?`}
							</AlertDialog.Description>
							<YStack gap="$2" paddingTop="$2">
								<AlertDialog.Cancel asChild>
									<Button borderRadius="$4">Annulla</Button>
								</AlertDialog.Cancel>
								<AlertDialog.Action asChild>
									<Button borderRadius="$4" onPress={handleExitKeep}>Esci</Button>
								</AlertDialog.Action>
								<AlertDialog.Action asChild>
									<Button theme="red" borderRadius="$4" onPress={handleExitDiscard}>Esci senza salvare</Button>
								</AlertDialog.Action>
							</YStack>
						</YStack>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog>
		</>
	);
}

// ---------------------------------------------------------------------------
// Response button with press animation
// ---------------------------------------------------------------------------

const ResponseButton = ({ type, onPress, votedType }: { type: 'correct' | 'incorrect'; onPress: () => void; votedType?: 'correct' | 'incorrect' }) => {
	const colorScheme = useColorScheme();
	const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePress = () => {
		scale.value = withSequence(
			withTiming(1.15, { duration: 100 }),
			withTiming(1, { duration: 150 }, (finished) => {
				if (finished) {
					runOnJS(onPress)();
				}
			}),
		);
	};

	const isCorrect = type === 'correct';
	const iconName = isCorrect ? 'check' : 'close';
	const bgColor = isCorrect ? colors.success : colors.error;
	const label = isCorrect ? 'Ricordo' : 'Non ricordo';
	const opacity = !votedType ? 1 : votedType === type ? 1 : 0.5;
	const shadowColor = isCorrect ? colors.successShadow : colors.errorShadow;

	return (
		<Pressable onPress={handlePress} style={{ flex: 1 }}>
			<Animated.View style={[animatedStyle, { opacity, overflow: 'visible' }]}>
				<SkiaCardShadow
					borderRadius={12}
					backgroundColor={bgColor}
					shadows={[{ dx: 0, dy: 4, blur: 8, color: shadowColor }]}
					style={{ height: 48 }}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
						<MaterialIcons name={iconName} size={22} color={colors.onAccent} />
						<Text color={colors.onAccent} fontWeight="600" fontSize={15}>
							{label}
						</Text>
					</View>
				</SkiaCardShadow>
			</Animated.View>
		</Pressable>
	);
};
