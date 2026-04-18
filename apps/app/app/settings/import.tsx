import { RouteHead } from '@/components/seo/RouteHead';
import { ImportScreen } from '@/components/screens';

export default function ImportRoute() {
  return (
    <>
      <RouteHead noIndex title="Import Data" />
      <ImportScreen />
    </>
  );
}
