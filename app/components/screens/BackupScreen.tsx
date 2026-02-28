import { Platform } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { backupDatabaseToFile, backupDatabaseToBytes, restoreDatabaseFromFile, restoreDatabaseFromBytes } from '@/utils/database';
import { useAppAlert } from '@/hooks/useAppAlert';

/**
 * Trigger a file download in the browser
 */
function downloadBlobAsFile(data: Uint8Array, filename: string) {
	const blob = new Blob([data as unknown as BlobPart], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * Pick a file via browser file input and return its bytes
 */
function pickFileFromBrowser(): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.db';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) {
				reject(new Error('Nessun file selezionato'));
				return;
			}
			const buffer = await file.arrayBuffer();
			resolve(new Uint8Array(buffer));
		};
		input.click();
	});
}

export function BackupScreen() {
	const { refreshAfterRestore } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();

	const handleBackup = async () => {
		try {
			if (Platform.OS === 'web') {
				const data = await backupDatabaseToBytes();
				const filename = `flashcards_backup_${Date.now()}.db`;
				downloadBlobAsFile(data, filename);
			} else {
				const backupFile = await backupDatabaseToFile();
				const { isAvailableAsync, shareAsync } = await import('expo-sharing');
				if (await isAvailableAsync()) {
					await shareAsync(backupFile.uri, {
						mimeType: 'application/octet-stream',
						dialogTitle: 'Backup del database',
					});
				} else {
					throw new Error('La condivisione non è disponibile su questo dispositivo');
				}
			}
		} catch (error) {
			showAlert('Errore', error instanceof Error ? error.message : 'Errore durante il backup');
		}
	};

	const handleRestore = async () => {
		if (Platform.OS === 'web') {
			showAlert(
				'Ripristina backup',
				'Il ripristino sovrascriverà tutti i dati attuali. Vuoi continuare?',
				[
					{ text: 'Annulla', style: 'cancel' },
					{
						text: 'Ripristina',
						style: 'destructive',
						onPress: async () => {
							try {
								const data = await pickFileFromBrowser();
								await restoreDatabaseFromBytes(data);
								await refreshAfterRestore();
								showAlert('Completato', 'Backup ripristinato correttamente.');
							} catch (error) {
								showAlert('Errore', error instanceof Error ? error.message : 'Errore durante il ripristino');
							}
						},
					},
				],
			);
			return;
		}

		showAlert(
			'Ripristina backup',
			'Il ripristino sovrascriverà tutti i dati attuali. Vuoi continuare?',
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Ripristina',
					style: 'destructive',
					onPress: async () => {
						try {
							const { File } = await import('expo-file-system');
							const picked = await File.pickFileAsync();
							const file = Array.isArray(picked) ? picked[0] : picked;
							await restoreDatabaseFromFile(file as any);
							await refreshAfterRestore();
							showAlert('Completato', 'Backup ripristinato correttamente.');
						} catch (error) {
							showAlert('Errore', error instanceof Error ? error.message : 'Errore durante il ripristino');
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
			{AlertDialog}
		</View>
	);
}
