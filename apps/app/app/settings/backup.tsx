import { RouteHead } from '@/components/seo/RouteHead';
import { BackupScreen } from '@/components/screens';

export default function BackupRoute() {
  return (
    <>
      <RouteHead noIndex title="Backup" />
      <BackupScreen />
    </>
  );
}
