import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Button, Heading, Stack, Text, View, XStack, YStack, ZStack, useTheme } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface HeaderProps {
	title: string;
	subtitle?: string;
	showBackButton?: boolean;
	actions?: React.ReactNode[];
	onBackPress?: () => void;
	isModal?: boolean; // New prop to handle modal spacing
}

/**
 * Reusable header component with consistent styling across all screens
 */
export function Header({ title, subtitle, showBackButton = true, actions = [], onBackPress, isModal = false }: HeaderProps) {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const theme = useTheme();
	const headerIconColor = (theme.primary as any)?.val ?? (theme.color as any)?.val;

	const handleBackPress = () => {
		if (onBackPress) {
			onBackPress();
		} else {
			router.back();
		}
	};

	// Determine padding based on platform and modal state
	const getTopPadding = () => {
		if (isModal && Platform.OS === 'ios') {
			// iOS modals don't need safe area padding
			return '$2';
		}
		// All other cases (Android modals, regular screens) need safe area padding
		return insets.top;
	};

	return (
		<Stack paddingTop={getTopPadding()} backgroundColor={'$background'}>
			<ZStack
				paddingTop="$4"
				paddingBottom="$2"
				paddingHorizontal="$4"
				gap="$2"
				minHeight={56} // Consistent header height
			>
				<YStack flex={1} alignItems="center" justifyContent="center" absolute>
					<Heading size="$4" numberOfLines={1} color="$color" fontWeight="600">
						{title}
					</Heading>
					{subtitle && (
						<Text fontSize={14} color="$secondary" numberOfLines={1}>
							{subtitle}
						</Text>
					)}
				</YStack>

				<XStack flex={1} justifyContent={showBackButton ? 'space-between' : 'flex-end'} alignItems="center" paddingHorizontal="$4">
					{showBackButton && (
						<Button size="$4" height="100%" onPress={handleBackPress} circular>
							<MaterialIcons name="chevron-left" size={30} color={headerIconColor} />
						</Button>
					)}

					{actions.length > 0 && (
						<XStack gap="$2" alignItems="flex-end" justifyContent="center">
							{actions.map((action, index) => (
								<View key={index}>{action}</View>
							))}
						</XStack>
					)}
				</XStack>
			</ZStack>
		</Stack>
	);
}

interface HeaderActionProps {
	icon: React.ComponentProps<typeof MaterialIcons>['name'];
	onPress: () => void;
	size?: number;
}

/**
 * Helper component for header action buttons
 */
export function HeaderAction({ icon, onPress, size = 20 }: HeaderActionProps) {
	const theme = useTheme();
	const actionIconColor = (theme.primary as any)?.val ?? (theme.color as any)?.val;
	return (
		<Button size="$4" height="100%" onPress={onPress} circular>
			<MaterialIcons name={icon} size={size} color={actionIconColor} />
		</Button>
	);
}
