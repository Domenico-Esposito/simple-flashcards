import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { NewFlashcardScreen } from '@/components/screens';

export default function NewFlashcardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="New Flashcard" />
      <NewFlashcardScreen deckId={parseInt(id, 10)} />
    </>
  );
}
