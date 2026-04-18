import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { QuizCompletionCard } from '@/components/quiz/QuizCompletionCard';
import { QuizAnswerFooter } from '@/components/screens/quiz/QuizAnswerFooter';
import { QuizAllEasyDialog, QuizExitDialog } from '@/components/screens/quiz/QuizDialogs';
import { getQuizStats } from '@/components/screens/quiz/getQuizStats';
import { Flashcard, DifficultyRating } from '@/types';
import { pickWeightedCard } from '@/utils';

type QuizScreenProps = {
  deckId: number;
};

export function QuizScreen({ deckId }: QuizScreenProps) {
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
  const latestQuizStateRef = useRef({
    flashcards,
    cardDifficulty,
    appendQuizCard,
  });

  useEffect(() => {
    latestQuizStateRef.current = {
      flashcards,
      cardDifficulty,
      appendQuizCard,
    };
  }, [flashcards, cardDifficulty, appendQuizCard]);

  useEffect(() => {
    let isMounted = true;
    setInitialized(false);

    const init = async () => {
      await startQuizSession(deckId);
      await loadFlashcards(deckId);

      if (isMounted) {
        setInitialized(true);
      }
    };

    void init();

    return () => {
      isMounted = false;
      void endQuizSession();
    };
  }, [deckId, startQuizSession, loadFlashcards, endQuizSession]);

  // Pick and append the first card once flashcards are loaded
  useEffect(() => {
    if (initialized && flashcards.length > 0 && shuffledFlashcards.length === 0) {
      const firstCard = pickWeightedCard(flashcards, cardDifficulty);
      appendQuizCard(firstCard);
    }
  }, [initialized, flashcards, shuffledFlashcards.length, cardDifficulty, appendQuizCard]);

  const totalAnswered = Object.keys(cardDifficulty).length;

  const handleResponse = useCallback(
    async (cardId: number, rating: DifficultyRating) => {
      setCardDifficulty(cardId, rating);
      await recordAnswer(cardId, rating);

      const updatedDifficulty = { ...cardDifficulty, [cardId]: rating };
      if (!allEasyDismissed && flashcards.length > 0) {
        const allEasy = flashcards.every((fc) => updatedDifficulty[fc.id] === 'easy');
        if (allEasy) {
          setTimeout(() => setShowAllEasyDialog(true), 300);
        }
      }
    },
    [recordAnswer, setCardDifficulty, allEasyDismissed, cardDifficulty, flashcards],
  );

  const handleRequestNextCard = useCallback(() => {
    const {
      flashcards: cards,
      cardDifficulty: difficulty,
      appendQuizCard: append,
    } = latestQuizStateRef.current;

    if (cards.length === 0) return;

    const nextCard = pickWeightedCard(cards, difficulty);
    append(nextCard);
  }, []);

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
      <QuizAnswerFooter
        cardId={currentCard.id}
        currentRating={cardDifficulty[currentCard.id]}
        onRate={handleResponse}
      />
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
        <QuizCompletionCard
          stats={getQuizStats(cardDifficulty, sessionStartTime)}
          onClose={() => router.back()}
        />
      )}

      <QuizExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onExitWithSave={handleExitWithSave}
        onExitDiscard={handleExitDiscard}
      />

      <QuizAllEasyDialog
        open={showAllEasyDialog}
        onOpenChange={setShowAllEasyDialog}
        onExit={handleAllEasyExit}
        onContinue={handleAllEasyContinue}
      />
    </>
  );
}
