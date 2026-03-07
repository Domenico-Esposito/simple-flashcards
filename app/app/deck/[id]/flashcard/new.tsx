import { useLocalSearchParams } from 'expo-router';
import { NewFlashcardScreen } from '@/components/screens';

export default function NewFlashcardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NewFlashcardScreen deckId={parseInt(id, 10)} />;
}
