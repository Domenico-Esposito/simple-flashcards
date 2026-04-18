import { useCallback } from 'react';
import { ScrollView, YStack, Text, View } from 'tamagui';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { StatisticsChartSection } from '@/components/screens/statistics/StatisticsChartSection';
import { StatisticsIntervalSelector } from '@/components/screens/statistics/StatisticsIntervalSelector';
import { useStatistics } from '@/components/screens/statistics/useStatistics';
import type { StatisticsInterval } from '@/types';
import { StatisticsSummarySection } from '@/components/screens/statistics/StatisticsSummarySection';

type StatisticsContentProps = {
  /** When provided, shows deck-specific statistics */
  deckId?: number;
  /** Header title */
  title?: string;
  /** Whether to show the back button in the header */
  showBackButton?: boolean;
};

/**
 * Shared statistics UI used by both the global statistics tab and the per-deck statistics screen.
 */
export function StatisticsContent({
  deckId,
  title,
  showBackButton = false,
}: StatisticsContentProps) {
  const { interval, setInterval, data, kpis, loading, error, refresh } = useStatistics(deckId);
  const { t } = useTranslation();

  const resolvedTitle = title ?? t('tab.statistics');

  const intervals: { value: StatisticsInterval; label: string; testID: string }[] = [
    { value: 'day', label: t('stats.interval7days'), testID: 'stats-interval-day' },
    { value: 'month', label: t('stats.interval6months'), testID: 'stats-interval-month' },
    { value: 'quarter', label: t('stats.intervalQuarter'), testID: 'stats-interval-quarter' },
    { value: 'semester', label: t('stats.intervalSemester'), testID: 'stats-interval-semester' },
    { value: 'year', label: t('stats.intervalYear'), testID: 'stats-interval-year' },
  ];

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <View
      flex={1}
      backgroundColor="$background"
      testID={deckId ? 'deck-statistics-screen' : 'statistics-screen'}
    >
      <Header title={resolvedTitle} showBackButton={showBackButton} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$5">
          <StatisticsIntervalSelector
            interval={interval}
            intervals={intervals}
            onSelect={setInterval}
          />

          {error && (
            <YStack
              gap="$1"
              padding="$3"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$red8"
              backgroundColor="$red2"
            >
              <Text fontSize={14} fontWeight="600" color="$red10">
                {t('stats.loadError')}
              </Text>
              {__DEV__ ? (
                <Text fontSize={12} color="$red10">
                  {error}
                </Text>
              ) : null}
            </YStack>
          )}

          <StatisticsChartSection
            title={t('stats.difficultyTrend')}
            loading={loading}
            data={data}
          />
          <StatisticsSummarySection deckId={deckId} kpis={kpis} />
        </YStack>
      </ScrollView>
    </View>
  );
}
