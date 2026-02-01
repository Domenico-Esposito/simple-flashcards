import { useEffect, useState, useCallback, useRef } from 'react';
import { Dimensions, Pressable, LayoutChangeEvent } from 'react-native';
import { Text, View, YStack, Button } from 'tamagui';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import { useFlashcardsStore } from '@/store/flashcards';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HtmlContent } from '@/components/ui/HtmlContent';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const CARD_HORIZONTAL_MARGIN = 12;

type StudyScreenProps = {
	deckId: number;
};

/**
 * StudyScreen - Similar to QuizScreen but without statistics tracking and response buttons.
 * Used for free-form study/review without any performance tracking.
 */
export function StudyScreen({ deckId }: StudyScreenProps) {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const colorScheme = useColorScheme();

	const { shuffledFlashcards, loadFlashcardsForQuiz } = useFlashcardsStore();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [showAnswer, setShowAnswer] = useState(false);

	const [layoutHeight, setLayoutHeight] = useState(0);
	const [questionContentHeight, setQuestionContentHeight] = useState(0);
	const [answerContentHeight, setAnswerContentHeight] = useState(0);

	const isQuestionOverflow = questionContentHeight > layoutHeight;
	const isAnswerOverflow = answerContentHeight > layoutHeight;

	// Refs to avoid stale closures in gesture handler
	const currentIndexRef = useRef(currentIndex);
	const shuffledCardsRef = useRef(shuffledFlashcards);

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
		// No quiz session tracking in study mode
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
					<Pressable onPress={() => router.back()} style={{ padding: 8 }}>
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

				{/* Card area wrapper - no response buttons in study mode */}
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
								<View width="100%" height="100%" justifyContent="center" paddingHorizontal="$6">
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
										<View position="absolute" bottom={16} left={0} right={0} alignItems="center" pointerEvents="box-none">
											<GestureDetector gesture={answerReadMoreTap}>
												<View>
													<Button size="$3" theme="active" borderRadius="$10" pointerEvents="none">
														Leggi tutto
													</Button>
												</View>
											</GestureDetector>
										</View>
									)}
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
			</View>
		</GestureHandlerRootView>
	);
}
