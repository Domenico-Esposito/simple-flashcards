import { Button, Text, View, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { useFlashcardsStore } from '@/store/flashcards';
import { useAppAlert } from '@/hooks/useAppAlert';

export function ResetDataScreen() {
	const { resetAllData } = useFlashcardsStore();
	const { showAlert, AlertDialog } = useAppAlert();
	const { t } = useTranslation();

	const handleResetData = () => {
		showAlert(t('resetData.title'), t('resetData.confirmMessage'), [
			{ text: t('common.cancel'), style: 'cancel' },
			{
				text: t('common.deleteAll'),
				style: 'destructive',
				onPress: async () => {
					await resetAllData();
					showAlert(t('common.completed'), t('resetData.success'));
				},
			},
		]);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title={t('resetData.title')} showBackButton />

			<YStack padding="$4" gap="$4">
				<Text fontSize={14} color="$secondary">
					{t('resetData.description1')}
				</Text>

				<Text fontSize={14} color="$secondary">
					{t('resetData.description2')}
				</Text>

				<Button size="$4" theme="red" onPress={handleResetData} marginTop="$4">
					{t('resetData.buttonLabel')}
				</Button>
			</YStack>
			{AlertDialog}
		</View>
	);
}
