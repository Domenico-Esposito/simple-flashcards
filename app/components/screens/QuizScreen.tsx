import { useEffect, useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Text, View, YStack, Button, AlertDialog } from 'tamagui';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence } from 'react-native-reanimated';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTranslation } from 'react-i18next';

import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { QuizCompletionCard, QuizStats } from '@/components/QuizCompletionCard';
import { SkiaCardShadow } from '@/components/ui/SkiaCardShadow';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Flashcard, DifficultyRating } from '@/types';
import { getColors } from '@/constants/colors';
import { pickWeightedCard } from '@/utils';

type QuizScreenProps = {
	deckId: number;
};

export function QuizScreen({ deckId }: QuizScreenProps) {
	const { t } = useTranslation();
	const router = useRouter();

	const {
		flashcards,
		shuffledFlashcards,
		startQuizSession,
		endQuizSession,
		discardQuizSession,
		recordAnswer,
		setCardDifficulty,
		cardDifficulty,
		sessionStartTime,
		appendQuizCard,
		loadFlashcards,
	} = useFlashcardsStore();

	const [showCompletionCard, setShowCompletionCard] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [showAllEasyDialog, setShowAllEasyDialog] = useState(false);
	const [allEasyDismissed, setAllEasyDismissed] = useState(false);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const init = async () => {
			await startQuizSession(deckId);
			await loadFlashcards(deckId);
			setInitialized(true);
		};
		init();
		return () => {
			endQuizSession();
		};
	}, [deckId]);

	// Pick and append the first card once flashcards are loaded
	useEffect(() => {
		if (initialized && flashcards.length > 0 && shuffledFlashcards.length === 0) {
			const firstCard = pickWeightedCard(flashcards, cardDifficulty);
			appendQuizCard(firstCard);
		}
	}, [initialized, flashcards.length, shuffledFlashcards.length]);

	const totalAnswered = Object.keys(cardDifficulty).length;

	const handleResponse = useCallback(
		async (cardId: number, rating: DifficultyRating) => {
			setCardDifficulty(cardId, rating);
			await recordAnswer(cardId, rating);

			// Check if all cards are rated easy (read fresh state from store)
			const { cardDifficulty: latestDifficulty, flashcards: allCards } = useFlashcardsStore.getState();
			const updatedDifficulty = { ...latestDifficulty, [cardId]: rating };
			if (!allEasyDismissed && allCards.length > 0) {
				const allEasy = allCards.every((fc) => updatedDifficulty[fc.id] === 'easy');
				if (allEasy) {
					setTimeout(() => setShowAllEasyDialog(true), 300);
				}
			}
		},
		[recordAnswer, setCardDifficulty, allEasyDismissed],
	);

	// Read latest state directly from the store to avoid stale closures
	// (the gesture/animation callback chain may hold outdated references)
	const handleRequestNextCard = useCallback(() => {
		const { flashcards: cards, cardDifficulty: difficulty, appendQuizCard: append } = useFlashcardsStore.getState();
		if (cards.length === 0) return;
		const nextCard = pickWeightedCard(cards, difficulty);
		append(nextCard);
	}, []);

	const getQuizStats = useCallback((): QuizStats => {
		const ratings = Object.values(cardDifficulty);
		const easyCount = ratings.filter((r) => r === 'easy').length;
		const mediumCount = ratings.filter((r) => r === 'medium').length;
		const hardCount = ratings.filter((r) => r === 'hard').length;
		const totalTimeMs = sessionStartTime ? Date.now() - sessionStartTime : 0;
		return { easyCount, mediumCount, hardCount, totalCount: ratings.length, totalTimeMs };
	}, [cardDifficulty, sessionStartTime]);

	const handleExit = useCallback(() => {
		if (totalAnswered === 0) {
			discardQuizSession();
			router.back();
		} else {
			setShowExitDialog(true);
		}
	}, [totalAnswered, router, discardQuizSession]);

	const handleExitWithSave = useCallback(() => {
		setShowExitDialog(false);
		setShowCompletionCard(true);
	}, []);

	const handleExitDiscard = useCallback(async () => {
		setShowExitDialog(false);
		await discardQuizSession();
		router.back();
	}, [discardQuizSession, router]);

	const handleAllEasyContinue = useCallback(() => {
		setShowAllEasyDialog(false);
		setAllEasyDismissed(true);
	}, []);

	const handleAllEasyExit = useCallback(() => {
		setShowAllEasyDialog(false);
		setShowCompletionCard(true);
	}, []);

	const renderAnswerFooter = useCallback(
		(currentCard: Flashcard) => (
			<GestureDetector gesture={Gesture.Tap()}>
				<View position="absolute" bottom={16} left={0} right={0} paddingHorizontal="$4">
					<View flexDirection="row" gap="$2" width="100%">
						<DifficultyButton
							type="hard"
							onPress={() => handleResponse(currentCard.id, 'hard')}
							currentRating={cardDifficulty[currentCard.id]}
						/>
						<DifficultyButton
							type="medium"
							onPress={() => handleResponse(currentCard.id, 'medium')}
							currentRating={cardDifficulty[currentCard.id]}
						/>
						<DifficultyButton
							type="easy"
							onPress={() => handleResponse(currentCard.id, 'easy')}
							currentRating={cardDifficulty[currentCard.id]}
						/>
					</View>
				</View>
			</GestureDetector>
		),
		[handleResponse, cardDifficulty],
	);

	return (
		<>
			<FlashcardViewer
				deckId={deckId}
				onExit={handleExit}
				answerFooter={renderAnswerFooter}
				answerBottomPadding={72}
				infiniteMode
				onRequestNextCard={handleRequestNextCard}
			/>

			{/* Quiz completion card rendered via Portal to cover the entire screen (including sidebar on large screens) */}
			{showCompletionCard && (
				<QuizCompletionCard stats={getQuizStats()} onClose={() => router.back()} />
			)}

			{/* Exit confirmation dialog */}
			<AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<AlertDialog.Portal>
					<AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
					<AlertDialog.Content key="content" bordered elevate maxWidth={340} paddingHorizontal="$5" paddingVertical="$5" borderRadius="$6">
						<YStack gap="$3">
							<AlertDialog.Title size="$6">{t('quiz.exitTitle')}</AlertDialog.Title>
							<AlertDialog.Description size="$3" color="$secondary">
								{t('quiz.exitMessage')}
							</AlertDialog.Description>
							<YStack gap="$2" paddingTop="$2">
								<AlertDialog.Cancel asChild>
									<Button borderRadius="$4">{t('common.cancel')}</Button>
								</AlertDialog.Cancel>
								<AlertDialog.Action asChild>
									<Button borderRadius="$4" onPress={handleExitWithSave}>{t('common.exit')}</Button>
								</AlertDialog.Action>
								<AlertDialog.Action asChild>
									<Button theme="red" borderRadius="$4" onPress={handleExitDiscard}>{t('quiz.exitWithoutSaving')}</Button>
								</AlertDialog.Action>
							</YStack>
						</YStack>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog>

			{/* All cards easy dialog */}
			<AlertDialog open={showAllEasyDialog} onOpenChange={setShowAllEasyDialog}>
				<AlertDialog.Portal>
					<AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
					<AlertDialog.Content key="content" bordered elevate maxWidth={340} paddingHorizontal="$5" paddingVertical="$5" borderRadius="$6">
						<YStack gap="$3">
							<AlertDialog.Title size="$6">{t('quiz.allEasyTitle')}</AlertDialog.Title>
							<AlertDialog.Description size="$3" color="$secondary">
								{t('quiz.allEasyMessage')}
							</AlertDialog.Description>
							<YStack gap="$2" paddingTop="$2">
								<AlertDialog.Action asChild>
									<Button theme="active" borderRadius="$4" onPress={handleAllEasyExit}>{t('quiz.closeButton')}</Button>
								</AlertDialog.Action>
								<AlertDialog.Cancel asChild>
									<Button borderRadius="$4" onPress={handleAllEasyContinue}>{t('quiz.continue')}</Button>
								</AlertDialog.Cancel>
							</YStack>
						</YStack>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog>
		</>
	);
}

