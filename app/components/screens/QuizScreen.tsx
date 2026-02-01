import { useEffect, useState, useCallback, useRef } from 'react';
import { Dimensions, Pressable, LayoutChangeEvent, Alert } from 'react-native';
import { Text, View, YStack, Button } from 'tamagui';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence, withSpring, withDelay } from 'react-native-reanimated';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useFlashcardsStore } from '@/store/flashcards';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HtmlContent } from '@/components/ui/HtmlContent';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QuizCompletionCard, QuizStats } from '@/components/QuizCompletionCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const CARD_HORIZONTAL_MARGIN = 12;

type QuizScreenProps = {
	deckId: number;
};

export function QuizScreen({ deckId }: QuizScreenProps) {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const colorScheme = useColorScheme();

	const { shuffledFlashcards, loadFlashcardsForQuiz, startQuizSession, endQuizSession, discardQuizSession, recordAnswer, sessionStartTime } = useFlashcardsStore();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [showAnswer, setShowAnswer] = useState(false);
	const [votes, setVotes] = useState<Record<number, 'correct' | 'incorrect'>>({});

	const [layoutHeight, setLayoutHeight] = useState(0);
	const [questionContentHeight, setQuestionContentHeight] = useState(0);
	const [answerContentHeight, setAnswerContentHeight] = useState(0);
	const [showCompletionCard, setShowCompletionCard] = useState(false);

	const isQuestionOverflow = questionContentHeight > layoutHeight;
	const isAnswerOverflow = answerContentHeight > layoutHeight;

	// Refs per evitare stale closures nel gesture handler
	const currentIndexRef = useRef(currentIndex);
	const shuffledCardsRef = useRef(shuffledFlashcards);

	// Aggiorna i refs quando cambiano i valori
	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		shuffledCardsRef.current = shuffledFlashcards;
	}, [shuffledFlashcards]);

	// Reanimated shared values
	const translateY = useSharedValue(0);
	const flipRotation = useSharedValue(0); // 0 = question, 180 = answer
	const isShowingAnswer = useSharedValue(0); // 0 = question, 1 = answer

	useEffect(() => {
		loadFlashcardsForQuiz(deckId);
		startQuizSession(deckId);

		return () => {
			endQuizSession();
		};
	}, [deckId, loadFlashcardsForQuiz]);

	const currentCard = shuffledFlashcards[currentIndex];

	// Handler to open the "Read more" modal
	const openReadMore = useCallback(
		(type: 'question' | 'answer') => {
			const content = type === 'question' ? currentCard?.question : currentCard?.answer;
			router.push({
				pathname: '/read-more/[type]',
				params: { type, content: content || '' },
			});
		},
		[router, currentCard],
	);

	const handleResponse = async (type: 'correct' | 'incorrect') => {
		if (!currentCard) return;
		const newVotes = { ...votes, [currentCard.id]: type };
		setVotes(newVotes);
		await recordAnswer(currentCard.id, type);

		// Check if this was the last unanswered card
		const newAnsweredCount = Object.keys(newVotes).length;
		const isNowComplete = newAnsweredCount >= shuffledFlashcards.length;

		// Wait for button animation to complete (250ms = 100ms zoom in + 150ms zoom out)
		setTimeout(() => {
			if (isNowComplete) {
				setShowCompletionCard(true);
			} else {
				goNext();
			}
		}, 250);
	};

	// Check if all flashcards have been answered
	const answeredCount = Object.keys(votes).length;
	const totalCount = shuffledFlashcards.length;
	const allAnswered = answeredCount >= totalCount;

	// Calculate quiz stats for the completion card
	const getQuizStats = useCallback((): QuizStats => {
		const correctCount = Object.values(votes).filter((v) => v === 'correct').length;
		const incorrectCount = Object.values(votes).filter((v) => v === 'incorrect').length;
		const totalTimeMs = sessionStartTime ? Date.now() - sessionStartTime : 0;
		return {
			correctCount,
			incorrectCount,
			totalCount: shuffledFlashcards.length,
			totalTimeMs,
		};
	}, [votes, sessionStartTime, shuffledFlashcards.length]);

	const handleCloseQuiz = useCallback(() => {
		router.back();
	}, [router]);

	const handleExit = useCallback(() => {
		if (allAnswered) {
			router.back();
		} else {
			const remaining = totalCount - answeredCount;
			Alert.alert(
				'Uscire dal quiz?',
				`Hai ancora ${remaining} ${remaining === 1 ? 'domanda' : 'domande'} senza risposta. Sei sicuro di voler uscire?`,
				[
					{ text: 'Annulla', style: 'cancel' },
					{
						text: 'Esci senza salvare',
						style: 'destructive',
						onPress: async () => {
							await discardQuizSession();
							router.back();
						},
					},
					{ text: 'Esci', onPress: () => router.back() },
				],
			);
		}
	}, [allAnswered, answeredCount, totalCount, router, discardQuizSession]);

	const goNext = useCallback(() => {
		setShowAnswer(false);
		flipRotation.value = 0;
		isShowingAnswer.value = 0;
		const cardsLength = shuffledCardsRef.current.length;
		setCurrentIndex((prev) => (prev + 1 < cardsLength ? prev + 1 : prev));
	}, [flipRotation, isShowingAnswer]);

	const goPrev = useCallback(() => {
		setShowAnswer(false);
		flipRotation.value = 0;
		isShowingAnswer.value = 0;
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
	}, [flipRotation, isShowingAnswer]);

	const resetPosition = useCallback(() => {
		translateY.value = withTiming(0, { duration: 150 });
	}, [translateY]);

	const handleSwipeEnd = useCallback(
		(translationY: number) => {
			const idx = currentIndexRef.current;
			const cardsLength = shuffledCardsRef.current.length;

			const canGoNext = idx < cardsLength - 1;
			const canGoPrev = idx > 0;

			if (translationY < -SWIPE_THRESHOLD && canGoNext) {
				translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 200 }, (finished) => {
					if (finished) {
						translateY.value = 0;
						runOnJS(goNext)();
					}
				});
			} else if (translationY > SWIPE_THRESHOLD && canGoPrev) {
				translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, (finished) => {
					if (finished) {
						translateY.value = 0;
						runOnJS(goPrev)();
					}
				});
			} else {
				resetPosition();
			}
		},
		[translateY, goNext, goPrev, resetPosition],
	);

	const questionReadMoreTap = Gesture.Tap()
		.maxDistance(10)
		.onEnd(() => {
			runOnJS(openReadMore)('question');
		});

	const answerReadMoreTap = Gesture.Tap()
		.maxDistance(10)
		.onEnd(() => {
			runOnJS(openReadMore)('answer');
		});

	const tapGesture = Gesture.Tap()
		.maxDistance(10)
		.onEnd(() => {
			const currentlyShowingAnswer = isShowingAnswer.value === 1;
			if (currentlyShowingAnswer) {
				// Hide answer - flip back to front
				flipRotation.value = withTiming(0, { duration: 400 });
				isShowingAnswer.value = 0;
				runOnJS(setShowAnswer)(false);
			} else {
				// Show answer - flip to back
				flipRotation.value = withTiming(180, { duration: 400 });
				isShowingAnswer.value = 1;
				runOnJS(setShowAnswer)(true);
			}
		});

	// Gesture handler for vertical swipe (card navigation)
	const panGesture = Gesture.Pan()
		.activeOffsetY([-15, 15])
		.onUpdate((event) => {
			translateY.value = event.translationY * 0.4;
		})
		.onEnd((event) => {
			runOnJS(handleSwipeEnd)(event.translationY);
		});

	// Combine both gestures
	const composedGesture = Gesture.Race(panGesture, tapGesture);

	const animatedCardStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	// Front face style (question) - visible when rotation is 0-90 degrees
	const frontFaceStyle = useAnimatedStyle(() => {
		return {
			transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value}deg` }],
			backfaceVisibility: 'hidden',
			opacity: flipRotation.value <= 90 ? 1 : 0,
		};
	});

	// Back face style (answer) - visible when rotation is 90-180 degrees
	const backFaceStyle = useAnimatedStyle(() => {
		return {
			transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value - 180}deg` }],
			backfaceVisibility: 'hidden',
			opacity: flipRotation.value > 90 ? 1 : 0,
		};
	});

	if (shuffledFlashcards.length === 0) {
		return (
			<View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
				<Text color="$secondary">Caricamento...</Text>
			</View>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View flex={1} paddingTop={insets.top} backgroundColor="$background">
				{/* Header */}
				<View flexDirection="row" alignItems="center" justifyContent="space-between" paddingHorizontal="$4" paddingVertical="$3">
					<Pressable onPress={handleExit} style={{ padding: 8 }}>
						<IconSymbol name="xmark" size={24} color={colorScheme === 'dark' ? '#FFF' : '#000'} />
					</Pressable>
					<View flexDirection="row" gap="$1" flex={1} justifyContent="center" marginHorizontal="$4">
						{shuffledFlashcards.map((_, index) => (
							<View
								key={index}
								width={8}
								height={8}
								borderRadius={4}
								backgroundColor={index === currentIndex ? (colorScheme === 'dark' ? '#60A5FA' : '#3B82F6') : colorScheme === 'dark' ? '#404040' : '#D4D4D4'}
							/>
						))}
					</View>
					<Text color="$secondary" fontSize={14}>
						{currentIndex + 1}/{shuffledFlashcards.length}
					</Text>
				</View>

				{/* Card area wrapper */}
				<View style={{ flex: 1, position: 'relative' }}>
					{/* Card content */}
					<GestureDetector gesture={composedGesture}>
						<Animated.View
							style={[
								{
									flex: 1,
									paddingHorizontal: CARD_HORIZONTAL_MARGIN,
									zIndex: 1,
								},
								animatedCardStyle,
							]}>
							{/* Card container for flip effect */}
							<View style={{ flex: 1, position: 'relative' }}>

							{/* Front face - Question */}
							<Animated.View
								style={[
									{
										position: 'absolute',
										width: '100%',
										height: '100%',
										borderRadius: 24,
										backgroundColor: colorScheme === 'dark' ? '#171717' : '#FFFFFF',
										shadowColor: colorScheme === 'dark' ? '#646464' : '#171717',
										shadowOffset: { width: 0, height: 5 },
										shadowOpacity: 0.2,
										shadowRadius: 16,
										elevation: 8,
									},
									frontFaceStyle,
								]}>
								<View
									width="100%"
									height="100%"
									justifyContent="center"
									paddingHorizontal="$6"
									onLayout={(e: LayoutChangeEvent) => setLayoutHeight(e.nativeEvent.layout.height)}>
									<View style={{ overflow: 'hidden', flex: 1, justifyContent: isQuestionOverflow ? 'flex-start' : 'center' }}>
										<YStack paddingVertical="$6" onLayout={(e: LayoutChangeEvent) => setQuestionContentHeight(e.nativeEvent.layout.height)}>
											<Text fontSize={14} color="$secondary" marginBottom="$2">
												DOMANDA
											</Text>
											<HtmlContent html={currentCard.question} />
										</YStack>
										{isQuestionOverflow && (
											<View position="absolute" bottom={16} left={0} right={0} alignItems="center" pointerEvents="box-none">
												<GestureDetector gesture={questionReadMoreTap}>
													<View>
														<Button size="$3" theme="active" borderRadius="$10" pointerEvents="none">
															Leggi tutto
														</Button>
													</View>
												</GestureDetector>
											</View>
										)}
									</View>
								</View>
							</Animated.View>

							{/* Back face - Answer */}
							<Animated.View
								style={[
									{
										position: 'absolute',
										width: '100%',
										height: '100%',
										borderRadius: 24,
										backgroundColor: colorScheme === 'dark' ? '#171717' : '#FFFFFF',
										shadowColor: colorScheme === 'dark' ? '#646464' : '#171717',
										shadowOffset: { width: 0, height: 5 },
										shadowOpacity: 0.2,
										shadowRadius: 16,
										elevation: 8,
									},
									backFaceStyle,
								]}>
								<View width="100%" height="100%" justifyContent="center" paddingHorizontal="$6" paddingBottom={72}>
									<View style={{ overflow: 'hidden', flex: 1, justifyContent: isAnswerOverflow ? 'flex-start' : 'center' }}>
										<YStack paddingVertical="$6" onLayout={(e: LayoutChangeEvent) => setAnswerContentHeight(e.nativeEvent.layout.height)}>
											<Text fontSize={14} color="$secondary" marginBottom="$2">
												RISPOSTA
											</Text>
											<HtmlContent html={currentCard.answer} />
										</YStack>
									</View>
									{/* Gradient overlay + Read more button */}
									{isAnswerOverflow && (
										<View position="absolute" bottom={70} left={0} right={0} alignItems="center" pointerEvents="box-none">
											<GestureDetector gesture={answerReadMoreTap}>
												<View>
													<Button size="$3" theme="active" borderRadius="$10" pointerEvents="none">
														Leggi tutto
													</Button>
												</View>
											</GestureDetector>
										</View>
									)}
									{/* Response Buttons - inside the card for flip animation */}
									<GestureDetector gesture={Gesture.Tap()}>
										<View position="absolute" bottom={16} left={0} right={0} paddingHorizontal="$6">
											<View flexDirection="row" gap="$3" width="100%">
												<ResponseButton type="incorrect" onPress={() => handleResponse('incorrect')} votedType={currentCard ? votes[currentCard.id] : undefined} />
												<ResponseButton type="correct" onPress={() => handleResponse('correct')} votedType={currentCard ? votes[currentCard.id] : undefined} />
											</View>
										</View>
									</GestureDetector>
								</View>
							</Animated.View>
						</View>
					</Animated.View>
				</GestureDetector>
				</View>

				{/* Navigation hints - fixed at bottom */}
				<View paddingBottom={insets.bottom} paddingTop={16} alignItems="center" justifyContent="center" backgroundColor="$transparent" zIndex={0}>
					<Text color="$placeholderColor" fontSize={12} textAlign="center">
						↑↓ cambia carta • tocco per {showAnswer ? 'nascondere' : 'mostrare'} risposta
					</Text>
				</View>

				{/* Quiz completion card */}
				{showCompletionCard && <QuizCompletionCard stats={getQuizStats()} onClose={handleCloseQuiz} />}
			</View>
		</GestureHandlerRootView>
	);
}

