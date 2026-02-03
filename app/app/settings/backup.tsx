import { Alert } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { File } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { backupDatabaseToFile, restoreDatabaseFromFile } from '@/utils/database';

export default function BackupScreen() {
	const { refreshAfterRestore } = useFlashcardsStore();

	const handleBackup = async () => {
		try {
			const backupFile = await backupDatabaseToFile();
			if (await isAvailableAsync()) {
				await shareAsync(backupFile.uri, {
					mimeType: 'application/octet-stream',
					dialogTitle: 'Backup del database',
				});
			} else {
				throw new Error('La condivisione non è disponibile su questo dispositivo');
			}
		} catch (error) {
			Alert.alert('Errore', error instanceof Error ? error.message : 'Errore durante il backup');
		}
	};

	const handleRestore = async () => {
		Alert.alert(
			'Ripristina backup',
			'Il ripristino sovrascriverà tutti i dati attuali. Vuoi continuare?',
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Ripristina',
					style: 'destructive',
					onPress: async () => {
						try {
							const picked = await File.pickFileAsync();
							const file = Array.isArray(picked) ? picked[0] : picked;
							await restoreDatabaseFromFile(file);
							await refreshAfterRestore();
							Alert.alert('Completato', 'Backup ripristinato correttamente.');
						} catch (error) {
							Alert.alert('Errore', error instanceof Error ? error.message : 'Errore durante il ripristino');
						}
					},
				},
			],
		);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Backup e ripristino" showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					Crea un backup completo del database o ripristina da un file di backup.
				</Text>

				<Button size="$4" onPress={handleBackup} themeInverse>
					Crea backup
				</Button>

				<Button size="$4" onPress={handleRestore} theme="red">
					Ripristina backup
				</Button>
			</YStack>
		</View>
	);
}
