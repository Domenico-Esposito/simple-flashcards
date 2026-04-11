import { RouteHead } from '@/components/seo/RouteHead';
import { NewDeckScreen } from '@/components/screens';

export default function NewDeckRoute() {
  return (
    <>
      <RouteHead noIndex title="New Deck" />
      <NewDeckScreen />
    </>
  );
}
