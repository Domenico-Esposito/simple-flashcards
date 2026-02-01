import { useLocalSearchParams } from 'expo-router';
import { StudyScreen } from '@/components/screens';

export default function StudyRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <StudyScreen deckId={parseInt(id, 10)} />;
}
