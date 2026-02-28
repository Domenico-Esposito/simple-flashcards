import { useLocalSearchParams } from 'expo-router';
import { StatisticsContent } from '@/components/screens/StatisticsContent';

export default function DeckStatisticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StatisticsContent deckId={parseInt(id, 10)} title="Statistiche Mazzo" showBackButton />;
}
