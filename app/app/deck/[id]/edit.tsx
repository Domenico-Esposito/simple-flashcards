import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { EditDeckScreen } from '@/components/screens';

export default function EditDeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="Edit Deck" />
      <EditDeckScreen deckId={parseInt(id, 10)} />
    </>
  );
}
