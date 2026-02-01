import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Select, Text, View, YStack, XStack, Adapt, Sheet } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { exportDeckToJson, exportAllDecksToJson, shareJsonFile } from '@/utils/import-export';

export default function ExportScreen() {
	const { decks } = useFlashcardsStore();
	const [selectedDeckId, setSelectedDeckId] = useState<string>('');
	const [isExporting, setIsExporting] = useState(false);

	const handleExportAll = async () => {
		setIsExporting(true);
		try {
			const json = await exportAllDecksToJson();
			const filename = `flashcards_all_${Date.now()}.json`;
			await shareJsonFile(json, filename);
		} catch (error) {
			Alert.alert('Errore', error instanceof Error ? error.message : "Errore durante l'esportazione");
		} finally {
			setIsExporting(false);
		}
	};

	const handleExportSingle = async () => {
		if (!selectedDeckId) {
			Alert.alert('Errore', 'Seleziona un mazzo da esportare');
			return;
		}

		setIsExporting(true);
		try {
			const json = await exportDeckToJson(Number(selectedDeckId));
			const deck = decks.find((d) => d.id === Number(selectedDeckId));
			const sanitizedTitle = deck?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'deck';
			const filename = `flashcards_${sanitizedTitle}_${Date.now()}.json`;
			await shareJsonFile(json, filename);
		} catch (error) {
			Alert.alert('Errore', error instanceof Error ? error.message : "Errore durante l'esportazione");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Esporta dati" showBackButton />

			<YStack padding="$4" gap="$6" flex={1}>
				{/* Export All */}
				<YStack gap="$3">
					<Text fontSize={18} fontWeight="600" color="$color">
						Esporta tutti i mazzi
					</Text>
					<Text fontSize={14} color="$secondary">
						Esporta tutti i mazzi in un unico file JSON per backup o condivisione.
					</Text>
					<Button size="$4" onPress={handleExportAll} disabled={isExporting || decks.length === 0} themeInverse>
						{isExporting ? 'Esportando...' : 'Esporta tutti'}
					</Button>
					{decks.length === 0 && (
						<Text fontSize={12} color="$placeholderColor" textAlign="center">
							Nessun mazzo disponibile per l'esportazione
						</Text>
					)}
				</YStack>

				{/* Export Single */}
				<YStack gap="$3">
					<Text fontSize={18} fontWeight="600" color="$color">
						Esporta singolo mazzo
					</Text>
					<Text fontSize={14} color="$secondary">
						Seleziona un mazzo specifico da esportare.
					</Text>

					<Select value={selectedDeckId} onValueChange={setSelectedDeckId} disablePreventBodyScroll>
						<Select.Trigger width="100%" iconAfter={<MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />}>
							<Select.Value placeholder="Seleziona un mazzo..." />
						</Select.Trigger>

						<Adapt when="sm" platform="touch">
							<Sheet
								modal
								dismissOnSnapToBottom
								animationConfig={{
									type: 'spring',
									damping: 20,
									mass: 1.2,
									stiffness: 250,
								}}
							>
								<Sheet.Frame>
									<Sheet.ScrollView>
										<Adapt.Contents />
									</Sheet.ScrollView>
								</Sheet.Frame>
								<Sheet.Overlay />
							</Sheet>
						</Adapt>

						<Select.Content zIndex={200000}>
							<Select.Viewport>
								<Select.Group>
									<Select.Label>Mazzi disponibili</Select.Label>
									{decks.map((deck, index) => (
										<Select.Item key={deck.id} value={String(deck.id)} index={index}>
											<Select.ItemText>{deck.title}</Select.ItemText>
											<Select.ItemIndicator marginLeft="auto">
												<MaterialIcons name="check" size={16} color="gray" />
											</Select.ItemIndicator>
										</Select.Item>
									))}
								</Select.Group>
							</Select.Viewport>
						</Select.Content>
					</Select>

					<Button size="$4" onPress={handleExportSingle} disabled={!selectedDeckId || isExporting}>
						{isExporting ? 'Esportando...' : 'Esporta mazzo'}
					</Button>
				</YStack>
			</YStack>
		</View>
	);
}
