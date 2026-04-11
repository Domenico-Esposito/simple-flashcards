import { RouteHead } from '@/components/seo/RouteHead';
import { ResetDataScreen } from '@/components/screens';

export default function ResetDataRoute() {
  return (
    <>
      <RouteHead noIndex title="Reset Data" />
      <ResetDataScreen />
    </>
  );
}
