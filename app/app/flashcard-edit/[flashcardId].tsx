import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { FlashcardFormScreen } from '@/components/screens/FlashcardFormScreen';

export default function EditFlashcardRoute() {
  const { flashcardId } = useLocalSearchParams<{ flashcardId: string }>();

  return (
    <>
      <RouteHead noIndex title="Edit Flashcard" />
      <FlashcardFormScreen mode="edit" flashcardId={parseInt(flashcardId, 10)} />
    </>
  );
}
