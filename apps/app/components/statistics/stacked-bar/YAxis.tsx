import { Text, View } from 'tamagui';

import { STACKED_BAR_DEFAULTS } from './constants';

type YAxisProps = {
  height: number;
  niceMax: number;
  steps: number;
  textColor: string;
  topOffset?: number;
};

export function YAxis({ height, niceMax, steps, textColor, topOffset = 0 }: YAxisProps) {
  const ticks: number[] = [];
  const stepValue = niceMax / steps;

  for (let index = 0; index <= steps; index++) {
    ticks.push(Math.round(stepValue * index));
  }

  return (
    <View
      width={STACKED_BAR_DEFAULTS.yAxisLabelWidth}
      height={height + topOffset}
      justifyContent="flex-end"
    >
      {ticks.map((tick, index) => {
        const bottomPosition = (tick / niceMax) * height;
        return (
          <Text
            key={index}
            fontSize={10}
            color={textColor}
            style={{
              position: 'absolute',
              bottom: bottomPosition - 6,
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