// ---------------------------------------------------------------------------
// Difficulty button with press animation
// ---------------------------------------------------------------------------

const BUTTON_CONFIG: Record<DifficultyRating, { icon: 'sentiment-dissatisfied' | 'sentiment-neutral' | 'sentiment-satisfied'; colorKey: 'error' | 'warning' | 'success'; shadowKey: 'errorShadow' | 'warningShadow' | 'successShadow'; labelKey: string }> = {
	hard: { icon: 'sentiment-dissatisfied', colorKey: 'error', shadowKey: 'errorShadow', labelKey: 'quiz.hard' },
	medium: { icon: 'sentiment-neutral', colorKey: 'warning', shadowKey: 'warningShadow', labelKey: 'quiz.medium' },
	easy: { icon: 'sentiment-satisfied', colorKey: 'success', shadowKey: 'successShadow', labelKey: 'quiz.easy' },
};

const DifficultyButton = ({ type, onPress, currentRating }: { type: DifficultyRating; onPress: () => void; currentRating?: DifficultyRating }) => {
	const { t } = useTranslation();
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

	const config = BUTTON_CONFIG[type];
	const bgColor = colors[config.colorKey];
	const shadowColor = colors[config.shadowKey];
	const label = t(config.labelKey);
	const opacity = !currentRating ? 1 : currentRating === type ? 1 : 0.4;

	return (
		<Pressable onPress={handlePress} style={{ flex: 1 }}>
			<Animated.View style={[animatedStyle, { opacity, overflow: 'visible' }]}>
				<SkiaCardShadow
					borderRadius={12}
					backgroundColor={bgColor}
					shadows={[{ dx: 0, dy: 4, blur: 8, color: shadowColor }]}
					style={{ height: 48 }}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
						<MaterialIcons name={config.icon} size={20} color={colors.onAccent} />
						<Text color={colors.onAccent} fontWeight="600" fontSize={13}>
							{label}
						</Text>
					</View>
				</SkiaCardShadow>
			</Animated.View>
		</Pressable>
	);
};
