import { Pressable } from 'react-native';
import { Text, View, XStack } from 'tamagui';

import type { StatisticsInterval } from '@/types';

type IntervalOption = {
  value: StatisticsInterval;
  label: string;
  testID: string;
};

type StatisticsIntervalSelectorProps = {
  interval: StatisticsInterval;
  intervals: IntervalOption[];
  onSelect: (value: StatisticsInterval) => void;
};

export function StatisticsIntervalSelector({
  interval,
  intervals,
  onSelect,
}: StatisticsIntervalSelectorProps) {
  return (
    <View bg="$backgroundStrong" p="$1" borderRadius={16}>
      <XStack>
        {intervals.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => onSelect(item.value)}
            style={{ flex: 1 }}
            testID={item.testID}
          >
            <View
              py="$2.5"
              px="$3"
              {...(interval === item.value && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              })}
              bg={interval === item.value ? '$background' : undefined}
              borderRadius={12}
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={13}
                fontWeight={interval === item.value ? '600' : '400'}
                color={interval === item.value ? '$color' : '$secondary'}
              >
                {item.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </XStack>
    </View>
  );
}
