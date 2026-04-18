import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text, View } from 'tamagui';

import { SkiaCardShadow } from '@/components/ui/SkiaCardShadow';
import { getColors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DifficultyRating } from '@/types';

const BUTTON_CONFIG: Record<
  DifficultyRating,
  {
    icon: 'sentiment-dissatisfied' | 'sentiment-neutral' | 'sentiment-satisfied';
    colorKey: 'error' | 'warning' | 'success';
    shadowKey: 'errorShadow' | 'warningShadow' | 'successShadow';
    labelKey: string;
  }
> = {
  hard: {
    icon: 'sentiment-dissatisfied',
    colorKey: 'error',
    shadowKey: 'errorShadow',
    labelKey: 'quiz.hard',
  },
  medium: {
    icon: 'sentiment-neutral',
    colorKey: 'warning',
    shadowKey: 'warningShadow',
    labelKey: 'quiz.medium',
  },
  easy: {
    icon: 'sentiment-satisfied',
    colorKey: 'success',
    shadowKey: 'successShadow',
    labelKey: 'quiz.easy',
  },
};

type DifficultyButtonProps = {
  type: DifficultyRating;
  onPress: () => void;
  currentRating?: DifficultyRating;
  testID: string;
};

export function DifficultyButton({ type, onPress, currentRating, testID }: DifficultyButtonProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 150 }, (finished) => {
        if (finished) {
          runOnJS(onPress)();
        }
      }),
    );
  };

  const config = BUTTON_CONFIG[type];
  const bgColor = colors[config.colorKey];
  const shadowColor = colors[config.shadowKey];
  const label = t(config.labelKey);
  const opacity = !currentRating ? 1 : currentRating === type ? 1 : 0.4;

  return (
    <Pressable
      onPress={handlePress}
      style={{ flex: 1 }}
      testID={testID}
      accessibilityLabel={testID}
    >
      <Animated.View style={[animatedStyle, { opacity, overflow: 'visible' }]}>
        <SkiaCardShadow
          borderRadius={12}
          backgroundColor={bgColor}
          shadows={[{ dx: 0, dy: 4, blur: 8, color: shadowColor }]}
          style={{ height: 48 }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <MaterialIcons name={config.icon} size={20} color={colors.onAccent} />
            <Text color={colors.onAccent} fontWeight="600" fontSize={13}>
              {label}
            </Text>
          </View>
        </SkiaCardShadow>
      </Animated.View>
    </Pressable>
  );
}
