import { Pressable } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';

type SettingsItem = {
	title: string;
	icon: keyof typeof MaterialIcons.glyphMap;
	route: string;
};

const settingsItems: SettingsItem[] = [
	{ title: 'Importa dati', icon: 'file-download', route: '/settings/import' },
	{ title: 'Esporta dati', icon: 'file-upload', route: '/settings/export' },
	{ title: 'Backup e ripristino', icon: 'backup', route: '/settings/backup' },
	{ title: 'Reset statistiche', icon: 'delete-outline', route: '/settings/reset-stats' },
	{ title: 'Reset contenuti', icon: 'delete-forever', route: '/settings/reset-data' },
	{ title: 'Informazioni', icon: 'info-outline', route: '/settings/info' },
];

export function SettingsScreen() {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');

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
								<MaterialIcons name={item.icon} size={24} color={colors.muted} />
								<Text fontSize={16} color="$color">
									{item.title}
								</Text>
							</XStack>
							<MaterialIcons name="chevron-right" size={24} color={colors.muted} />
						</XStack>
					</Pressable>
				))}
			</YStack>
		</View>
	);
}
