import { Separator, Text, XStack, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@/components/statistics/StatCard';
import { kpiColors } from '@/theme/colors';
import type { StatisticsKpis } from '@/types';
import { formatTime } from '@/utils';

type StatisticsSummarySectionProps = {
  deckId?: number;
  kpis: StatisticsKpis;
};

export function StatisticsSummarySection({ deckId, kpis }: StatisticsSummarySectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <Separator my="$2" />
      <YStack gap="$4" testID="statistics-summary-section">
        <Text fontSize={18} fontWeight="600" color="$color">
          {t('stats.summary')}
        </Text>

        <XStack gap="$3">
          <StatCard
            title={t('stats.quizzesCompleted')}
            value={kpis.totalQuizzes}
            icon="school"
            iconColor={kpiColors.quizzes}
          />
          <StatCard
            title={t('stats.totalCards')}
            value={kpis.totalCards}
            icon="style"
            iconColor={kpiColors.totalCards}
          />
        </XStack>

        {deckId ? (
          <XStack gap="$3">
            <StatCard
              title={t('stats.easy')}
              value={kpis.easyCount}
              icon="sentiment-satisfied"
              iconColor={kpiColors.easy}
            />
            <StatCard
              title={t('stats.hard')}
              value={kpis.hardCount}
              icon="sentiment-dissatisfied"
              iconColor={kpiColors.hard}
            />
          </XStack>
        ) : (
          <XStack gap="$3">
            <StatCard
              title={t('stats.totalTime')}
              value={formatTime(kpis.totalTime)}
              icon="schedule"
              iconColor={kpiColors.totalTime}
            />
            <StatCard
              title={t('stats.totalDecks')}
              value={kpis.totalDecks}
              icon="folder"
              iconColor={kpiColors.totalDecks}
            />
          </XStack>
        )}
      </YStack>
    </>
  );
}
