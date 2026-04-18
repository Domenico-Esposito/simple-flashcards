import { Text, View, XStack } from 'tamagui';

import type { LegendItem } from './types';

type LegendProps = {
  items: LegendItem[];
  textColor: string;
};

export function Legend({ items, textColor }: LegendProps) {
  return (
    <XStack justifyContent="center" gap="$5" marginTop="$3">
      {items.map((item, index) => (
        <XStack key={index} alignItems="center" gap="$2">
          <View width={12} height={12} borderRadius={3} backgroundColor={item.color} />
          <Text fontSize={13} color={textColor}>
            {item.label}
          </Text>
        </XStack>
      ))}
    </XStack>
  );
}
