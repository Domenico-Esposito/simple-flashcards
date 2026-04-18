import type { QuizStats } from '@/components/quiz/types';
import type { DifficultyRating } from '@/types';

export function getQuizStats(
  cardDifficulty: Record<number, DifficultyRating>,
  sessionStartTime: number | null,
): QuizStats {
  const ratings = Object.values(cardDifficulty);

  return {
    easyCount: ratings.filter((rating) => rating === 'easy').length,
    mediumCount: ratings.filter((rating) => rating === 'medium').length,
    hardCount: ratings.filter((rating) => rating === 'hard').length,
    totalCount: ratings.length,
    totalTimeMs: sessionStartTime ? Date.now() - sessionStartTime : 0,
  };
}
