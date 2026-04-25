import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/i18n';

import { RootNavigation } from '@/components/layout/root/RootNavigation';
import { RootProviders } from '@/components/layout/root/RootProviders';
import { RootSplashScreen } from '@/components/layout/root/RootSplashScreen';
import { useRootLayoutState } from '@/hooks/useRootLayoutState';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { handleSplashScreenLayout, isLargeScreen, shouldShowSplashScreen, theme, topInset } =
    useRootLayoutState();

  if (shouldShowSplashScreen) {
    return <RootSplashScreen onLayout={handleSplashScreenLayout} />;
  }

  return (
    <RootProviders theme={theme}>
      <RootNavigation isLargeScreen={isLargeScreen} theme={theme} topInset={topInset} />
      <StatusBar style="auto" />
    </RootProviders>
  );
}