const ResponseButton = ({ type, onPress, votedType }: { type: 'correct' | 'incorrect'; onPress: () => void; votedType?: 'correct' | 'incorrect' }) => {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePress = () => {
		// Simple zoom in and back, call onPress after animation completes
		scale.value = withSequence(
			withTiming(1.15, { duration: 100 }),
			withTiming(1, { duration: 150 }, (finished) => {
				if (finished) {
					runOnJS(onPress)();
				}
			}),
		);
	};

	let iconName: 'check' | 'close' = 'check';
	let bgColor = '#4CD964'; // Green
	let label = 'Ricordo';

	if (type === 'incorrect') {
		iconName = 'close';
		bgColor = '#FF3B30'; // Red
		label = 'Non ricordo';
	}

	// Determine opacity based on voted state
	const opacity = !votedType ? 1 : votedType === type ? 1 : 0.5;

	return (
		<Pressable onPress={handlePress} style={{ flex: 1 }}>
			<Animated.View style={[animatedStyle, { 
				backgroundColor: bgColor, 
				borderRadius: 12, 
				height: 48, 
				flexDirection: 'row',
				alignItems: 'center', 
				justifyContent: 'center',
				gap: 8,
				elevation: 10, 
				shadowColor: bgColor, 
				shadowOffset: { width: 0, height: 4 }, 
				shadowOpacity: 0.4, 
				shadowRadius: 8,
				opacity,
			}]}>
				<MaterialIcons name={iconName} size={22} color="#FFFFFF" />
				<Text color="#FFFFFF" fontWeight="600" fontSize={15}>{label}</Text>
			</Animated.View>
		</Pressable>
	);
};
