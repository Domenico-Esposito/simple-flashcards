import * as SQLite from 'expo-sqlite';

import { getDb, reinitializeDatabase } from './connection';

export async function backupDatabaseToBytes(): Promise<Uint8Array> {
  return await getDb().serializeAsync();
}

export async function backupDatabaseToFile(): Promise<import('expo-file-system').File> {
  const { Directory, File, Paths } = await import('expo-file-system');
  const backupDirectory = new Directory(Paths.document, 'flashcards-backups');
  backupDirectory.create({ idempotent: true });

  const filename = `flashcards_backup_${Date.now()}.db`;
  const backupFile = new File(backupDirectory, filename);

  if (backupFile.exists) {
    backupFile.delete();
  }

  const serialized = await getDb().serializeAsync();
  backupFile.create({ intermediates: true });
  backupFile.write(serialized);

  return backupFile;
}

export async function restoreDatabaseFromBytes(data: Uint8Array): Promise<void> {
  const sourceDb = await SQLite.deserializeDatabaseAsync(data);

  try {
    await SQLite.backupDatabaseAsync({
      sourceDatabase: sourceDb,
      destDatabase: getDb(),
    });
  } finally {
    await sourceDb.closeAsync();
  }

  await reinitializeDatabase();
}

export async function restoreDatabaseFromFile(
  file: import('expo-file-system').File,
): Promise<void> {
  const { Directory, File, Paths } = await import('expo-file-system');
  const backupDirectory = new Directory(Paths.document, 'flashcards-backups');
  backupDirectory.create({ idempotent: true });

  const tempFile = new File(backupDirectory, `restore_${Date.now()}.db`);

  if (tempFile.exists) {
    tempFile.delete();
  }

  file.copy(tempFile);

  const serialized = await tempFile.bytes();
  await restoreDatabaseFromBytes(serialized);

  if (tempFile.exists) {
    tempFile.delete();
  }
}
