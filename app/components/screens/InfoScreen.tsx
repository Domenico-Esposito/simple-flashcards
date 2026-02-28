import { Text, View, YStack, XStack } from 'tamagui';

import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function InfoScreen() {
	const colorScheme = useColorScheme();

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Informazioni" showBackButton />

			<YStack padding="$4" gap="$6">
				<View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$2">
					<XStack justifyContent="space-between">
						<Text color="$secondary">Versione</Text>
						<Text color="$color">1.0.0</Text>
					</XStack>
					<XStack justifyContent="space-between">
						<Text color="$secondary">Sviluppato con</Text>
						<Text color="$color">React Native + Expo</Text>
					</XStack>
				</View>

				<Text fontSize={12} color="$placeholderColor" textAlign="center">
					Minimal Flashcards - Studia in modo semplice ed efficace
				</Text>

				<YStack gap="$2" marginTop="$4">
					<Text fontSize={14} color="$secondary" textAlign="center">
						Il tema segue le impostazioni di sistema.
					</Text>
					<Text fontSize={12} color="$placeholderColor" textAlign="center">
						Tema attuale: {colorScheme === 'dark' ? 'Scuro' : 'Chiaro'}
					</Text>
				</YStack>
			</YStack>
		</View>
	);
}
