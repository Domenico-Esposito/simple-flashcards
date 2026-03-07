import { useLocalSearchParams } from 'expo-router';
import { EditDeckScreen } from '@/components/screens';

export default function EditDeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditDeckScreen deckId={parseInt(id, 10)} />;
}
