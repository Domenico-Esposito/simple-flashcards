import { useLocalSearchParams } from 'expo-router';
import { EditFlashcardScreen } from '@/components/screens/EditFlashcardScreen';

export default function EditFlashcardRoute() {
	const { flashcardId } = useLocalSearchParams<{ flashcardId: string }>();
	return <EditFlashcardScreen flashcardId={parseInt(flashcardId, 10)} />;
}
