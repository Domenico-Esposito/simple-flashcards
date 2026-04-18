import { RouteHead } from '@/components/seo/RouteHead';
import { StatisticsContent } from '@/components/screens/StatisticsContent';

export default function StatisticsScreen() {
  return (
    <>
      <RouteHead noIndex title="Statistics" />
      <StatisticsContent />
    </>
  );
}
