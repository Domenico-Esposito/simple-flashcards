import { DeckFormScreen } from './DeckFormScreen';

type EditDeckScreenProps = {
	deckId: number;
};

export function EditDeckScreen({ deckId }: EditDeckScreenProps) {
	return <DeckFormScreen deckId={deckId} />;
}
