import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Input, Label, Text, TextArea, View, YStack, XStack } from 'tamagui';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { importDeckFromUrl, importDeckFromJson } from '@/utils/import-export';
import { useAppAlert } from '@/hooks/useAppAlert';

type ImportMode = 'url' | 'json';

export function ImportScreen() {
	const { loadDecks } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();

	const [importMode, setImportMode] = useState<ImportMode>('url');
	const [importUrl, setImportUrl] = useState('');
	const [importJson, setImportJson] = useState('');
	const [isImporting, setIsImporting] = useState(false);
	const [showFormat, setShowFormat] = useState(false);

	const handleImportFromUrl = async () => {
		if (!importUrl.trim()) {
			showAlert('Errore', 'Inserisci un URL valido');
			return;
		}

		setIsImporting(true);
		try {
			const deck = await importDeckFromUrl(importUrl.trim());
			await loadDecks();
			showAlert('Importazione completata', `Mazzo "${deck.title}" importato con ${deck.flashcards.length} flashcard!`, [
				{ text: 'OK', onPress: () => setImportUrl('') },
			]);
		} catch (error) {
			showAlert('Errore', error instanceof Error ? error.message : "Errore durante l'importazione");
		} finally {
			setIsImporting(false);
		}
	};

	const handleImportFromJson = async () => {
		if (!importJson.trim()) {
			showAlert('Errore', 'Inserisci il JSON del mazzo');
			return;
		}

		setIsImporting(true);
		try {
			const data = JSON.parse(importJson.trim());
			const deck = await importDeckFromJson(data);
			await loadDecks();
			showAlert('Importazione completata', `Mazzo "${deck.title}" importato con ${deck.flashcards.length} flashcard!`, [
				{ text: 'OK', onPress: () => setImportJson('') },
			]);
		} catch (error) {
			if (error instanceof SyntaxError) {
				showAlert('Errore', 'JSON non valido. Controlla la sintassi.');
			} else {
				showAlert('Errore', error instanceof Error ? error.message : "Errore durante l'importazione");
			}
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Importa dati" showBackButton />

			<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
				<YStack padding="$4" gap="$6">
					<YStack gap="$3">
						{/* Import Mode Toggle */}
						<XStack gap="$2">
							<Button size="$3" flex={1} onPress={() => setImportMode('url')} themeInverse={importMode === 'url'} chromeless={importMode !== 'url'}>
								Da URL
							</Button>
							<Button size="$3" flex={1} onPress={() => setImportMode('json')} themeInverse={importMode === 'json'} chromeless={importMode !== 'json'}>
								Da JSON
							</Button>
						</XStack>

						{importMode === 'url' ? (
							<>
								<Text fontSize={14} color="$secondary">
									Importa un mazzo da un file JSON ospitato sul web.
								</Text>
								<YStack gap="$1">
									<Label htmlFor="importUrl">URL del file JSON</Label>
									<Input id="importUrl" size="$4" value={importUrl} onChangeText={setImportUrl} placeholder="https://esempio.com/mazzo.json" />
								</YStack>
								<Button size="$4" onPress={handleImportFromUrl} disabled={isImporting} themeInverse>
									{isImporting ? 'Importando...' : 'Importa da URL'}
								</Button>
							</>
						) : (
							<>
								<Text fontSize={14} color="$secondary">
									Incolla direttamente il JSON del mazzo da importare.
								</Text>
								<YStack gap="$1">
									<Label htmlFor="importJson">JSON del mazzo</Label>
									<TextArea
										id="importJson"
										size="$4"
										value={importJson}
										onChangeText={setImportJson}
										placeholder={'{\n  "title": "Nome mazzo",\n  "flashcards": [...]\n}'}
										numberOfLines={8}
										minHeight={160}
									/>
								</YStack>
								<Button size="$4" onPress={handleImportFromJson} disabled={isImporting} themeInverse>
									{isImporting ? 'Importando...' : 'Importa JSON'}
								</Button>
							</>
						)}
					</YStack>

					{/* Format Documentation */}
					<YStack gap="$3">
						<Button size="$4" onPress={() => setShowFormat(!showFormat)} chromeless>
							{showFormat ? 'Nascondi formato JSON' : 'Mostra formato JSON'}
						</Button>
						{showFormat && (
							<View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$3">
								<Text fontSize={16} fontWeight="600" color="$color">
									Formato JSON
								</Text>
								<View backgroundColor="$background" padding="$3" borderRadius="$2">
									<Text fontFamily="$mono" fontSize={12} color="$color">
										{`{
  "title": "Nome del mazzo",
  "description": "Descrizione opzionale",
  "flashcards": [
    {
      "question": "Domanda 1",
      "answer": "Risposta 1"
    }
  ]
}`}
									</Text>
								</View>
								<YStack gap="$2">
									<Text fontSize={14} fontWeight="600" color="$color">
										Campi:
									</Text>
									<Text fontSize={13} color="$secondary">
										• <Text fontWeight="bold">title</Text> (obbligatorio): Nome del mazzo
									</Text>
									<Text fontSize={13} color="$secondary">
										• <Text fontWeight="bold">description</Text> (opzionale): Descrizione
									</Text>
									<Text fontSize={13} color="$secondary">
										• <Text fontWeight="bold">flashcards</Text> (obbligatorio): Array di flashcard
									</Text>
									<Text fontSize={13} color="$secondary" marginLeft="$3">
										• <Text fontWeight="bold">question</Text>: Testo della domanda (Markdown)
									</Text>
									<Text fontSize={13} color="$secondary" marginLeft="$3">
										• <Text fontWeight="bold">answer</Text>: Testo della risposta (Markdown)
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
