import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const MINIMUM_SPLASH_DURATION_MS = 2000;

type RootTheme = 'light' | 'dark';

type RootLayoutState = {
  handleSplashScreenLayout: () => void;
  isLargeScreen: boolean;
  shouldShowSplashScreen: boolean;
  theme: RootTheme;
  topInset: number;
};

export function useRootLayoutState(): RootLayoutState {
  const colorScheme = useColorScheme();
  const theme: RootTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [hasMinimumSplashDurationElapsed, setHasMinimumSplashDurationElapsed] = useState(false);
  const initialize = useFlashcardsInitialization();
  const isLargeScreen = useIsLargeScreen();
  const insets = useSafeAreaInsets();
  const topInset = getSafeTopInsetForIpadWindowControls(insets.top);
  const [fontsLoaded] = useFonts(interFonts);
  const hasHiddenNativeSplashRef = useRef(false);
  const hasStartedSplashDurationRef = useRef(false);
  const minimumSplashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isServerWebRender = Platform.OS === 'web' && typeof document === 'undefined';

  useEffect(() => {
    let isMounted = true;

    initialize().then(() => {
      if (isMounted) {
        setIsStoreReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialize]);

  useEffect(() => {
    return () => {
      if (minimumSplashTimeoutRef.current) {
        clearTimeout(minimumSplashTimeoutRef.current);
      }
    };
  }, []);

  const handleSplashScreenLayout = useCallback(() => {
    if (!hasStartedSplashDurationRef.current) {
      hasStartedSplashDurationRef.current = true;
      minimumSplashTimeoutRef.current = setTimeout(() => {
        setHasMinimumSplashDurationElapsed(true);
      }, MINIMUM_SPLASH_DURATION_MS);
    }

    if (isServerWebRender || hasHiddenNativeSplashRef.current) {
      return;
    }

    hasHiddenNativeSplashRef.current = true;
    SplashScreen.hideAsync();
  }, [isServerWebRender]);

  const isAppReady = isStoreReady && fontsLoaded;

  return {
    handleSplashScreenLayout,
    isLargeScreen,
    shouldShowSplashScreen: !isAppReady || !hasMinimumSplashDurationElapsed,
    theme,
    topInset,
  };
}
