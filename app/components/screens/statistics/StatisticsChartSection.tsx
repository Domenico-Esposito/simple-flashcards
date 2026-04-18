import { Spinner, Text, View, YStack } from 'tamagui';

import { HistogramChart } from '@/components/statistics/HistogramChart';
import type { StatsSeries } from '@/types';

type StatisticsChartSectionProps = {
  title: string;
  loading: boolean;
  data: StatsSeries[];
};

export function StatisticsChartSection({ title, loading, data }: StatisticsChartSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize={18} fontWeight="600" color="$color">
        {title}
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
  );
}
