import { Stack } from 'expo-router';
import { View as TView, XStack } from 'tamagui';

import { navigationColors } from '@/theme/navigation';

import { Sidebar } from './Sidebar';

type RootNavigationProps = {
  isLargeScreen: boolean;
  theme: 'light' | 'dark';
  topInset: number;
};

const modalScreenOptions = {
  presentation: 'modal' as const,
  gestureEnabled: true,
  animation: 'slide_from_bottom' as const,
};

function LargeScreenNavigation({ theme, topInset }: Omit<RootNavigationProps, 'isLargeScreen'>) {
  return (
    <XStack flex={1} testID="large-screen-navigation">
      <Sidebar />
      <TView flex={1}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: navigationColors[theme].background,
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

function MobileNavigation() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="flashcard-edit/[flashcardId]" options={modalScreenOptions} />
      <Stack.Screen name="read-more/[type]" options={modalScreenOptions} />
    </Stack>
  );
}

export function RootNavigation({ isLargeScreen, theme, topInset }: RootNavigationProps) {
  return isLargeScreen ? (
    <LargeScreenNavigation theme={theme} topInset={topInset} />
  ) : (
    <MobileNavigation />
  );
}
