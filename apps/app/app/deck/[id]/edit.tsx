import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { DeckFormScreen } from '@/components/screens/DeckFormScreen';

export default function EditDeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="Edit Deck" />
      <DeckFormScreen deckId={parseInt(id, 10)} />
    </>
  );
}
