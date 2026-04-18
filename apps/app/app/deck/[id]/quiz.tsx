import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { QuizScreen } from '@/components/screens';

export default function QuizRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="Quiz" />
      <QuizScreen deckId={parseInt(id, 10)} />
    </>
  );
}
