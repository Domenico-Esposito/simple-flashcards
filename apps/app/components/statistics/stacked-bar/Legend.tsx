import { Text, View, XStack } from 'tamagui';

import type { LegendItem } from './types';

type LegendProps = {
  items: LegendItem[];
  textColor: string;
};

export function Legend({ items, textColor }: LegendProps) {
  return (
    <XStack gap="$5" mt="$3" justifyContent="center">
      {items.map((item, index) => (
        <XStack key={index} gap="$2" alignItems="center">
          <View width={12} height={12} borderRadius={3} style={{ backgroundColor: item.color }} />
          <Text fontSize={13} style={{ color: textColor }}>
            {item.label}
          </Text>
        </XStack>
      ))}
    </XStack>
  );
}
