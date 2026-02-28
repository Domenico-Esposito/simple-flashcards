import { Button, Text, View, YStack } from 'tamagui';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ResetDataScreen() {
	const { resetAllData } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();

	const handleResetData = () => {
		showAlert('Reset contenuti', 'Sei sicuro di voler eliminare tutti i dati? Mazzi, flashcard e statistiche verranno eliminati. Questa azione è irreversibile.', [
			{ text: 'Annulla', style: 'cancel' },
			{
				text: 'Elimina tutto',
				style: 'destructive',
				onPress: async () => {
					await resetAllData();
					showAlert('Completato', 'Tutti i dati sono stati eliminati.');
				},
			},
		]);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Reset contenuti" showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					Questa azione eliminerà tutti i dati dell'applicazione: mazzi, flashcard e statistiche dei quiz completati.
				</Text>

				<Text fontSize={14} color="$secondary">
					Il database verrà reinizializzato da zero. L'operazione è irreversibile.
				</Text>

				<Button size="$4" theme="red" onPress={handleResetData} marginTop="$4">
					Reset contenuti
				</Button>
			</YStack>
			{AlertDialog}
		</View>
	);
}
