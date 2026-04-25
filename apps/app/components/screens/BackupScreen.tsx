import { Platform } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import {
  downloadBlobAsFile,
  pickFileFromBrowser,
  pickRestoreFile,
} from '@/components/screens/settings/backup';
import { useMaintenanceActions } from '@/store/flashcards.selectors';
import {
  backupDatabaseToFile,
  backupDatabaseToBytes,
  restoreDatabaseFromFile,
  restoreDatabaseFromBytes,
} from '@/utils/database';
import { useAppAlert } from '@/hooks/useAppAlert';

export function BackupScreen() {
  const { refreshAfterRestore } = useMaintenanceActions();
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
      showAlert(t('backup.restoreTitle'), t('backup.restoreWarning'), [
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
              showAlert(
                t('common.error'),
                error instanceof Error ? error.message : t('backup.restoreError'),
              );
            }
          },
        },
      ]);
      return;
    }

    showAlert(t('backup.restoreTitle'), t('backup.restoreWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('backup.restore'),
        style: 'destructive',
        onPress: async () => {
          try {
            const file = await pickRestoreFile();
            await restoreDatabaseFromFile(file);
            await refreshAfterRestore();
            showAlert(t('common.completed'), t('backup.restoreSuccess'));
          } catch (error) {
            showAlert(
              t('common.error'),
              error instanceof Error ? error.message : t('backup.restoreError'),
            );
          }
        },
      },
    ]);
  };

  return (
    <View flex={1} bg="$background" testID="backup-screen">
      <Header title={t('backup.title')} showBackButton />

      <YStack p="$4" gap="$4">
        <Text fontSize={14} color="$secondary">
          {t('backup.description')}
        </Text>

        <Button
          size="$4"
          onPress={handleBackup}
          themeInverse
          testID="backup-create-button"
          accessibilityLabel="backup-create-button"
        >
          {t('backup.createButton')}
        </Button>

        <Button
          size="$4"
          onPress={handleRestore}
          theme="red"
          testID="backup-restore-button"
          accessibilityLabel="backup-restore-button"
        >
          {t('backup.restoreButton')}
        </Button>
      </YStack>
      {AlertDialog}
    </View>
  );
}
