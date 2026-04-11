import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { StudyScreen } from '@/components/screens';

export default function StudyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouteHead noIndex title="Study" />
      <StudyScreen deckId={parseInt(id, 10)} />
    </>
  );
}
