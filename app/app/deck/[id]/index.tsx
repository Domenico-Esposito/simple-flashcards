import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { DeckDetailScreen } from '@/components/screens';

export default function DeckDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <RouteHead noIndex title="Deck" />
      <DeckDetailScreen deckId={parseInt(id, 10)} />
    </>
  );
}
