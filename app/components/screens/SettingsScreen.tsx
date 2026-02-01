import { Pressable } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Header } from '@/components/Header';

type SettingsItem = {
	title: string;
	icon: keyof typeof MaterialIcons.glyphMap;
	route: string;
};

const settingsItems: SettingsItem[] = [
	{ title: 'Importa dati', icon: 'file-download', route: '/settings/import' },
	{ title: 'Esporta dati', icon: 'file-upload', route: '/settings/export' },
	{ title: 'Reset statistiche', icon: 'delete-outline', route: '/settings/reset-stats' },
	{ title: 'Informazioni', icon: 'info-outline', route: '/settings/info' },
];

export function SettingsScreen() {
	const router = useRouter();

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Impostazioni" showBackButton={false} />

			<YStack padding="$4" gap="$2">
				{settingsItems.map((item, index) => (
					<Pressable key={item.route} onPress={() => router.push(item.route as any)}>
						<XStack
							backgroundColor="$backgroundStrong"
							padding="$4"
							borderRadius="$3"
							alignItems="center"
							justifyContent="space-between"
						>
							<XStack alignItems="center" gap="$3">
								<MaterialIcons name={item.icon} size={24} color="gray" />
								<Text fontSize={16} color="$color">
									{item.title}
								</Text>
							</XStack>
							<MaterialIcons name="chevron-right" size={24} color="gray" />
						</XStack>
					</Pressable>
				))}
			</YStack>
		</View>
	);
}
