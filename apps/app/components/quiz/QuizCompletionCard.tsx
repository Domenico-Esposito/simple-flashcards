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
import { getColors } from '@/theme/colors';
import type { QuizStats } from '@/components/quiz/types';

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
        px="$4"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
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
          <View p="$6" borderRadius={40} style={{ backgroundColor: cardBg, elevation: 10 }}>
            {/* Checkmark icon */}
            <View mb="$4" alignItems="center">
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
                  mb="$2"
                  textAlign="center"
                  style={{ color: textPrimary }}
                >
                  {t('quiz.completionTitle')}
                </Text>
            <Text fontSize={14} mb="$5" textAlign="center" style={{ color: textSecondary }}>
              {t('quiz.completionSubtitle', { count: totalCount })}
            </Text>

            {/* Stats grid */}
            <Animated.View style={statsAnimatedStyle}>
              <YStack gap="$3" mb="$5">
                {/* Total cards - highlighted */}
                <View
                  p="$4"
                  style={{ backgroundColor: colors.accentBgTint }}
                  borderRadius={16}
                  alignItems="center"
                >
                  <Text fontSize={40} fontWeight="800" style={{ color: colors.accent }}>
                    {totalCount}
                  </Text>
                  <Text fontSize={13} mt="$1" style={{ color: textSecondary }}>
                    {t('quiz.totalCards')}
                  </Text>
                </View>

                {/* Easy / Medium / Hard row */}
                <View gap="$2" flexDirection="row">
                  <View
                    flex={1}
                    p="$3"
                    style={{
                      backgroundColor: colors.successBgTint,
                    }}
                    borderRadius={16}
                    alignItems="center"
                  >
                    <View gap="$1" flexDirection="row" alignItems="center">
                      <MaterialIcons name="sentiment-satisfied" size={18} color={colors.success} />
                      <Text fontSize={22} fontWeight="700" style={{ color: colors.success }}>
                        {easyCount}
                      </Text>
                    </View>
                    <Text fontSize={11} mt="$1" style={{ color: textSecondary }}>
                      {t('quiz.easy')}
                    </Text>
                  </View>

                  <View
                    flex={1}
                    p="$3"
                    style={{
                      backgroundColor: colors.warningBgTint,
                    }}
                    borderRadius={16}
                    alignItems="center"
                  >
                    <View gap="$1" flexDirection="row" alignItems="center">
                      <MaterialIcons name="sentiment-neutral" size={18} color={colors.warning} />
                      <Text fontSize={22} fontWeight="700" style={{ color: colors.warning }}>
                        {mediumCount}
                      </Text>
                    </View>
                    <Text fontSize={11} mt="$1" style={{ color: textSecondary }}>
                      {t('quiz.medium')}
                    </Text>
                  </View>

                  <View
                    flex={1}
                    p="$3"
                    style={{
                      backgroundColor: colors.errorBgTint,
                    }}
                    borderRadius={16}
                    alignItems="center"
                  >
                    <View gap="$1" flexDirection="row" alignItems="center">
                      <MaterialIcons name="sentiment-dissatisfied" size={18} color={colors.error} />
                      <Text fontSize={22} fontWeight="700" style={{ color: colors.error }}>
                        {hardCount}
                      </Text>
                    </View>
                    <Text fontSize={11} mt="$1" style={{ color: textSecondary }}>
                      {t('quiz.hard')}
                    </Text>
                  </View>
                </View>

                {/* Time row */}
                <View
                  p="$3"
                  borderRadius={16}
                  alignItems="center"
                  style={{ backgroundColor: colors.chipBg }}
                >
                  <View gap="$2" flexDirection="row" alignItems="center">
                    <MaterialIcons name="timer" size={20} color={textSecondary} />
                    <Text fontSize={20} fontWeight="600" style={{ color: textPrimary }}>
                      {timeString}
                    </Text>
                  </View>
                  <Text fontSize={12} mt="$1" style={{ color: textSecondary }}>
                    {t('quiz.totalTime')}
                  </Text>
                </View>
              </YStack>
            </Animated.View>

            {/* Close button */}
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                size="$5"
                themeInverse
                onPress={onClose}
                fontWeight="600"
                testID="quiz-completion-close-button"
                accessibilityLabel="quiz-completion-close-button"
                borderRadius={16}
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
