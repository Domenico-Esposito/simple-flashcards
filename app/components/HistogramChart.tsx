import { StackedBarChart } from 'react-native-chart-kit';
import { StatsSeries } from '@/types';
import { useTheme, View, Text } from 'tamagui';
import { chartColors, getColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

type Props = {
  data: StatsSeries[];
  width?: number;
  height?: number;
};

export function HistogramChart({ data, width, height = 200 }: Props) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const [containerWidth, setContainerWidth] = useState(0);
  const { t } = useTranslation();

  const chartWidth = width || containerWidth;

  if (!data || data.length === 0) {
    return (
        <View height={height} alignItems="center" justifyContent="center">
            <Text color="$gray10" fontSize={14}>{t('stats.noData')}</Text>
        </View>
    );
  }

  const chartData = {
    labels: data.map(d => {
        if (d.period.length === 10) return d.period.substring(8); // DD
        if (d.period.length === 7) return d.period.substring(5); // MM
        return d.period;
    }),
    legend: [],
    data: data.map(d => [d.easy, d.medium, d.hard]),
    barColors: chartColors.barColors
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(150, 150, 150, ${opacity * 0.5})`,
    labelColor: () => (theme.gray10?.val as string) || colors.muted,
    style: {
      borderRadius: 16
    },
    barPercentage: 0.6,
    propsForLabels: {
      fontSize: 11,
    },
  };

  return (
    <View
      alignItems="center"
      justifyContent="center"
      marginLeft={-16}
      onLayout={(e: any) => setContainerWidth(e.nativeEvent.layout.width)}
    >
        {chartWidth > 0 && (
          <>
            {/* @ts-expect-error react-native-chart-kit class types incompatible with React 18 JSX */}
            <StackedBarChart
              data={chartData}
              width={chartWidth}
              height={height}
              chartConfig={chartConfig}
              hideLegend={true}
              style={{
                borderRadius: 16,
              }}
            />
          </>
        )}
    </View>
  );
}
