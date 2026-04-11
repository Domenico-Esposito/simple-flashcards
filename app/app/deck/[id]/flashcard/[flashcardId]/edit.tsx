import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { EditFlashcardScreen } from '@/components/screens';

export default function EditFlashcardRoute() {
  const { flashcardId } = useLocalSearchParams<{ flashcardId: string }>();

  return (
    <>
      <RouteHead noIndex title="Edit Flashcard" />
      <EditFlashcardScreen flashcardId={parseInt(flashcardId, 10)} />
    </>
  );
}
