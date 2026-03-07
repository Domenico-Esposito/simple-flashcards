/**
 * Self-contained StackedBarChart component.
 * Inspired by react-native-gifted-charts RenderStackBars approach:
 * stacked segments via absolute positioning with animated height reveal.
 */
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, type TextStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { View, Text, XStack, useTheme } from 'tamagui';

// ── Types ──────────────────────────────────────────────────────────────────

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
  /** Legend items displayed below the chart */
  legend?: LegendItem[];
  /** Show Y-axis with tick values (default: true) */
  showYAxis?: boolean;
  /** Show X-axis base line (default: true) */
  showXAxis?: boolean;
  /** Number of Y-axis tick intervals (default: 4) */
  yAxisSteps?: number;
  /** Show horizontal grid lines at Y-axis ticks (default: true) */
  showGridLines?: boolean;
  /** Color for grid lines and axes (default: auto based on theme) */
  gridColor?: string;
  /** Color for text labels: Y-axis ticks, X-axis labels, values, legend (default: auto based on theme) */
  textColor?: string;
};

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULTS = {
  height: 200,
  barWidth: 24,
  spacing: 12,
  borderRadius: 4,
  animationDuration: 600,
  yAxisLabelWidth: 32,
  yAxisSteps: 4,
} as const;

const GRID_COLOR_LIGHT = '#c0c0c0';
const GRID_COLOR_DARK = '#555555';
const TEXT_COLOR_LIGHT = '#666666';
const TEXT_COLOR_DARK = '#a0a0a0';

// ── Utils ──────────────────────────────────────────────────────────────────

/**
 * Computes a "nice" scale for the Y-axis: a rounded max, a human-friendly
 * step size (multiples of 1, 2, 5, 10 …) and the resulting number of steps.
 * The step size is always ≥ 1 so tick labels stay integer.
 */
function computeNiceScale(
  rawMax: number,
  targetSteps: number,
): { niceMax: number; niceStep: number; steps: number } {
  if (rawMax <= 0) return { niceMax: targetSteps, niceStep: 1, steps: targetSteps };

  const roughStep = rawMax / targetSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  // Ensure integer ticks (useful for count-based data like flashcards)
  niceStep = Math.max(1, niceStep);

  const niceMax = Math.ceil(rawMax / niceStep) * niceStep;
  const steps = Math.round(niceMax / niceStep);

  return { niceMax, niceStep, steps };
}

// ── Single bar renderer (core logic from RenderStackBars) ──────────────────

type BarProps = {
  item: StackedBarData;
  barWidth: number;
  heightFactor: number;
  borderRadius: number;
  animationDuration: number;
  totalHeight: number;
};

