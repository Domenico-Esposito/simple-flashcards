import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TamaguiProvider, Theme } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View as TView, XStack, YStack } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import 'react-native-reanimated';
import '@/i18n';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFlashcardsStore } from '@/store/flashcards';
import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import config from '../tamagui.config';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

const modalScreenOptions = {
  presentation: 'modal' as const,
  gestureEnabled: true,
  animation: 'slide_from_bottom' as const,
};

type NavigationLayoutProps = {
  colorScheme: 'light' | 'dark';
  topInset: number;
};

/** Large screen: sidebar with content area */
function LargeScreenNavigation({ colorScheme, topInset }: NavigationLayoutProps) {
  return (
    <XStack flex={1}>
      <Sidebar />
      <TView flex={1}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].background,
              paddingTop: topInset,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="flashcard-edit/[flashcardId]" options={modalScreenOptions} />
          <Stack.Screen name="read-more/[type]" options={modalScreenOptions} />
        </Stack>
      </TView>
    </XStack>
  );
}

/** Mobile: standard stack navigation */
function MobileNavigation() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="flashcard-edit/[flashcardId]" options={modalScreenOptions} />
      <Stack.Screen name="read-more/[type]" options={modalScreenOptions} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const [isReady, setIsReady] = useState(false);
  const initialize = useFlashcardsStore((state) => state.initialize);
  const isLargeScreen = useIsLargeScreen();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterLight: require('@tamagui/font-inter/otf/Inter-Light.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    initialize().then(() => setIsReady(true));
  }, [initialize]);

  useEffect(() => {
    if (isReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <Theme name={theme}>
        <PortalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {isLargeScreen ? (
              <LargeScreenNavigation colorScheme={theme} topInset={insets.top} />
            ) : (
              <MobileNavigation />
            )}
            <StatusBar style="auto" />
          </ThemeProvider>
        </PortalProvider>
      </Theme>
    </TamaguiProvider>
  );
}

/**
 * Persistent left sidebar for large screen navigation.
 */
function Sidebar() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const insets = useSafeAreaInsets();

  const tabs = [
    { path: '/', label: t('tab.decks'), icon: 'layers' as const },
    {
      path: '/statistics',
      label: t('tab.statistics'),
      icon: 'bar-chart' as const,
    },
    { path: '/settings', label: t('tab.settings'), icon: 'settings' as const },
  ];

  return (
    <YStack
      width={200}
      backgroundColor="$backgroundStrong"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      paddingTop={insets.top + 16}
      paddingLeft={insets.left}
      paddingHorizontal="$2"
      gap="$1"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
        return (
          <Pressable key={tab.path} onPress={() => router.push(tab.path as any)}>
            <XStack
              paddingVertical="$3"
              paddingHorizontal="$3"
              borderRadius="$3"
              backgroundColor={isActive ? '$background' : 'transparent'}
              gap="$3"
              alignItems="center"
            >
              <MaterialIcons name={tab.icon} size={22} color={isActive ? tint : '#888'} />
              <Text
                fontSize={15}
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? '$color' : '$gray10'}
              >
                {tab.label}
              </Text>
            </XStack>
          </Pressable>
        );
      })}
    </YStack>
  );
}
