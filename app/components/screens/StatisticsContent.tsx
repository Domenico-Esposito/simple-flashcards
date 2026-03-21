import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, YStack, XStack, Text, Spinner, View, Separator } from 'tamagui';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useStatistics, Interval } from '@/hooks/useStatistics';
import { HistogramChart } from '@/components/HistogramChart';
import { StatCard } from '@/components/StatCard';
import { Header } from '@/components/Header';
import { formatTime } from '@/utils';
import { kpiColors } from '@/constants/colors';

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

  const INTERVALS: { value: Interval; label: string; testID: string }[] = [
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
          {/* Interval Selector */}
          <View backgroundColor="$backgroundStrong" borderRadius="$4" padding="$1">
            <XStack>
              {INTERVALS.map((i) => (
                <Pressable
                  key={i.value}
                  onPress={() => setInterval(i.value)}
                  style={{ flex: 1 }}
                  testID={i.testID}
                >
                  <View
                    paddingVertical="$2.5"
                    paddingHorizontal="$3"
                    borderRadius="$3"
                    backgroundColor={interval === i.value ? '$background' : 'transparent'}
                    alignItems="center"
                    justifyContent="center"
                    {...(interval === i.value && {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    })}
                  >
                    <Text
                      fontSize={13}
                      fontWeight={interval === i.value ? '600' : '400'}
                      color={interval === i.value ? '$color' : '$gray10'}
                    >
                      {i.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </XStack>
          </View>

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

          {/* Chart Section */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              {t('stats.difficultyTrend')}
            </Text>
            <View
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$4"
              testID="statistics-chart-section"
            >
              {loading ? (
                <YStack alignItems="center" justifyContent="center" flex={1}>
                  <Spinner size="large" color="$primary" />
                </YStack>
              ) : (
                <HistogramChart data={data} />
              )}
            </View>
          </YStack>

          <Separator marginVertical="$2" />

          {/* KPIs Section */}
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
        </YStack>
      </ScrollView>
    </View>
  );
}
