import { useLocalSearchParams } from 'expo-router';
import { DeckDetailScreen } from '@/components/screens';

export default function DeckDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeckDetailScreen deckId={parseInt(id, 10)} />;
}
