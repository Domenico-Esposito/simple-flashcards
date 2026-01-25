import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
			return 0;
		}
		// All other cases (Android modals, regular screens) need safe area padding
		return insets.top;
	};

	return (
		<View paddingTop={getTopPadding()} backgroundColor="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
			<XStack
				alignItems="center"
				padding="$4"
				gap="$3"
				minHeight={56} // Consistent header height
			>
				{showBackButton && (
					<Pressable onPress={handleBackPress}>
						<View padding="$2" borderRadius="$2" backgroundColor="$backgroundHover">
							<IconSymbol name="chevron.left" size={20} color="$primary" />
						</View>
					</Pressable>
				)}

				<View flex={1}>
					<Text fontSize={18} fontWeight="600" color="$color" numberOfLines={1}>
						{title}
					</Text>
					{subtitle && (
						<Text fontSize={14} color="$secondary" numberOfLines={1}>
							{subtitle}
						</Text>
					)}
				</View>

				{actions.length > 0 && (
					<XStack gap="$2" alignItems="center">
						{actions.map((action, index) => (
							<View key={index}>{action}</View>
						))}
					</XStack>
				)}
			</XStack>
		</View>
	);
}

interface HeaderActionProps {
	icon: 'square.and.arrow.up' | 'pencil' | 'xmark' | 'chevron.left' | 'arrow.up.left.and.arrow.down.right' | 'arrow.down.right.and.arrow.up.left';
	onPress: () => void;
	size?: number;
}

/**
 * Helper component for header action buttons
 */
export function HeaderAction({ icon, onPress, size = 20 }: HeaderActionProps) {
	return (
		<Pressable onPress={onPress}>
			<View padding="$2" borderRadius="$2" backgroundColor="$backgroundHover">
				<IconSymbol name={icon} size={size} color="$primary" />
			</View>
		</Pressable>
	);
}
