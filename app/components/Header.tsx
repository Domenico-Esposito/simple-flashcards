import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Button, Heading, Popover, Stack, Text, XStack, YStack, ZStack, useTheme } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface HeaderActionItem {
	icon: React.ComponentProps<typeof MaterialIcons>['name'];
	label: string;
	onPress: () => void;
}

interface HeaderProps {
	title: string;
	subtitle?: string;
	showBackButton?: boolean;
	actions?: HeaderActionItem[];
	onBackPress?: () => void;
	isModal?: boolean;
}

/**
 * Reusable header component with consistent styling across all screens
 */
export function Header({ title, subtitle, showBackButton = true, actions = [], onBackPress, isModal = false }: HeaderProps) {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const theme = useTheme();
	const headerIconColor = (theme.primary as any)?.val ?? (theme.color as any)?.val;
	const [menuOpen, setMenuOpen] = useState(false);

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

	const handleActionPress = (action: HeaderActionItem) => {
		setMenuOpen(false);
		action.onPress();
	};

	return (
		<Stack paddingTop={getTopPadding()} backgroundColor={'$background'} paddingBottom="$4">
			<ZStack
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
						<Popover open={menuOpen} onOpenChange={setMenuOpen} placement="bottom-end">
							<Popover.Trigger asChild>
								<Button size="$4" height="100%" circular>
									<MaterialIcons name="more-vert" size={24} color={headerIconColor} />
								</Button>
							</Popover.Trigger>

							<Popover.Content
								marginTop="$1"
								backgroundColor="$background"
								borderRadius="$4"
								padding="$0"
								enterStyle={{ opacity: 0, y: -5 }}
								exitStyle={{ opacity: 0, y: -5 }}
								animation="bouncy"
								overflow="hidden">
								<YStack>
									{actions.map((action, index) => (
										<Button
											key={index}
											borderRadius="$0"
											borderWidth="$0"
											size="$4"
											justifyContent="flex-start"
											paddingHorizontal="$3"
											onPress={() => handleActionPress(action)}>
											<XStack gap="$3" alignItems="center">
												<MaterialIcons name={action.icon} size={20} color={headerIconColor} />
												<Text color="$color">{action.label}</Text>
											</XStack>
										</Button>
									))}
								</YStack>
							</Popover.Content>
						</Popover>
					)}
				</XStack>
			</ZStack>
		</Stack>
	);
}

interface HeaderActionProps {
	icon: React.ComponentProps<typeof MaterialIcons>['name'];
	label: string;
	onPress: () => void;
}

/**
 * Helper function to create header action items
 */
export function createHeaderAction(props: HeaderActionProps): HeaderActionItem {
	return props;
}
