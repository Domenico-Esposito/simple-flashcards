import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { FlashcardFormScreen } from '@/components/screens/FlashcardFormScreen';

export default function NewFlashcardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="New Flashcard" />
      <FlashcardFormScreen mode="new" deckId={parseInt(id, 10)} />
    </>
  );
}
