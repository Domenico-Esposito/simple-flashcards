import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, YStack, XStack, Text, Spinner, View, Separator } from 'tamagui';
import { useFocusEffect } from 'expo-router';

import { useStatistics, Interval } from '@/hooks/useStatistics';
import { HistogramChart } from '@/components/HistogramChart';
import { StatCard } from '@/components/StatCard';
import { Header } from '@/components/Header';
import { formatTime } from '@/utils';
import { chartColors, kpiColors } from '@/constants/colors';

const INTERVALS: { value: Interval; label: string }[] = [
  { value: 'day', label: '7G' },
  { value: 'month', label: '6M' },
  { value: 'quarter', label: 'Trim.' },
  { value: 'semester', label: 'Sem.' },
  { value: 'year', label: 'Anno' },
];

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
export function StatisticsContent({ deckId, title = 'Statistiche', showBackButton = false }: StatisticsContentProps) {
  const { interval, setInterval, data, kpis, loading, refresh } = useStatistics(deckId);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View flex={1} backgroundColor="$background">
      <Header title={title} showBackButton={showBackButton} />
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
            <Text fontSize={18} fontWeight="600" color="$color">Andamento Risposte</Text>
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
                <View width={12} height={12} borderRadius={3} backgroundColor={chartColors.correct} />
                <Text fontSize={13} color="$gray10">Corrette</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <View width={12} height={12} borderRadius={3} backgroundColor={chartColors.incorrect} />
                <Text fontSize={13} color="$gray10">Errate</Text>
              </XStack>
            </XStack>
          </YStack>

          <Separator marginVertical="$2" />

          {/* KPIs Section */}
          <YStack gap="$4">
            <Text fontSize={18} fontWeight="600" color="$color">Riepilogo</Text>
            
            <XStack gap="$3">
              <StatCard 
                title="Quiz Completati" 
                value={kpis.totalQuizzes} 
                icon="school"
                iconColor={kpiColors.quizzes}
              />
              <StatCard 
                title="Accuratezza" 
                value={`${kpis.accuracy.toFixed(1)}%`}
                icon="check-circle"
                iconColor={kpiColors.accuracy}
              />
            </XStack>
            
            <XStack gap="$3">
              <StatCard 
                title="Risposte Totali" 
                value={kpis.totalAnswers}
                icon="question-answer"
                iconColor={kpiColors.answers}
              />
              <StatCard 
                title="Tempo Totale" 
                value={formatTime(kpis.totalTime)}
                icon="schedule"
                iconColor={kpiColors.totalTime}
              />
            </XStack>
            
            <StatCard 
              title="Tempo Medio per Quiz" 
              value={formatTime(kpis.avgTimePerQuiz)}
              icon="timer"
              iconColor={kpiColors.avgTime}
              fullWidth
            />
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
