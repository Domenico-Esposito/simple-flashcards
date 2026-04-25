import { useEffect, useState, useCallback, useRef, type ReactNode, useMemo } from 'react';
import { Dimensions, Pressable, LayoutChangeEvent } from 'react-native';
import { Text, View, YStack, Button } from 'tamagui';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withDelay,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import {
  useFlashcardActions,
  useShuffledFlashcardsState,
} from '@/store/flashcards.selectors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SkiaCardShadow } from '@/components/ui/SkiaCardShadow';
import { Flashcard } from '@/types';
import { getColors } from '@/theme/colors';
import { shuffleArray } from '@/utils';
import { getFlashcardViewerTopPadding } from '@/utils/windowInsets';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const CARD_HORIZONTAL_MARGIN = 12;

type FlashcardViewerProps = {
  deckId: number;
  /** Content rendered at the bottom of the answer card (e.g. response buttons) */
  answerFooter?: (currentCard: Flashcard) => ReactNode;
  /** Extra bottom padding on the answer card to make room for answerFooter */
  answerBottomPadding?: number;
  /** Called when the close/exit button is pressed */
  onExit: () => void;
  /** Called after a forward navigation completes and all cards have been seen */
  onAllCardsSeen?: () => void;
  /** Navigation hint text shown at the bottom */
  hintText?: (showingAnswer: boolean) => string;
  /** Infinite mode: hides progress dots/counter, disables swipe back */
  infiniteMode?: boolean;
  /** Called before navigating forward in infinite mode; parent should append next card */
  onRequestNextCard?: () => void;
};

/**
 * Shared flashcard viewer with flip animation and swipe navigation.
 * Used by both QuizScreen (with response tracking) and StudyScreen (free-form study).
 */
