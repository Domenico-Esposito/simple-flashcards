import { StatsSeries } from '@/types';
import { View, Text } from 'tamagui';
import { chartColors } from '@/theme/colors';
import { useTranslation } from 'react-i18next';
import { StackedBarChart, type StackedBarData, type LegendItem } from './StackedBarChart';

type Props = {
  data: StatsSeries[];
  height?: number;
};

export function HistogramChart({ data, height = 200 }: Props) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View height={height} alignItems="center" justifyContent="center">
        <Text color="$gray10" fontSize={14}>
          {t('stats.noData')}
        </Text>
      </View>
    );
  }

  const chartData: StackedBarData[] = data.map((d) => ({
    label:
      d.period.length === 10
        ? d.period.substring(8) // DD
        : d.period.length === 7
          ? d.period.substring(5) // MM
          : d.period,
    stacks: [
      { value: d.easy, color: chartColors.easy },
      { value: d.medium, color: chartColors.medium },
      { value: d.hard, color: chartColors.hard },
    ],
  }));

  const legend: LegendItem[] = [
    { label: t('stats.easy'), color: chartColors.easy },
    { label: t('stats.medium'), color: chartColors.medium },
    { label: t('stats.hard'), color: chartColors.hard },
  ];

  return <StackedBarChart data={chartData} height={height} legend={legend} />;
}
