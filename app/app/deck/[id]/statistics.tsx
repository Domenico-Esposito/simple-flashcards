import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RouteHead } from '@/components/seo/RouteHead';
import { StatisticsContent } from '@/components/screens/StatisticsContent';

export default function DeckStatisticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <>
      <RouteHead noIndex title="Deck Statistics" />
      <StatisticsContent deckId={parseInt(id, 10)} title={t('deck.statistics')} showBackButton />
    </>
  );
}
