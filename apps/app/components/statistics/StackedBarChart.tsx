import { ScrollView } from 'react-native';
import { Text, View, XStack, useTheme } from 'tamagui';

import {
  GRID_COLOR_DARK,
  GRID_COLOR_LIGHT,
  STACKED_BAR_DEFAULTS,
  TEXT_COLOR_DARK,
  TEXT_COLOR_LIGHT,
} from './stacked-bar/constants';
import { computeNiceScale } from './stacked-bar/computeNiceScale';
import { GridLines } from './stacked-bar/GridLines';
import { Legend } from './stacked-bar/Legend';
import { StackBar } from './stacked-bar/StackBar';
import type { StackedBarChartProps } from './stacked-bar/types';
import { YAxis } from './stacked-bar/YAxis';

export type { LegendItem, StackedBarData, StackedBarChartProps } from './stacked-bar/types';

export function StackedBarChart({
  data,
  height = STACKED_BAR_DEFAULTS.height,
  barWidth = STACKED_BAR_DEFAULTS.barWidth,
  spacing = STACKED_BAR_DEFAULTS.spacing,
  borderRadius = STACKED_BAR_DEFAULTS.borderRadius,
  animationDuration = STACKED_BAR_DEFAULTS.animationDuration,
  labelStyle,
  showValues = false,
  legend,
  showYAxis = true,
  showXAxis = true,
  yAxisSteps = STACKED_BAR_DEFAULTS.yAxisSteps,
  showGridLines = true,
  gridColor,
  textColor,
}: StackedBarChartProps) {
  const theme = useTheme();

  if (!data || data.length === 0) return null;

  const isDark = theme.background?.val
    ? theme.background.val.toString().replace('#', '').substring(0, 2) <= '40'
    : false;
  const resolvedGridColor = gridColor ?? (isDark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT);
  const resolvedTextColor = textColor ?? (isDark ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT);

  const rawMax = Math.max(
    ...data.map((item) => item.stacks.reduce((sum, stack) => sum + Math.max(0, stack.value), 0)),
    1,
  );

  const { niceMax, steps: computedSteps } = computeNiceScale(rawMax, yAxisSteps);
  const heightFactor = height / niceMax;

  const xAxisLabelHeight = 20;
  const valueTopHeight = showValues ? 16 : 0;
  const topPadding = borderRadius + 2;

  return (
    <View overflow="hidden">
      <XStack>
        {showYAxis && (
          <YAxis
            height={height}
            niceMax={niceMax}
            steps={computedSteps}
            textColor={resolvedTextColor}
            topOffset={valueTopHeight + topPadding}
          />
        )}

        <View
          flex={1}
          height={height + xAxisLabelHeight + valueTopHeight + topPadding}
          overflow="hidden"
        >
          <View
            style={{
              position: 'absolute',
              top: valueTopHeight + topPadding,
              left: 0,
              right: 0,
              height,
            }}
          >
            {showGridLines ? (
              <GridLines
                height={height}
                niceMax={niceMax}
                steps={computedSteps}
                gridColor={resolvedGridColor}
                showXAxis={showXAxis}
              />
            ) : (
              showXAxis && (
                <View
                  height={1}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: resolvedGridColor }}
                />
              )
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View
                height={height + valueTopHeight + topPadding}
                style={{ flexDirection: 'row', alignItems: 'flex-end', paddingLeft: 4 }}
              >
                {data.map((item, index) => {
                  const totalHeight = item.stacks.reduce(
                    (sum, stack) => sum + Math.max(0, stack.value) * heightFactor,
                    0,
                  );
                  const totalValue = item.stacks.reduce(
                    (sum, stack) => sum + Math.max(0, stack.value),
                    0,
                  );

                  return (
                    <View key={index} style={{ alignItems: 'center', marginHorizontal: spacing }}>
                      {showValues && totalValue > 0 && (
                        <Text fontSize={10} style={{ color: resolvedTextColor, marginBottom: 2 }}>
                          {totalValue}
                        </Text>
                      )}
                      <StackBar
                        item={item}
                        barWidth={barWidth}
                        heightFactor={heightFactor}
                        borderRadius={borderRadius}
                        animationDuration={animationDuration}
                        totalHeight={totalHeight}
                      />
                    </View>
                  );
                })}
              </View>

              <View
                height={xAxisLabelHeight}
                style={{ flexDirection: 'row', paddingLeft: 4, alignItems: 'center' }}
              >
                {data.map((item, index) => (
                  <View key={index} width={barWidth} style={{ alignItems: 'center', marginHorizontal: spacing }}>
                    <Text
                      fontSize={11}
                      style={[{ color: resolvedTextColor }, labelStyle]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </XStack>

      {legend && legend.length > 0 && <Legend items={legend} textColor={resolvedTextColor} />}
    </View>
  );
}
