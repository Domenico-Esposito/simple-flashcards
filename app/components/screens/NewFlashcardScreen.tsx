import { FlashcardFormScreen } from './FlashcardFormScreen';

type NewFlashcardScreenProps = {
  deckId: number;
};

export function NewFlashcardScreen({ deckId }: NewFlashcardScreenProps) {
  return <FlashcardFormScreen mode="new" deckId={deckId} />;
}
