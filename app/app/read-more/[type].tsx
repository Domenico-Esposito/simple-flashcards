import { useLocalSearchParams } from 'expo-router';
import { ReadMoreScreen } from '@/components/screens';

export default function ReadMoreRoute() {
	const { type, content } = useLocalSearchParams<{ type: 'question' | 'answer'; content: string }>();
	return <ReadMoreScreen type={type} content={content || ''} />;
}
