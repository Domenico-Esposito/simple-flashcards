import { Button, Text, View, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ResetStatsScreen() {
	const { resetStats } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();
	const { t } = useTranslation();

	const handleResetStats = () => {
		showAlert(t('resetStats.title'), t('resetStats.confirmMessage'), [
			{ text: t('common.cancel'), style: 'cancel' },
			{
				text: t('common.deleteAll'),
				style: 'destructive',
				onPress: async () => {
					await resetStats();
					showAlert(t('common.completed'), t('resetStats.success'));
				},
			},
		]);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title={t('resetStats.title')} showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					{t('resetStats.description')}
				</Text>

				<Text fontSize={14} color="$secondary">
					{t('resetStats.irreversible')}
				</Text>

				<Button size="$4" theme="red" onPress={handleResetStats} marginTop="$4">
					{t('resetStats.buttonLabel')}
				</Button>
			</YStack>
			{AlertDialog}
		</View>
	);
}
