import { Platform } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { backupDatabaseToFile, backupDatabaseToBytes, restoreDatabaseFromFile, restoreDatabaseFromBytes } from '@/utils/database';
import { useAppAlert } from '@/hooks/useAppAlert';
import i18n from '@/i18n';

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
				reject(new Error(i18n.t('backup.noFileSelected')));
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
	const { t } = useTranslation();

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
						dialogTitle: t('backup.dialogTitle'),
					});
				} else {
					throw new Error(t('backup.sharingNotAvailable'));
				}
			}
		} catch (error) {
			showAlert(t('common.error'), error instanceof Error ? error.message : t('backup.error'));
		}
	};

	const handleRestore = async () => {
		if (Platform.OS === 'web') {
			showAlert(
				t('backup.restoreTitle'),
				t('backup.restoreWarning'),
				[
					{ text: t('common.cancel'), style: 'cancel' },
					{
						text: t('backup.restore'),
						style: 'destructive',
						onPress: async () => {
							try {
								const data = await pickFileFromBrowser();
								await restoreDatabaseFromBytes(data);
								await refreshAfterRestore();
								showAlert(t('common.completed'), t('backup.restoreSuccess'));
							} catch (error) {
								showAlert(t('common.error'), error instanceof Error ? error.message : t('backup.restoreError'));
							}
						},
					},
				],
			);
			return;
		}

		showAlert(
			t('backup.restoreTitle'),
			t('backup.restoreWarning'),
			[
				{ text: t('common.cancel'), style: 'cancel' },
				{
					text: t('backup.restore'),
					style: 'destructive',
					onPress: async () => {
						try {
							const { File } = await import('expo-file-system');
							const picked = await File.pickFileAsync();
							const file = Array.isArray(picked) ? picked[0] : picked;
							await restoreDatabaseFromFile(file as any);
							await refreshAfterRestore();
							showAlert(t('common.completed'), t('backup.restoreSuccess'));
						} catch (error) {
							showAlert(t('common.error'), error instanceof Error ? error.message : t('backup.restoreError'));
						}
					},
				},
			],
		);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title={t('backup.title')} showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					{t('backup.description')}
				</Text>

				<Button size="$4" onPress={handleBackup} themeInverse>
					{t('backup.createButton')}
				</Button>

				<Button size="$4" onPress={handleRestore} theme="red">
					{t('backup.restoreButton')}
				</Button>
			</YStack>
			{AlertDialog}
		</View>
	);
}
