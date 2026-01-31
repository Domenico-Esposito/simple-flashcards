import { ScrollView, YStack, XStack, Text, Spinner, View, Separator } from 'tamagui';
import { Pressable } from 'react-native';
import { useStatistics, Interval } from '@/hooks/useStatistics';
import { HistogramChart } from '@/components/HistogramChart';
import { StatCard } from '@/components/StatCard';
import { Header } from '@/components/Header';
import { useLocalSearchParams } from 'expo-router';

export default function DeckStatisticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deckId = parseInt(id, 10);
  const { interval, setInterval, data, kpis, loading } = useStatistics(deckId);
  
  const intervals: { value: Interval; label: string }[] = [
    { value: 'day', label: '7G' },
    { value: 'month', label: '6M' },
    { value: 'quarter', label: 'Trim.' },
    { value: 'semester', label: 'Sem.' },
    { value: 'year', label: 'Anno' },
  ];

  return (
    <View flex={1} backgroundColor="$background">
      <Header title="Statistiche Mazzo" showBackButton={true} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$5">
          {/* Interval Selector */}
          <View backgroundColor="$backgroundStrong" borderRadius="$4" padding="$1">
            <XStack>
              {intervals.map((i) => (
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
                <View width={12} height={12} borderRadius={3} backgroundColor="#4CD964" />
                <Text fontSize={13} color="$gray10">Corrette</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <View width={12} height={12} borderRadius={3} backgroundColor="#FF3B30" />
                <Text fontSize={13} color="$gray10">Errate</Text>
              </XStack>
            </XStack>
          </YStack>

          <Separator marginVertical="$2" />

          {/* KPIs Section */}
          <YStack gap="$4">
            <Text fontSize={18} fontWeight="600" color="$color">Riepilogo</Text>
            
            {/* Primary KPIs - 2 columns */}
            <XStack gap="$3">
              <StatCard 
                title="Quiz Completati" 
                value={kpis.totalQuizzes} 
                icon="school"
                iconColor="#3B82F6"
              />
              <StatCard 
                title="Accuratezza" 
                value={`${kpis.accuracy.toFixed(1)}%`}
                icon="check-circle"
                iconColor="#4CD964"
              />
            </XStack>
            
            {/* Secondary KPIs - 2 columns */}
            <XStack gap="$3">
              <StatCard 
                title="Risposte Totali" 
                value={kpis.totalAnswers}
                icon="question-answer"
                iconColor="#FF9500"
              />
              <StatCard 
                title="Tempo Totale" 
                value={formatTime(kpis.totalTime)}
                icon="schedule"
                iconColor="#AF52DE"
              />
            </XStack>
            
            {/* Full width KPI */}
            <StatCard 
              title="Tempo Medio per Quiz" 
              value={formatTime(kpis.avgTimePerQuiz)}
              icon="timer"
              iconColor="#FF2D55"
              fullWidth
            />
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}

function formatTime(ms: number): string {
  if (!ms) return '0s';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
