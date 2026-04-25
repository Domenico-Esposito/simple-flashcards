import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { useFlashcardsInitialization } from '@/store/flashcards.selectors';
import { getSafeTopInsetForIpadWindowControls } from '@/utils/windowInsets';

const interFonts = {
  Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
  InterLight: require('@tamagui/font-inter/otf/Inter-Light.otf'),
  InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
  InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
};

type RootTheme = 'light' | 'dark';

type RootLayoutState = {
  isLargeScreen: boolean;
  shouldShowLoadingScreen: boolean;
  theme: RootTheme;
  topInset: number;
};

export function useRootLayoutState(): RootLayoutState {
  const colorScheme = useColorScheme();
  const theme: RootTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [isStoreReady, setIsStoreReady] = useState(false);
  const initialize = useFlashcardsInitialization();
  const isLargeScreen = useIsLargeScreen();
  const insets = useSafeAreaInsets();
  const topInset = getSafeTopInsetForIpadWindowControls(insets.top);
  const [fontsLoaded] = useFonts(interFonts);

  useEffect(() => {
    initialize().then(() => setIsStoreReady(true));
  }, [initialize]);

  useEffect(() => {
    if (isStoreReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isStoreReady, fontsLoaded]);

  const isServerWebRender = Platform.OS === 'web' && typeof document === 'undefined';

  return {
    isLargeScreen,
    shouldShowLoadingScreen: (!isStoreReady || !fontsLoaded) && !isServerWebRender,
    theme,
    topInset,
  };
}
