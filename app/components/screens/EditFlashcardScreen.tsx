import { FlashcardFormScreen } from './FlashcardFormScreen';

type EditFlashcardScreenProps = {
	flashcardId: number;
};

export function EditFlashcardScreen({ flashcardId }: EditFlashcardScreenProps) {
	return <FlashcardFormScreen mode="edit" flashcardId={flashcardId} />;
}
