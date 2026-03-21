import { useState, type ComponentProps } from 'react';
import { Platform } from 'react-native';
import { Button, Heading, Popover, Stack, Text, XStack, YStack, ZStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';

export interface HeaderActionItem {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  actions?: HeaderActionItem[];
  onBackPress?: () => void;
  isModal?: boolean;
  maxTitleLength?: number;
  maxSubtitleLength?: number;
}

/**
 * Truncates a string to the specified maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '…';
}

type HeaderLayoutProps = {
  title: string;
  subtitle?: string;
  showBackButton: boolean;
  actions: HeaderActionItem[];
  headerIconColor: string;
  onBackPress: () => void;
  isModal: boolean;
  insets: { top: number };
  maxTitleLength: number;
  maxSubtitleLength: number;
};

/** Large screen: horizontal layout with inline action buttons */
function LargeScreenHeader({
  title,
  subtitle,
  showBackButton,
  actions,
  headerIconColor,
  onBackPress,
}: HeaderLayoutProps) {
  return (
    <XStack
      backgroundColor="$background"
      paddingVertical="$3"
      paddingHorizontal="$4"
      alignItems="center"
      gap="$4"
      minHeight={56}
    >
      {showBackButton && (
        <Button
          size="$4"
          onPress={onBackPress}
          circular
          testID="header-back-button"
          accessibilityLabel="header-back-button"
        >
          <MaterialIcons name="chevron-left" size={30} color={headerIconColor} />
        </Button>
      )}
      <YStack flex={1}>
        <Heading size="$5" color="$color" fontWeight="600">
          {title}
        </Heading>
        {subtitle && (
          <Text fontSize={14} color="$secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </YStack>
      {actions.length > 0 && (
        <XStack gap="$2">
          {actions.map((action, index) => (
            <Button
              key={index}
              size="$4"
              onPress={action.onPress}
              borderRadius="$3"
              testID={action.testID ?? `header-action-${index}`}
              accessibilityLabel={action.testID ?? `header-action-${index}`}
            >
              <XStack gap="$2" alignItems="center">
                <MaterialIcons name={action.icon} size={18} color={headerIconColor} />
                <Text color="$color" fontSize={14}>
                  {action.label}
                </Text>
              </XStack>
            </Button>
          ))}
        </XStack>
      )}
    </XStack>
  );
}

/** Mobile: centered title with popover action menu */
function MobileHeader({
  title,
  subtitle,
  showBackButton,
  actions,
  headerIconColor,
  onBackPress,
  isModal,
  insets,
  maxTitleLength,
  maxSubtitleLength,
}: HeaderLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleActionPress = (action: HeaderActionItem) => {
    setMenuOpen(false);
    action.onPress();
  };

  const getTopPadding = () => {
    if (isModal && Platform.OS === 'ios') {
      return '$2';
    }
    return insets.top;
  };

  return (
    <Stack paddingTop={getTopPadding()} backgroundColor={'$background'} paddingBottom="$2">
      <ZStack gap="$2" minHeight={56}>
        <YStack flex={1} alignItems="center" justifyContent="center" absolute>
          <Heading size="$4" numberOfLines={1} color="$color" fontWeight="600">
            {truncateText(title, maxTitleLength)}
          </Heading>
          {subtitle && (
            <Text fontSize={14} color="$secondary" numberOfLines={1}>
              {truncateText(subtitle, maxSubtitleLength)}
            </Text>
          )}
        </YStack>

        <XStack
          flex={1}
          justifyContent={showBackButton ? 'space-between' : 'flex-end'}
          alignItems="center"
          paddingHorizontal="$4"
        >
          {showBackButton && (
            <Button
              size="$4"
              height="100%"
              onPress={onBackPress}
              circular
              testID="header-back-button"
              accessibilityLabel="header-back-button"
            >
              <MaterialIcons name="chevron-left" size={30} color={headerIconColor} />
            </Button>
          )}

          {actions.length > 0 && (
            <Popover open={menuOpen} onOpenChange={setMenuOpen} placement="bottom-end">
              <Popover.Trigger asChild>
                <Button
                  size="$4"
                  height="100%"
                  circular
                  testID="header-actions-menu-button"
                  accessibilityLabel="header-actions-menu-button"
                >
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
                overflow="hidden"
              >
                <YStack>
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      borderRadius="$0"
                      borderWidth="$0"
                      size="$4"
                      justifyContent="flex-start"
                      paddingHorizontal="$3"
                      onPress={() => handleActionPress(action)}
                      testID={action.testID ?? `header-action-${index}`}
                      accessibilityLabel={action.testID ?? `header-action-${index}`}
                    >
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

/**
 * Reusable header component with consistent styling across all screens
 */
export function Header({
  title,
  subtitle,
  showBackButton = true,
  actions = [],
  onBackPress,
  isModal = false,
  maxTitleLength = 20,
  maxSubtitleLength = 30,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const headerIconColor = getColors(colorScheme === 'dark' ? 'dark' : 'light').accent;
  const isLargeScreen = useIsLargeScreen();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const layoutProps: HeaderLayoutProps = {
    title,
    subtitle,
    showBackButton,
    actions,
    headerIconColor,
    onBackPress: handleBackPress,
    isModal,
    insets,
    maxTitleLength,
    maxSubtitleLength,
  };

  return isLargeScreen ? <LargeScreenHeader {...layoutProps} /> : <MobileHeader {...layoutProps} />;
}

interface HeaderActionProps {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
}

/**
 * Helper function to create header action items
 */
export function createHeaderAction(props: HeaderActionProps): HeaderActionItem {
  return props;
}
