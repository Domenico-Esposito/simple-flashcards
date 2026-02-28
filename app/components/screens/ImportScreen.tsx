import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, YStack, XStack } from 'tamagui';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { importDeckFromUrl, importDeckFromJson } from '@/utils/import-export';
import { useAppAlert } from '@/hooks/useAppAlert';

type ImportMode = 'url' | 'json';

export function ImportScreen() {
	const { t } = useTranslation();
	const { loadDecks } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();

	const [importMode, setImportMode] = useState<ImportMode>('url');
	const [importUrl, setImportUrl] = useState('');
	const [importJson, setImportJson] = useState('');
	const [isImporting, setIsImporting] = useState(false);
	const [showFormat, setShowFormat] = useState(false);

	const handleImportFromUrl = async () => {
		if (!importUrl.trim()) {
			showAlert(t('common.error'), t('import.invalidUrl'));
			return;
		}

		setIsImporting(true);
		try {
			const deck = await importDeckFromUrl(importUrl.trim());
			await loadDecks();
			showAlert(t('import.successTitle'), t('import.successMessage', { title: deck.title, count: deck.flashcards.length }), [
				{ text: 'OK', onPress: () => setImportUrl('') },
			]);
		} catch (error) {
			showAlert(t('common.error'), error instanceof Error ? error.message : t('import.error'));
		} finally {
			setIsImporting(false);
		}
	};

	const handleImportFromJson = async () => {
		if (!importJson.trim()) {
			showAlert(t('common.error'), t('import.missingJson'));
			return;
		}

		setIsImporting(true);
		try {
			const data = JSON.parse(importJson.trim());
			const deck = await importDeckFromJson(data);
			await loadDecks();
			showAlert(t('import.successTitle'), t('import.successMessage', { title: deck.title, count: deck.flashcards.length }), [
				{ text: 'OK', onPress: () => setImportJson('') },
			]);
		} catch (error) {
			if (error instanceof SyntaxError) {
				showAlert(t('common.error'), t('import.invalidJson'));
			} else {
				showAlert(t('common.error'), error instanceof Error ? error.message : t('import.error'));
			}
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title={t('import.title')} showBackButton />

			<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
				<YStack padding="$4" gap="$6">
					<YStack gap="$3">
						{/* Import Mode Toggle */}
						<XStack gap="$2">
							<Button size="$3" flex={1} onPress={() => setImportMode('url')} themeInverse={importMode === 'url'} chromeless={importMode !== 'url'}>
								{t('import.fromUrl')}
							</Button>
							<Button size="$3" flex={1} onPress={() => setImportMode('json')} themeInverse={importMode === 'json'} chromeless={importMode !== 'json'}>
								{t('import.fromJson')}
							</Button>
						</XStack>

						{importMode === 'url' ? (
							<>
								<Text fontSize={14} color="$secondary">
									{t('import.urlDescription')}
								</Text>
								<YStack gap="$1">
									<Label htmlFor="importUrl">{t('import.urlLabel')}</Label>
									<Input id="importUrl" size="$4" value={importUrl} onChangeText={setImportUrl} placeholder={t('import.urlPlaceholder')} />
								</YStack>
								<Button size="$4" onPress={handleImportFromUrl} disabled={isImporting} themeInverse>
									{isImporting ? t('common.importing') : t('import.fromUrlButton')}
								</Button>
							</>
						) : (
							<>
								<Text fontSize={14} color="$secondary">
									{t('import.jsonDescription')}
								</Text>
								<YStack gap="$1">
									<Label htmlFor="importJson">{t('import.jsonLabel')}</Label>
									<TextArea
										id="importJson"
										size="$4"
										value={importJson}
										onChangeText={setImportJson}
										placeholder={t('import.jsonPlaceholder')}
										numberOfLines={8}
										minHeight={160}
									/>
								</YStack>
								<Button size="$4" onPress={handleImportFromJson} disabled={isImporting} themeInverse>
									{isImporting ? t('common.importing') : t('import.fromJsonButton')}
								</Button>
							</>
						)}
					</YStack>

					{/* Format Documentation */}
					<YStack gap="$3">
						<Button size="$4" onPress={() => setShowFormat(!showFormat)} chromeless>
							{showFormat ? t('import.hideFormat') : t('import.showFormat')}
						</Button>
						{showFormat && (
							<View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$3">
								<Text fontSize={16} fontWeight="600" color="$color">
									{t('import.formatTitle')}
								</Text>
								<View backgroundColor="$background" padding="$3" borderRadius="$2">
									<Text fontFamily="$mono" fontSize={12} color="$color">
										{t('import.formatExample')}
									</Text>
								</View>
								<YStack gap="$2">
									<Text fontSize={14} fontWeight="600" color="$color">
										{t('import.fieldsLabel')}
									</Text>
									<Text fontSize={13} color="$secondary">
										{t('import.titleField')}
									</Text>
									<Text fontSize={13} color="$secondary">
										{t('import.descriptionField')}
									</Text>
									<Text fontSize={13} color="$secondary">
										{t('import.flashcardsField')}
									</Text>
									<Text fontSize={13} color="$secondary" marginLeft="$3">
										{t('import.questionField')}
									</Text>
									<Text fontSize={13} color="$secondary" marginLeft="$3">
										{t('import.answerField')}
									</Text>
								</YStack>
							</View>
						)}
					</YStack>
				</YStack>
			</ScrollView>
			{AlertDialog}
		</View>
	);
}
