import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Text, View, YStack, Button } from 'tamagui';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, Easing, interpolate } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type QuizStats = {
	correctCount: number;
	incorrectCount: number;
	totalCount: number;
	totalTimeMs: number;
};

type QuizCompletionCardProps = {
	stats: QuizStats;
	onClose: () => void;
};

export function QuizCompletionCard({ stats, onClose }: QuizCompletionCardProps) {
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
	const confettiOpacity = useSharedValue(0);

	// Derived stats
	const { correctCount, incorrectCount, totalCount, totalTimeMs } = stats;
	const successRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
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

		// Confetti pulse
		confettiOpacity.value = withDelay(400, withSequence(withTiming(1, { duration: 200 }), withTiming(0.6, { duration: 400 }), withTiming(1, { duration: 400 })));

		// Stats fade in
		statsOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
		statsTranslateY.value = withDelay(500, withSpring(0, { damping: 15, stiffness: 100 }));

		// Button fade in
		buttonOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));
		buttonTranslateY.value = withDelay(700, withSpring(0, { damping: 15, stiffness: 100 }));
	}, []);

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		opacity: cardOpacity.value,
		transform: [{ scale: cardScale.value }],
	}));

	const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkmarkScale.value }, { rotate: `${checkmarkRotation.value}deg` }],
	}));

	const confettiAnimatedStyle = useAnimatedStyle(() => ({
		opacity: confettiOpacity.value,
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
	const cardBg = isDark ? '#171717' : '#FFFFFF';
	const textPrimary = isDark ? '#FFFFFF' : '#171717';
	const textSecondary = isDark ? '#A3A3A3' : '#737373';
	const successColor = '#4CD964';
	const errorColor = '#FF3B30';
	const accentColor = isDark ? '#60A5FA' : '#3B82F6';

	return (
		<View
			position="absolute"
			top={0}
			left={0}
			right={0}
			bottom={0}
			backgroundColor="rgba(0,0,0,0.5)"
			justifyContent="center"
			alignItems="center"
			paddingHorizontal="$4"
			zIndex={100}>
			<Animated.View
				style={[
					{
						width: SCREEN_WIDTH - 48,
						maxWidth: 360,
						backgroundColor: cardBg,
						borderRadius: 24,
						padding: 32,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 10 },
						shadowOpacity: 0.3,
						shadowRadius: 20,
						elevation: 15,
					},
					cardAnimatedStyle,
				]}>
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
						]}>
						<Text fontSize={80}>🎉</Text>
					</Animated.View>
				</View>

				{/* Title */}
				<Text fontSize={24} fontWeight="700" color={textPrimary} textAlign="center" marginBottom="$2">
					Quiz completato!
				</Text>
				<Text fontSize={14} color={textSecondary} textAlign="center" marginBottom="$5">
					Hai risposto a tutte le domande
				</Text>

				{/* Stats grid */}
				<Animated.View style={statsAnimatedStyle}>
					<YStack gap="$3" marginBottom="$5">
						{/* Success rate - highlighted */}
						<View backgroundColor={isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)'} borderRadius={16} padding="$4" alignItems="center">
							<Text fontSize={40} fontWeight="800" color={accentColor}>
								{successRate}%
							</Text>
							<Text fontSize={13} color={textSecondary} marginTop="$1">
								Tasso di successo
							</Text>
						</View>

						{/* Correct / Incorrect row */}
						<View flexDirection="row" gap="$3">
							<View
								flex={1}
								backgroundColor={isDark ? 'rgba(76, 217, 100, 0.15)' : 'rgba(76, 217, 100, 0.1)'}
								borderRadius={12}
								padding="$3"
								alignItems="center">
								<View flexDirection="row" alignItems="center" gap="$1">
									<MaterialIcons name="check-circle" size={20} color={successColor} />
									<Text fontSize={24} fontWeight="700" color={successColor}>
										{correctCount}
									</Text>
								</View>
								<Text fontSize={12} color={textSecondary} marginTop="$1">
									Corrette
								</Text>
							</View>

							<View
								flex={1}
								backgroundColor={isDark ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.1)'}
								borderRadius={12}
								padding="$3"
								alignItems="center">
								<View flexDirection="row" alignItems="center" gap="$1">
									<MaterialIcons name="cancel" size={20} color={errorColor} />
									<Text fontSize={24} fontWeight="700" color={errorColor}>
										{incorrectCount}
									</Text>
								</View>
								<Text fontSize={12} color={textSecondary} marginTop="$1">
									Errate
								</Text>
							</View>
						</View>

						{/* Time row */}
						<View backgroundColor={isDark ? '#262626' : '#F5F5F5'} borderRadius={12} padding="$3" alignItems="center">
							<View flexDirection="row" alignItems="center" gap="$2">
								<MaterialIcons name="timer" size={20} color={textSecondary} />
								<Text fontSize={20} fontWeight="600" color={textPrimary}>
									{timeString}
								</Text>
							</View>
							<Text fontSize={12} color={textSecondary} marginTop="$1">
								Tempo totale
							</Text>
						</View>
					</YStack>
				</Animated.View>

				{/* Close button */}
				<Animated.View style={buttonAnimatedStyle}>
					<Button size="$5" theme="active" borderRadius="$10" onPress={onClose} fontWeight="600">
						Chiudi quiz
					</Button>
				</Animated.View>
			</Animated.View>
		</View>
	);
}
