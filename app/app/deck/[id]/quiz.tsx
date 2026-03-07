import { useLocalSearchParams } from 'expo-router';
import { QuizScreen } from '@/components/screens';

export default function QuizRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuizScreen deckId={parseInt(id, 10)} />;
}
