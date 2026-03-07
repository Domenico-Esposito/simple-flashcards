import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
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

import { useFlashcardsStore } from '@/store/flashcards';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HtmlContent } from '@/components/ui/HtmlContent';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SkiaCardShadow } from '@/components/ui/SkiaCardShadow';
import { Flashcard } from '@/types';
import { getColors } from '@/constants/colors';

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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

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

  /** Navigate to the next card */
  const goNext = useCallback(() => {
    if (infiniteMode && onRequestNextCard) {
      onRequestNextCard();
    }
    setShowAnswer(false);
    flipRotation.value = 0;
    isShowingAnswer.value = 0;

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

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .onEnd(() => {
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
  const dotActiveColor = colors.dotActive;
  const dotInactiveColor = colors.dotInactive;

  if (shuffledFlashcards.length === 0 || !currentCard) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$secondary">{t('common.loading')}</Text>
      </View>
    );
  }

  const defaultHint = (showing: boolean) =>
    t('flashcard.navigationHint', {
      action: showing ? t('flashcard.hideAnswer') : t('flashcard.showAnswer'),
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View flex={1} paddingTop={insets.top} backgroundColor="$background">
        {/* Header */}
        <View
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Pressable onPress={onExit} style={{ padding: 8 }}>
            <IconSymbol name="xmark" size={24} color={closeIconColor} />
          </Pressable>
          {!infiniteMode && (
            <Text color="$secondary" fontSize={14}>
              {currentIndex + 1}/{shuffledFlashcards.length}
            </Text>
          )}
        </View>

        {/* Card area */}
        <View style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
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
              <View style={{ flex: 1, position: 'relative', overflow: 'visible' }}>
                {/* Front face — Question */}
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
                      <View
                        width="100%"
                        height="100%"
                        justifyContent="center"
                        paddingHorizontal="$6"
                        onLayout={(e: LayoutChangeEvent) =>
                          setLayoutHeight(e.nativeEvent.layout.height)
                        }
                      >
                        <View
                          style={{
                            overflow: 'hidden',
                            flex: 1,
                            justifyContent: isQuestionOverflow ? 'flex-start' : 'center',
                          }}
                        >
                          <YStack
                            paddingVertical="$6"
                            onLayout={(e: LayoutChangeEvent) =>
                              setQuestionContentHeight(e.nativeEvent.layout.height)
                            }
                          >
                            <Text fontSize={14} color="$secondary" marginBottom="$2">
                              {t('flashcard.questionLabel')}
                            </Text>
                            <HtmlContent html={currentCard.question} />
                          </YStack>
                          {isQuestionOverflow && (
                            <View
                              position="absolute"
                              bottom={16}
                              left={0}
                              right={0}
                              alignItems="center"
                              pointerEvents="box-none"
                            >
                              <GestureDetector gesture={questionReadMoreTap}>
                                <View>
                                  <Button
                                    size="$3"
                                    theme="active"
                                    borderRadius="$10"
                                    pointerEvents="none"
                                  >
                                    {t('flashcard.readMore')}
                                  </Button>
                                </View>
                              </GestureDetector>
                            </View>
                          )}
                        </View>
                      </View>
                    </Animated.View>
                  </SkiaCardShadow>
                </Animated.View>

                {/* Back face — Answer */}
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
                        justifyContent="center"
                        paddingHorizontal="$6"
                        paddingBottom={answerBottomPadding}
                      >
                        <View
                          style={{
                            overflow: 'hidden',
                            flex: 1,
                            justifyContent: isAnswerOverflow ? 'flex-start' : 'center',
                          }}
                        >
                          <YStack
                            paddingVertical="$6"
                            onLayout={(e: LayoutChangeEvent) =>
                              setAnswerContentHeight(e.nativeEvent.layout.height)
                            }
                          >
                            <Text fontSize={14} color="$secondary" marginBottom="$2">
                              {t('flashcard.answerLabel')}
                            </Text>
                            <HtmlContent html={currentCard.answer} />
                          </YStack>
                        </View>
                        {isAnswerOverflow && (
                          <View
                            position="absolute"
                            bottom={answerBottomPadding + 16}
                            left={0}
                            right={0}
                            alignItems="center"
                            pointerEvents="box-none"
                          >
                            <GestureDetector gesture={answerReadMoreTap}>
                              <View>
                                <Button
                                  size="$3"
                                  theme="active"
                                  borderRadius="$10"
                                  pointerEvents="none"
                                >
                                  {t('flashcard.readMore')}
                                </Button>
                              </View>
                            </GestureDetector>
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
          paddingBottom={insets.bottom}
          paddingTop={16}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$transparent"
          zIndex={0}
        >
          <Text color="$placeholderColor" fontSize={12} textAlign="center">
            {(hintText ?? defaultHint)(showAnswer)}
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
