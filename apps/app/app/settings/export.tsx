import { RouteHead } from '@/components/seo/RouteHead';
import { ExportScreen } from '@/components/screens';

export default function ExportRoute() {
  return (
    <>
      <RouteHead noIndex title="Export Data" />
      <ExportScreen />
    </>
  );
}
