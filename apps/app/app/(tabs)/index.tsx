import { RouteHead } from '@/components/seo/RouteHead';
import { HomeScreen } from '@/components/screens';

export default function HomeRoute() {
  return (
    <>
      <RouteHead canonicalPath="/" />
      <HomeScreen />
    </>
  );
}
