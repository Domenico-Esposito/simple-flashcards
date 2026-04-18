import i18n from '@/i18n';

export function downloadBlobAsFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data as unknown as BlobPart], {
    type: 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function pickFileFromBrowser(): Promise<Uint8Array> {
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

export async function pickRestoreFile(): Promise<import('expo-file-system').File> {
  const { File } = await import('expo-file-system');
  const picked = await File.pickFileAsync();

  if (Array.isArray(picked)) {
    const file = picked[0];

    if (!file) {
      throw new Error(i18n.t('backup.noFileSelected'));
    }

    return new File(file.uri);
  }

  return new File(picked.uri);
}
