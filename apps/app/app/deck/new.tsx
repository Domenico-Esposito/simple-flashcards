import { RouteHead } from '@/components/seo/RouteHead';
import { DeckFormScreen } from '@/components/screens/DeckFormScreen';

export default function NewDeckRoute() {
  return (
    <>
      <RouteHead noIndex title="New Deck" />
      <DeckFormScreen />
    </>
  );
}