function StackBar({
  item,
  barWidth,
  heightFactor,
  borderRadius,
  animationDuration,
  totalHeight,
}: BarProps) {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: totalHeight,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, totalHeight, animationDuration]);

  const getPosition = (index: number): number => {
    let pos = 0;
    for (let i = 0; i < index; i++) {
      pos += Math.max(0, item.stacks[i].value) * heightFactor;
    }
    return pos;
  };

  const stackCount = item.stacks.length;

  return (
    <Animated.View
      style={{
        width: barWidth,
        height: animatedHeight,
        overflow: 'hidden',
        borderRadius,
      }}
    >
      {item.stacks.map((stackItem, idx) => {
        const segmentHeight = Math.max(0, stackItem.value) * heightFactor;
        if (segmentHeight === 0) return null;

        const isTopSegment = (() => {
          for (let j = stackCount - 1; j >= 0; j--) {
            if (item.stacks[j].value > 0) return j === idx;
          }
          return false;
        })();
        const isBottomSegment = idx === 0;

        return (
          <View
            key={idx}
            style={{
              position: 'absolute',
              bottom: getPosition(idx),
              width: barWidth,
              height: segmentHeight,
              backgroundColor: stackItem.color,
              borderTopLeftRadius: isTopSegment ? borderRadius : 0,
              borderTopRightRadius: isTopSegment ? borderRadius : 0,
              borderBottomLeftRadius: isBottomSegment ? borderRadius : 0,
              borderBottomRightRadius: isBottomSegment ? borderRadius : 0,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

// ── Y-Axis ─────────────────────────────────────────────────────────────────

type YAxisProps = {
  height: number;
  niceMax: number;
  steps: number;
  textColor: string;
  topOffset?: number;
};

function YAxis({ height, niceMax, steps, textColor, topOffset = 0 }: YAxisProps) {
  const ticks: number[] = [];
  const stepValue = niceMax / steps;
  for (let i = 0; i <= steps; i++) {
    ticks.push(Math.round(stepValue * i));
  }

  return (
    <View width={DEFAULTS.yAxisLabelWidth} height={height + topOffset} justifyContent="flex-end">
      {ticks.map((tick, i) => {
        const bottomPos = (tick / niceMax) * height;
        return (
          <Text
            key={i}
            fontSize={10}
            color={textColor}
            style={{
              position: 'absolute',
              bottom: bottomPos - 6,
              right: 4,
            }}
          >
            {tick}
          </Text>
        );
      })}
    </View>
  );
}

// ── Grid lines ─────────────────────────────────────────────────────────────

type GridProps = {
  height: number;
  niceMax: number;
  steps: number;
  gridColor: string;
  showXAxis: boolean;
};

function DashedLine({ color, dashArray = '4,4' }: { color: string; dashArray?: string }) {
  return (
    <Svg height={1} width="100%" style={{ position: 'absolute' }}>
      <Line
        x1="0"
        y1="0.5"
        x2="100%"
        y2="0.5"
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
      />
    </Svg>
  );
}

function GridLines({ height, niceMax, steps, gridColor, showXAxis }: GridProps) {
  const ticks: number[] = [];
  const stepValue = niceMax / steps;
  // Grid lines for non-zero ticks only (X-axis covers the 0-line)
  for (let i = 1; i <= steps; i++) {
    ticks.push(Math.round(stepValue * i));
  }

  return (
    <>
      {ticks.map((tick, i) => {
        const bottomPos = (tick / niceMax) * height;
        return (
          <View key={i} position="absolute" bottom={bottomPos} left={0} right={0} height={1}>
            <DashedLine color={gridColor} />
          </View>
        );
      })}
      {showXAxis && (
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height={1}
          backgroundColor={gridColor}
        />
      )}
    </>
  );
}

// ── Legend ──────────────────────────────────────────────────────────────────

function Legend({ items, textColor }: { items: LegendItem[]; textColor: string }) {
  return (
    <XStack justifyContent="center" gap="$5" marginTop="$3">
      {items.map((item, i) => (
        <XStack key={i} alignItems="center" gap="$2">
          <View width={12} height={12} borderRadius={3} backgroundColor={item.color} />
          <Text fontSize={13} color={textColor}>
            {item.label}
          </Text>
        </XStack>
      ))}
    </XStack>
  );
}

// ── Main chart component ───────────────────────────────────────────────────

export function StackedBarChart({
  data,
  height = DEFAULTS.height,
  barWidth = DEFAULTS.barWidth,
  spacing = DEFAULTS.spacing,
  borderRadius = DEFAULTS.borderRadius,
  animationDuration = DEFAULTS.animationDuration,
  labelStyle,
  showValues = false,
  legend,
  showYAxis = true,
  showXAxis = true,
  yAxisSteps = DEFAULTS.yAxisSteps,
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
    ...data.map((d) => d.stacks.reduce((sum, s) => sum + Math.max(0, s.value), 0)),
    1,
  );

  const { niceMax, steps: computedSteps } = computeNiceScale(rawMax, yAxisSteps);
  const heightFactor = height / niceMax;

  const xAxisLabelHeight = 20;
  const valueTopHeight = showValues ? 16 : 0;
  const topPadding = borderRadius + 2;

  const chartContent = (
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
        {/* Grid & axis lines (absolute, behind bars) */}
        <View
          style={{
            position: 'absolute',
            top: valueTopHeight + topPadding,
            left: 0,
            right: 0,
            height,
          }}
        >
          {showGridLines && (
            <GridLines
              height={height}
              niceMax={niceMax}
              steps={computedSteps}
              gridColor={resolvedGridColor}
              showXAxis={showXAxis}
            />
          )}
          {!showGridLines && showXAxis && (
            <View
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height={1}
              backgroundColor={resolvedGridColor}
            />
          )}
        </View>

        {/* Bars + X-axis labels (horizontally scrollable) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View
              flexDirection="row"
              alignItems="flex-end"
              height={height + valueTopHeight + topPadding}
              paddingLeft={4}
            >
              {data.map((item, index) => {
                const totalHeight = item.stacks.reduce(
                  (sum, s) => sum + Math.max(0, s.value) * heightFactor,
                  0,
                );
                const totalValue = item.stacks.reduce((sum, s) => sum + Math.max(0, s.value), 0);

                return (
                  <View key={index} alignItems="center" marginHorizontal={spacing}>
                    {showValues && totalValue > 0 && (
                      <Text fontSize={10} color={resolvedTextColor} marginBottom={2}>
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

            {/* X-axis labels */}
            <View flexDirection="row" paddingLeft={4} height={xAxisLabelHeight} alignItems="center">
              {data.map((item, index) => (
                <View key={index} width={barWidth} alignItems="center" marginHorizontal={spacing}>
                  <Text
                    fontSize={11}
                    color={resolvedTextColor}
                    style={labelStyle}
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
  );

  return (
    <View overflow="hidden">
      {chartContent}
      {legend && legend.length > 0 && <Legend items={legend} textColor={resolvedTextColor} />}
    </View>
  );
}
