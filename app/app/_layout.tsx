import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TamaguiProvider, Theme } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFlashcardsStore } from '@/store/flashcards';
import config from '../tamagui.config';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const theme = colorScheme === 'dark' ? 'dark' : 'light';
	const [isReady, setIsReady] = useState(false);
	const initialize = useFlashcardsStore((state) => state.initialize);

	useEffect(() => {
		initialize().then(() => setIsReady(true));
	}, [initialize]);

	if (!isReady) {
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
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(tabs)" />
							<Stack.Screen
								name="flashcard-edit/[flashcardId]"
								options={{
									presentation: 'modal',
									gestureEnabled: true,
									animation: 'slide_from_bottom',
								}}
							/>
							<Stack.Screen
								name="read-more/[type]"
								options={{
									presentation: 'modal',
									gestureEnabled: true,
									animation: 'slide_from_bottom',
								}}
							/>
						</Stack>
						<StatusBar style="auto" />
					</ThemeProvider>
				</PortalProvider>
			</Theme>
		</TamaguiProvider>
	);
}
