import { RouteHead } from '@/components/seo/RouteHead';
import { ResetStatsScreen } from '@/components/screens';

export default function ResetStatsRoute() {
  return (
    <>
      <RouteHead noIndex title="Reset Statistics" />
      <ResetStatsScreen />
    </>
  );
}