export function FlashcardViewer({
  deckId,
  answerFooter,
  answerBottomPadding = 0,
  onExit,
  onAllCardsSeen,
  hintText,
  infiniteMode = false,
  onRequestNextCard,
}: FlashcardViewerProps) {
  const insets = useSafeAreaInsets();
  const isLargeScreen = useIsLargeScreen();
  const topPadding = getFlashcardViewerTopPadding(insets.top, isLargeScreen);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const shuffledFlashcards = useShuffledFlashcardsState();
  const { loadFlashcardsForQuiz } = useFlashcardActions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [questionLayoutHeight, setQuestionLayoutHeight] = useState(0);
  const [questionContentHeight, setQuestionContentHeight] = useState(0);
  const [mcAnswerQuestionLayoutHeight, setMcAnswerQuestionLayoutHeight] = useState(0);
  const [mcAnswerQuestionContentHeight, setMcAnswerQuestionContentHeight] = useState(0);
  const [answerLayoutHeight, setAnswerLayoutHeight] = useState(0);
  const [answerContentHeight, setAnswerContentHeight] = useState(0);

  // MC state: selected option per card
  const [mcSelections, setMcSelections] = useState<Record<number, number>>({});

  const isQuestionOverflow = questionContentHeight > questionLayoutHeight;
  const isMcAnswerQuestionOverflow = mcAnswerQuestionContentHeight > mcAnswerQuestionLayoutHeight;
  const isAnswerOverflow = answerContentHeight > answerLayoutHeight;

  // Refs to avoid stale closures in gesture handler
  const currentIndexRef = useRef(currentIndex);
  const shuffledCardsRef = useRef(shuffledFlashcards);

  // Reanimated shared values
  const translateY = useSharedValue(0);
  const flipRotation = useSharedValue(0);
  const isShowingAnswer = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    shuffledCardsRef.current = shuffledFlashcards;
  }, [shuffledFlashcards]);

  // Fade-in content when currentIndex changes
  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
  }, [currentIndex, contentOpacity]);

  useEffect(() => {
    if (!infiniteMode) {
      loadFlashcardsForQuiz(deckId);
    }
  }, [deckId, loadFlashcardsForQuiz, infiniteMode]);

  const currentCard = shuffledFlashcards[currentIndex];
  const isMC = currentCard?.type === 'multiple_choice';

  // Get shuffled options for the current card.
  // Memoized by card ID to ensure stability during interaction but refresh on navigation.
  // We use useMemo instead of state to avoid side-effects during render.
  const currentShuffledOptions = useMemo(() => {
    if (!currentCard || currentCard.type !== 'multiple_choice') return [];
    return shuffleArray([...currentCard.options]);
  }, [currentCard]);

  const mcSelectedIndex = currentCard ? mcSelections[currentCard.id] : undefined;

  // Handle MC option selection
  const handleMcSelect = useCallback(
    (optionId: number) => {
      if (!currentCard || !isMC || mcSelections[currentCard.id] !== undefined) return;
      setMcSelections((prev) => ({ ...prev, [currentCard.id]: optionId }));
      // Auto-flip to answer side after short delay
      setTimeout(() => {
        flipRotation.value = withTiming(180, { duration: 400 });
        isShowingAnswer.value = 1;
        setShowAnswer(true);
      }, 300);
    },
    [currentCard, isMC, mcSelections, flipRotation, isShowingAnswer],
  );

  // Handler to open the "Read more" modal
  const openReadMore = useCallback(
    (type: 'question' | 'answer') => {
      let content = '';
      if (type === 'question') {
        content = currentCard?.question ?? '';
      } else if (currentCard?.type === 'standard') {
        content = currentCard.answer;
      }
      router.push({
        pathname: '/read-more/[type]',
        params: { type, content },
      });
    },
    [router, currentCard],
  );

  /** Navigate to the next card */
  const goNext = useCallback(() => {
    if (infiniteMode && onRequestNextCard) {
      onRequestNextCard();
    }
    setShowAnswer(false);
    flipRotation.value = 0;
    isShowingAnswer.value = 0;

    // Clear MC selection so the card can be answered again if revisited
    const card = shuffledCardsRef.current[currentIndexRef.current];
    if (card?.type === 'multiple_choice') {
      setMcSelections((prev) => {
        const next = { ...prev };
        delete next[card.id];
        return next;
      });
    }

    if (infiniteMode) {
      // Always advance — a new card was just appended by onRequestNextCard
      setCurrentIndex((prev) => prev + 1);
    } else {
      const cardsLength = shuffledCardsRef.current.length;
      setCurrentIndex((prev) => {
        const next = prev + 1 < cardsLength ? prev + 1 : prev;
        if (next === cardsLength - 1) {
          onAllCardsSeen?.();
        }
        return next;
      });
    }
  }, [flipRotation, isShowingAnswer, onAllCardsSeen, infiniteMode, onRequestNextCard]);

  /** Navigate to the previous card */
  const goPrev = useCallback(() => {
    setShowAnswer(false);
    flipRotation.value = 0;
    isShowingAnswer.value = 0;

    // Clear MC selection so the card can be answered again
    const card = shuffledCardsRef.current[currentIndexRef.current];
    if (card?.type === 'multiple_choice') {
      setMcSelections((prev) => {
        const next = { ...prev };
        delete next[card.id];
        return next;
      });
    }

    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, [flipRotation, isShowingAnswer]);

  const resetPosition = useCallback(() => {
    translateY.value = withTiming(0, { duration: 150 });
  }, [translateY]);

  const handleSwipeEnd = useCallback(
    (translationY: number) => {
      const idx = currentIndexRef.current;
      const cardsLength = shuffledCardsRef.current.length;

      const canGoNext = infiniteMode || idx < cardsLength - 1;
      const canGoPrev = !infiniteMode && idx > 0;

      if (translationY < -SWIPE_THRESHOLD && canGoNext) {
        contentOpacity.value = withTiming(0, { duration: 100 });
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 200 }, (finished) => {
          if (finished) {
            translateY.value = 0;
            runOnJS(goNext)();
          }
        });
      } else if (translationY > SWIPE_THRESHOLD && canGoPrev) {
        contentOpacity.value = withTiming(0, { duration: 100 });
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
    [translateY, goNext, goPrev, resetPosition, contentOpacity, infiniteMode],
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

  const mcAnswerQuestionReadMoreTap = Gesture.Tap()
    .maxDistance(10)
    .onEnd(() => {
      runOnJS(openReadMore)('question');
    });

  // For MC cards, tap-to-flip is disabled until an option is selected.
  // We use a shared value to communicate this to the gesture worklet.
  const mcHasSelection = useSharedValue(0);

  useEffect(() => {
    if (currentCard && currentCard.type === 'multiple_choice') {
      mcHasSelection.value = mcSelections[currentCard.id] !== undefined ? 1 : 0;
    } else {
      mcHasSelection.value = 1; // standard cards always allow tap-to-flip
    }
  }, [currentCard, mcSelections, mcHasSelection]);

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .onEnd(() => {
      // For MC cards without a selection, ignore tap (options handle interaction)
      if (mcHasSelection.value === 0) return;

      const currentlyShowingAnswer = isShowingAnswer.value === 1;
      if (currentlyShowingAnswer) {
        flipRotation.value = withTiming(0, { duration: 400 });
        isShowingAnswer.value = 0;
        runOnJS(setShowAnswer)(false);
      } else {
        flipRotation.value = withTiming(180, { duration: 400 });
        isShowingAnswer.value = 1;
        runOnJS(setShowAnswer)(true);
      }
    });

  const panGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onUpdate((event) => {
      translateY.value = event.translationY * 0.4;
    })
    .onEnd((event) => {
      runOnJS(handleSwipeEnd)(event.translationY);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value}deg` }],
    backfaceVisibility: 'hidden' as const,
    opacity: flipRotation.value <= 90 ? 1 : 0,
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value - 180}deg` }],
    backfaceVisibility: 'hidden' as const,
    opacity: flipRotation.value > 90 ? 1 : 0,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const shadowColor = colors.shadow;
  const cardBg = colors.cardBg;
  const closeIconColor = colors.iconDefault;

  if (shuffledFlashcards.length === 0 || !currentCard) {
    return (
      <View
        flex={1}
        bg="$background"
        justifyContent="center"
        alignItems="center"
        testID="flashcard-viewer-loading"
      >
        <Text color="$secondary">{t('common.loading')}</Text>
      </View>
    );
  }

  const defaultHint = (showing: boolean) => {
    if (isMC && mcSelectedIndex === undefined) {
      return t('flashcard.selectAnswer');
    }
    const hintKey = infiniteMode ? 'flashcard.navigationHintInfinite' : 'flashcard.navigationHint';
    return t(hintKey, {
      action: showing ? t('flashcard.hideAnswer') : t('flashcard.showAnswer'),
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        flex={1}
        pt={topPadding}
        bg="$background"
        testID="flashcard-viewer-screen"
      >
        {/* Header */}
        <View
          flexDirection="row"
          px="$4"
          py="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <Pressable
            onPress={onExit}
            style={{ padding: 8 }}
            testID="flashcard-viewer-exit-button"
            accessibilityLabel="flashcard-viewer-exit-button"
          >
            <IconSymbol name="xmark" size={24} color={closeIconColor} />
          </Pressable>
          {!infiniteMode && (
            <Text color="$secondary" fontSize={14} testID="flashcard-viewer-progress">
              {currentIndex + 1}/{shuffledFlashcards.length}
            </Text>
          )}
        </View>

        {/* Card area */}
        <View
          flex={1}
          position="relative"
          overflow="visible"
          testID="flashcard-viewer-card"
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={[
                {
                  flex: 1,
                  paddingHorizontal: CARD_HORIZONTAL_MARGIN,
                  zIndex: 1,
                },
                animatedCardStyle,
              ]}
            >
              <View flex={1} position="relative" overflow="visible">
                {/* Front face — Question (+ MC options) */}
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    },
                    frontFaceStyle,
                  ]}
                >
                  <SkiaCardShadow
                    borderRadius={24}
                    backgroundColor={cardBg}
                    shadows={[{ dx: 0, dy: 5, blur: 16, color: shadowColor }]}
                    style={{ flex: 1 }}
                  >
                    <Animated.View
                      style={[{ width: '100%', height: '100%' }, animatedContentStyle]}
                    >
                      <View width="100%" height="100%" px="$6">
                        <YStack flex={1} py="$6" gap={isMC ? '$4' : undefined}>
                          <View
                            style={{
                              overflow: 'hidden',
                              flex: 1,
                              minHeight: 0,
                              justifyContent: isQuestionOverflow ? 'flex-start' : 'center',
                            }}
                            onLayout={(e: LayoutChangeEvent) =>
                              setQuestionLayoutHeight(e.nativeEvent.layout.height)
                            }
                          >
                            <YStack
                              onLayout={(e: LayoutChangeEvent) =>
                                setQuestionContentHeight(e.nativeEvent.layout.height)
                              }
                            >
                              <Text fontSize={14} color="$secondary" mb="$2">
                                {t('flashcard.questionLabel')}
                              </Text>
                              <MarkdownContent markdown={currentCard.question} />
                            </YStack>

                            {isQuestionOverflow && (
                              <View
                                pointerEvents="box-none"
                                position="absolute"
                                bottom={16}
                                left={0}
                                right={0}
                                alignItems="center"
                              >
                                <GestureDetector gesture={questionReadMoreTap}>
                                  <View
                                    testID="flashcard-viewer-question-read-more-button"
                                    accessibilityLabel="flashcard-viewer-question-read-more-button"
                                    accessible
                                  >
                                    <Button
                                      size="$3"
                                      themeInverse
                                      pointerEvents="none"
                                      borderRadius={999}
                                    >
                                      {t('flashcard.readMore')}
                                    </Button>
                                  </View>
                                </GestureDetector>
                              </View>
                            )}
                          </View>

                          {isMC && (
                            <YStack gap="$2" flexShrink={0}>
                              <Text fontSize={12} color="$secondary" mb="$1">
                                {t('flashcard.selectAnswer')}
                              </Text>
                              {currentShuffledOptions.map((option, index) => {
                                const isSelected = mcSelectedIndex === option.id;
                                return (
                                  <Pressable
                                    key={option.id}
                                    onPress={() => handleMcSelect(option.id)}
                                    disabled={mcSelectedIndex !== undefined}
                                    testID={`flashcard-viewer-option-${index}`}
                                    accessibilityLabel={`flashcard-viewer-option-${index}`}
                                  >
                                    <View
                                      px="$4"
                                      py="$3"
                                      borderWidth={2}
                                      borderColor={isSelected ? colors.accent : colors.border}
                                      backgroundColor={
                                        isSelected ? colors.accentBgTint : 'transparent'
                                      }
                                      borderRadius={12}
                                    >
                                      <Text fontSize={15} color="$color">
                                        {option.text}
                                      </Text>
                                    </View>
                                  </Pressable>
                                );
                              })}
                            </YStack>
                          )}
                        </YStack>
                      </View>
                    </Animated.View>
                  </SkiaCardShadow>
                </Animated.View>

                {/* Back face — Answer / MC results */}
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    },
                    backFaceStyle,
                  ]}
                >
                  <SkiaCardShadow
                    borderRadius={24}
                    backgroundColor={cardBg}
                    shadows={[{ dx: 0, dy: 5, blur: 16, color: shadowColor }]}
                    style={{ flex: 1 }}
                  >
                    <Animated.View
                      style={[{ width: '100%', height: '100%' }, animatedContentStyle]}
                    >
                      <View
                        width="100%"
                        height="100%"
                        px="$6"
                        pb={answerBottomPadding}
                      >
                        {isMC ? (
                          <YStack flex={1} py="$6" gap="$4">
                            <View
                              overflow="hidden"
                              flex={1}
                              minHeight={0}
                              justifyContent={
                                isMcAnswerQuestionOverflow ? 'flex-start' : 'center'
                              }
                              onLayout={(e: LayoutChangeEvent) =>
                                setMcAnswerQuestionLayoutHeight(e.nativeEvent.layout.height)
                              }
                            >
                              <YStack
                                onLayout={(e: LayoutChangeEvent) =>
                                  setMcAnswerQuestionContentHeight(e.nativeEvent.layout.height)
                                }
                              >
                                <Text fontSize={14} color="$secondary" mb="$2">
                                  {t('flashcard.questionLabel')}
                                </Text>
                                <MarkdownContent markdown={currentCard.question} />
                              </YStack>

                              {isMcAnswerQuestionOverflow && (
                                <View
                                  pointerEvents="box-none"
                                  position="absolute"
                                  bottom={16}
                                  left={0}
                                  right={0}
                                  alignItems="center"
                                >
                                  <GestureDetector gesture={mcAnswerQuestionReadMoreTap}>
                                    <View
                                      testID="flashcard-viewer-answer-question-read-more-button"
                                      accessibilityLabel="flashcard-viewer-answer-question-read-more-button"
                                      accessible
                                    >
                                      <Button
                                        size="$3"
                                        themeInverse
                                        pointerEvents="none"
                                        borderRadius={999}
                                      >
                                        {t('flashcard.readMore')}
                                      </Button>
                                    </View>
                                  </GestureDetector>
                                </View>
                              )}
                            </View>

                            <YStack gap="$2" flexShrink={0}>
                              {(() => {
                                const selectedOpt = currentShuffledOptions.find(
                                  (o) => o.id === mcSelectedIndex,
                                );
                                const isCorrectAnswer = selectedOpt?.isCorrect ?? false;
                                return (
                                  <>
                                    <Text
                                      fontSize={14}
                                      fontWeight="700"
                                      color={isCorrectAnswer ? colors.success : colors.error}
                                      mb="$1"
                                    >
                                      {isCorrectAnswer
                                        ? t('flashcard.correct')
                                        : t('flashcard.incorrect')}
                                    </Text>
                                    {currentShuffledOptions.map((option) => {
                                      const isSelected = mcSelectedIndex === option.id;
                                      let optBorderColor: string = colors.border;
                                      let bgColor: string = 'transparent';

                                      if (option.isCorrect) {
                                        optBorderColor = colors.success;
                                        bgColor = colors.successBgTint;
                                      } else if (isSelected && !option.isCorrect) {
                                        optBorderColor = colors.error;
                                        bgColor = colors.errorBgTint;
                                      }

                                      return (
                                        <View
                                          key={option.id}
                                          px="$4"
                                          py="$3"
                                          borderRadius={12}
                                          style={{
                                            borderWidth: 2,
                                            borderColor: optBorderColor,
                                            backgroundColor: bgColor,
                                          }}
                                        >
                                          <Text fontSize={15} color="$color">
                                            {option.text}
                                          </Text>
                                        </View>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </YStack>
                          </YStack>
                        ) : (
                          <View
                            overflow="hidden"
                            flex={1}
                            minHeight={0}
                            justifyContent={isAnswerOverflow ? 'flex-start' : 'center'}
                            onLayout={(e: LayoutChangeEvent) =>
                              setAnswerLayoutHeight(e.nativeEvent.layout.height)
                            }
                          >
                            <YStack
                              py="$6"
                              onLayout={(e: LayoutChangeEvent) =>
                                setAnswerContentHeight(e.nativeEvent.layout.height)
                              }
                            >
                              <Text fontSize={14} color="$secondary" mb="$2">
                                {t('flashcard.answerLabel')}
                              </Text>
                              <MarkdownContent
                                markdown={currentCard.type === 'standard' ? currentCard.answer : ''}
                              />
                            </YStack>
                            {isAnswerOverflow && (
                              <View
                                pointerEvents="box-none"
                                position="absolute"
                                bottom={16}
                                left={0}
                                right={0}
                                alignItems="center"
                              >
                                <GestureDetector gesture={answerReadMoreTap}>
                                  <View
                                    testID="flashcard-viewer-answer-read-more-button"
                                    accessibilityLabel="flashcard-viewer-answer-read-more-button"
                                    accessible
                                  >
                                    <Button
                                      size="$3"
                                      themeInverse
                                      pointerEvents="none"
                                      borderRadius={999}
                                    >
                                      {t('flashcard.readMore')}
                                    </Button>
                                  </View>
                                </GestureDetector>
                              </View>
                            )}
                          </View>
                        )}
                        {answerFooter?.(currentCard)}
                      </View>
                    </Animated.View>
                  </SkiaCardShadow>
                </Animated.View>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Navigation hints */}
        <View
          pb={insets.bottom}
          pt={16}
          bg="transparent"
          alignItems="center"
          justifyContent="center"
          zIndex={0}
        >
          <Text
            color="$placeholderColor"
            fontSize={12}
            testID="flashcard-viewer-hint"
            textAlign="center"
          >
            {(hintText ?? defaultHint)(showAnswer)}
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
