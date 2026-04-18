import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { View } from 'tamagui';

import type { StackedBarData } from './types';

type StackBarProps = {
  item: StackedBarData;
  barWidth: number;
  heightFactor: number;
  borderRadius: number;
  animationDuration: number;
  totalHeight: number;
};

export function StackBar({
  item,
  barWidth,
  heightFactor,
  borderRadius,
  animationDuration,
  totalHeight,
}: StackBarProps) {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: totalHeight,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, totalHeight, animationDuration]);

  const getPosition = (index: number): number => {
    let position = 0;
    for (let currentIndex = 0; currentIndex < index; currentIndex++) {
      position += Math.max(0, item.stacks[currentIndex].value) * heightFactor;
    }
    return position;
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
      {item.stacks.map((stackItem, index) => {
        const segmentHeight = Math.max(0, stackItem.value) * heightFactor;
        if (segmentHeight === 0) return null;

        const isTopSegment = (() => {
          for (let currentIndex = stackCount - 1; currentIndex >= 0; currentIndex--) {
            if (item.stacks[currentIndex].value > 0) return currentIndex === index;
          }
          return false;
        })();

        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              bottom: getPosition(index),
              width: barWidth,
              height: segmentHeight,
              backgroundColor: stackItem.color,
              borderTopLeftRadius: isTopSegment ? borderRadius : 0,
              borderTopRightRadius: isTopSegment ? borderRadius : 0,
              borderBottomLeftRadius: index === 0 ? borderRadius : 0,
              borderBottomRightRadius: index === 0 ? borderRadius : 0,
            }}
          />
        );
      })}
    </Animated.View>
  );
}
