import Svg, { Line } from 'react-native-svg';
import { View } from 'tamagui';

type GridLinesProps = {
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

export function GridLines({ height, niceMax, steps, gridColor, showXAxis }: GridLinesProps) {
  const ticks: number[] = [];
  const stepValue = niceMax / steps;

  for (let index = 1; index <= steps; index++) {
    ticks.push(Math.round(stepValue * index));
  }

  return (
    <>
      {ticks.map((tick, index) => {
        const bottomPosition = (tick / niceMax) * height;
        return (
          <View
            key={index}
            position="absolute"
            bottom={bottomPosition}
            left={0}
            right={0}
            height={1}
          >
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
