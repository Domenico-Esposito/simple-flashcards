import { Button, Text, View, YStack } from 'tamagui';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ResetStatsScreen() {
	const { resetStats } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();

	const handleResetStats = () => {
		showAlert('Reset statistiche', 'Sei sicuro di voler eliminare tutte le statistiche? Questa azione è irreversibile.', [
			{ text: 'Annulla', style: 'cancel' },
			{
				text: 'Elimina tutto',
				style: 'destructive',
				onPress: async () => {
					await resetStats();
					showAlert('Completato', 'Le statistiche sono state eliminate.');
				},
			},
		]);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="Reset statistiche" showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					Questa azione eliminerà tutte le statistiche dei quiz completati. I mazzi e le flashcard non verranno eliminati.
				</Text>

				<Text fontSize={14} color="$secondary">
					L'operazione è irreversibile.
				</Text>

				<Button size="$4" theme="red" onPress={handleResetStats} marginTop="$4">
					Reset statistiche
				</Button>
			</YStack>
			{AlertDialog}
		</View>
	);
}
