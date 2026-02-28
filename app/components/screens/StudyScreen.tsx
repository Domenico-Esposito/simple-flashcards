import { useRouter } from 'expo-router';

import { FlashcardViewer } from '@/components/FlashcardViewer';

type StudyScreenProps = {
	deckId: number;
};

/**
 * Free-form study mode without performance tracking.
 * Uses the shared FlashcardViewer for card flip and swipe navigation.
 */
export function StudyScreen({ deckId }: StudyScreenProps) {
	const router = useRouter();

	return (
		<FlashcardViewer
			deckId={deckId}
			onExit={() => router.back()}
		/>
	);
}
