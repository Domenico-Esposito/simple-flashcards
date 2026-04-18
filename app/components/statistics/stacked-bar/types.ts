import type { TextStyle } from 'react-native';

export type StackItem = {
  value: number;
  color: string;
};

export type StackedBarData = {
  label: string;
  stacks: StackItem[];
};

export type LegendItem = {
  label: string;
  color: string;
};

export type StackedBarChartProps = {
  data: StackedBarData[];
  height?: number;
  barWidth?: number;
  spacing?: number;
  borderRadius?: number;
  animationDuration?: number;
  labelStyle?: TextStyle;
  showValues?: boolean;
  legend?: LegendItem[];
  showYAxis?: boolean;
  showXAxis?: boolean;
  yAxisSteps?: number;
  showGridLines?: boolean;
  gridColor?: string;
  textColor?: string;
};
