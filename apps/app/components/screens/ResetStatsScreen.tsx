import { useTranslation } from 'react-i18next';

import { ResetActionScreen } from '@/components/screens/settings/ResetActionScreen';
import { useStatisticsActions } from '@/store/flashcards.selectors';

export function ResetStatsScreen() {
  const { resetStats } = useStatisticsActions();
  const { t } = useTranslation();

  return (
    <ResetActionScreen
      title={t('resetStats.title')}
      descriptions={[t('resetStats.description'), t('resetStats.irreversible')]}
      confirmMessage={t('resetStats.confirmMessage')}
      successMessage={t('resetStats.success')}
      buttonLabel={t('resetStats.buttonLabel')}
      testID="reset-stats-screen"
      buttonTestID="reset-stats-confirm-button"
      confirmLabel={t('common.deleteAll')}
      cancelLabel={t('common.cancel')}
      completedTitle={t('common.completed')}
      onConfirm={resetStats}
    />
  );
}
