import { useEffect } from 'react';
import { Modal } from 'react-native';
import { Text, View, YStack, Button } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTranslation } from 'react-i18next';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';

export type QuizStats = {
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  totalCount: number;
  totalTimeMs: number;
};

type QuizCompletionCardProps = {
  stats: QuizStats;
  onClose: () => void;
};

export function QuizCompletionCard({ stats, onClose }: QuizCompletionCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  // Animation values
  const cardScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const checkmarkRotation = useSharedValue(-45);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);

  // Derived stats
  const { easyCount, mediumCount, hardCount, totalCount, totalTimeMs } = stats;
  const totalSeconds = Math.floor(totalTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  useEffect(() => {
    // Staggered animation sequence
    cardOpacity.value = withTiming(1, { duration: 300 });
    cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Checkmark animation after card appears
    checkmarkScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 150 }));
    checkmarkRotation.value = withDelay(300, withSpring(0, { damping: 10, stiffness: 100 }));

    // Stats fade in
    statsOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    statsTranslateY.value = withDelay(500, withSpring(0, { damping: 15, stiffness: 100 }));

    // Button fade in
    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));
    buttonTranslateY.value = withDelay(700, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [
    buttonOpacity,
    buttonTranslateY,
    cardOpacity,
    cardScale,
    checkmarkRotation,
    checkmarkScale,
    statsOpacity,
    statsTranslateY,
  ]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }, { rotate: `${checkmarkRotation.value}deg` }],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark ? 'dark' : 'light');
  const cardBg = colors.cardBg;
  const textPrimary = isDark ? '#FFFFFF' : '#171717';
  const textSecondary = isDark ? '#A3A3A3' : '#737373';

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$4"
        testID="quiz-completion-card"
      >
        <Animated.View
          style={[
            {
              width: '100%',
              maxWidth: 360,
            },
            cardAnimatedStyle,
          ]}
        >
          <View backgroundColor={cardBg} borderRadius="$10" padding="$6" elevation={10}>
            {/* Checkmark icon */}
            <View alignItems="center" marginBottom="$4">
              <Animated.View
                style={[
                  {
                    marginTop: -80,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  checkmarkAnimatedStyle,
                ]}
              >
                <Text fontSize={80}>🎉</Text>
              </Animated.View>
            </View>

            {/* Title */}
            <Text
              fontSize={24}
              fontWeight="700"
              color={textPrimary}
              textAlign="center"
              marginBottom="$2"
            >
              {t('quiz.completionTitle')}
            </Text>
            <Text fontSize={14} color={textSecondary} textAlign="center" marginBottom="$5">
              {t('quiz.completionSubtitle', { count: totalCount })}
            </Text>

            {/* Stats grid */}
            <Animated.View style={statsAnimatedStyle}>
              <YStack gap="$3" marginBottom="$5">
                {/* Total cards - highlighted */}
                <View
                  backgroundColor={colors.accentBgTint}
                  borderRadius="$4"
                  padding="$4"
                  alignItems="center"
                >
                  <Text fontSize={40} fontWeight="800" color={colors.accent}>
                    {totalCount}
                  </Text>
                  <Text fontSize={13} color={textSecondary} marginTop="$1">
                    {t('quiz.totalCards')}
                  </Text>
                </View>

                {/* Easy / Medium / Hard row */}
                <View flexDirection="row" gap="$2">
                  <View
                    flex={1}
                    backgroundColor={colors.successBgTint}
                    borderRadius="$4"
                    padding="$3"
                    alignItems="center"
                  >
                    <View flexDirection="row" alignItems="center" gap="$1">
                      <MaterialIcons name="sentiment-satisfied" size={18} color={colors.success} />
                      <Text fontSize={22} fontWeight="700" color={colors.success}>
                        {easyCount}
                      </Text>
                    </View>
                    <Text fontSize={11} color={textSecondary} marginTop="$1">
                      {t('quiz.easy')}
                    </Text>
                  </View>

                  <View
                    flex={1}
                    backgroundColor={colors.warningBgTint}
                    borderRadius="$4"
                    padding="$3"
                    alignItems="center"
                  >
                    <View flexDirection="row" alignItems="center" gap="$1">
                      <MaterialIcons name="sentiment-neutral" size={18} color={colors.warning} />
                      <Text fontSize={22} fontWeight="700" color={colors.warning}>
                        {mediumCount}
                      </Text>
                    </View>
                    <Text fontSize={11} color={textSecondary} marginTop="$1">
                      {t('quiz.medium')}
                    </Text>
                  </View>

                  <View
                    flex={1}
                    backgroundColor={colors.errorBgTint}
                    borderRadius="$4"
                    padding="$3"
                    alignItems="center"
                  >
                    <View flexDirection="row" alignItems="center" gap="$1">
                      <MaterialIcons name="sentiment-dissatisfied" size={18} color={colors.error} />
                      <Text fontSize={22} fontWeight="700" color={colors.error}>
                        {hardCount}
                      </Text>
                    </View>
                    <Text fontSize={11} color={textSecondary} marginTop="$1">
                      {t('quiz.hard')}
                    </Text>
                  </View>
                </View>

                {/* Time row */}
                <View
                  backgroundColor={colors.chipBg}
                  borderRadius="$4"
                  padding="$3"
                  alignItems="center"
                >
                  <View flexDirection="row" alignItems="center" gap="$2">
                    <MaterialIcons name="timer" size={20} color={textSecondary} />
                    <Text fontSize={20} fontWeight="600" color={textPrimary}>
                      {timeString}
                    </Text>
                  </View>
                  <Text fontSize={12} color={textSecondary} marginTop="$1">
                    {t('quiz.totalTime')}
                  </Text>
                </View>
              </YStack>
            </Animated.View>

            {/* Close button */}
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                size="$5"
                theme="active"
                borderRadius="$4"
                onPress={onClose}
                fontWeight="600"
                testID="quiz-completion-close-button"
                accessibilityLabel="quiz-completion-close-button"
              >
                {t('quiz.closeButton')}
              </Button>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
