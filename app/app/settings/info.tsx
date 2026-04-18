import { RouteHead } from '@/components/seo/RouteHead';
import { InfoScreen } from '@/components/screens';

export default function InfoRoute() {
  return (
    <>
      <RouteHead
        title="About"
        description="Learn more about Flashcards, the app built with React Native and Expo."
        canonicalPath="/settings/info"
      />
      <InfoScreen />
    </>
  );
}
