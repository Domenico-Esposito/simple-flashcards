import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/i18n';

import { RootLoadingScreen } from '@/components/layout/root/RootLoadingScreen';
import { RootNavigation } from '@/components/layout/root/RootNavigation';
import { RootProviders } from '@/components/layout/root/RootProviders';
import { useRootLayoutState } from '@/hooks/useRootLayoutState';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isLargeScreen, shouldShowLoadingScreen, theme, topInset } = useRootLayoutState();

  if (shouldShowLoadingScreen) {
    return <RootLoadingScreen />;
  }

  return (
    <RootProviders theme={theme}>
      <RootNavigation isLargeScreen={isLargeScreen} theme={theme} topInset={topInset} />
      <StatusBar style="auto" />
    </RootProviders>
  );
}
