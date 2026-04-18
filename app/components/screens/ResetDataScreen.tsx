import { useTranslation } from 'react-i18next';

import { ResetActionScreen } from '@/components/screens/settings/ResetActionScreen';
import { useFlashcardsStore } from '@/store/flashcards';

export function ResetDataScreen() {
  const { resetAllData } = useFlashcardsStore();
  const { t } = useTranslation();

  return (
    <ResetActionScreen
      title={t('resetData.title')}
      descriptions={[t('resetData.description1'), t('resetData.description2')]}
      confirmMessage={t('resetData.confirmMessage')}
      successMessage={t('resetData.success')}
      buttonLabel={t('resetData.buttonLabel')}
      testID="reset-data-screen"
      buttonTestID="reset-data-confirm-button"
      confirmLabel={t('common.deleteAll')}
      cancelLabel={t('common.cancel')}
      completedTitle={t('common.completed')}
      onConfirm={resetAllData}
    />
  );
}
