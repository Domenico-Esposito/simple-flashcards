import { RouteHead } from '@/components/seo/RouteHead';
import { SettingsScreen } from '@/components/screens';

export default function SettingsRoute() {
  return (
    <>
      <RouteHead noIndex title="Settings" />
      <SettingsScreen />
    </>
  );
}
