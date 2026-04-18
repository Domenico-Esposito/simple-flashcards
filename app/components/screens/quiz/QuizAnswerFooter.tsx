import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View } from 'tamagui';

import { DifficultyButton } from '@/components/screens/quiz/DifficultyButton';
import type { DifficultyRating } from '@/types';

type QuizAnswerFooterProps = {
  cardId: number;
  currentRating?: DifficultyRating;
  onRate: (cardId: number, rating: DifficultyRating) => void;
};

export function QuizAnswerFooter({ cardId, currentRating, onRate }: QuizAnswerFooterProps) {
  return (
    <GestureDetector gesture={Gesture.Tap()}>
      <View position="absolute" bottom={16} left={0} right={0} paddingHorizontal="$4">
        <View flexDirection="row" gap="$2" width="100%">
          <DifficultyButton
            type="hard"
            onPress={() => onRate(cardId, 'hard')}
            currentRating={currentRating}
            testID="quiz-difficulty-hard-button"
          />
          <DifficultyButton
            type="medium"
            onPress={() => onRate(cardId, 'medium')}
            currentRating={currentRating}
            testID="quiz-difficulty-medium-button"
          />
          <DifficultyButton
            type="easy"
            onPress={() => onRate(cardId, 'easy')}
            currentRating={currentRating}
            testID="quiz-difficulty-easy-button"
          />
        </View>
      </View>
    </GestureDetector>
  );
}
