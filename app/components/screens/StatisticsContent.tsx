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
import { chartColors, kpiColors } from '@/constants/colors';

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
export function StatisticsContent({ deckId, title, showBackButton = false }: StatisticsContentProps) {
  const { interval, setInterval, data, kpis, loading, refresh } = useStatistics(deckId);
  const { t } = useTranslation();

  const resolvedTitle = title ?? t('tab.statistics');

  const INTERVALS: { value: Interval; label: string }[] = [
    { value: 'day', label: t('stats.interval7days') },
    { value: 'month', label: t('stats.interval6months') },
    { value: 'quarter', label: t('stats.intervalQuarter') },
    { value: 'semester', label: t('stats.intervalSemester') },
    { value: 'year', label: t('stats.intervalYear') },
  ];

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View flex={1} backgroundColor="$background">
      <Header title={resolvedTitle} showBackButton={showBackButton} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$5">
          {/* Interval Selector */}
          <View backgroundColor="$backgroundStrong" borderRadius="$4" padding="$1">
            <XStack>
              {INTERVALS.map((i) => (
                <Pressable
                  key={i.value}
                  onPress={() => setInterval(i.value)}
                  style={{ flex: 1 }}
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

          {/* Chart Section */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">{t('stats.difficultyTrend')}</Text>
            <View 
              backgroundColor="$backgroundStrong" 
              borderRadius="$4" 
              padding="$4" 
              minHeight={260}
              justifyContent="center"
            >
              {loading ? (
                <YStack alignItems="center" justifyContent="center" flex={1}>
                  <Spinner size="large" color="$primary" />
                </YStack>
              ) : (
                <HistogramChart data={data} />
              )}
            </View>
            
            {/* Legend */}
            <XStack justifyContent="center" gap="$6" paddingTop="$2">
              <XStack alignItems="center" gap="$2">
                <View width={12} height={12} borderRadius={3} backgroundColor={chartColors.easy} />
                <Text fontSize={13} color="$gray10">{t('stats.easy')}</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <View width={12} height={12} borderRadius={3} backgroundColor={chartColors.medium} />
                <Text fontSize={13} color="$gray10">{t('stats.medium')}</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <View width={12} height={12} borderRadius={3} backgroundColor={chartColors.hard} />
                <Text fontSize={13} color="$gray10">{t('stats.hard')}</Text>
              </XStack>
            </XStack>
          </YStack>

          <Separator marginVertical="$2" />

          {/* KPIs Section */}
          <YStack gap="$4">
            <Text fontSize={18} fontWeight="600" color="$color">{t('stats.summary')}</Text>
            
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
