import { Button, Heading, Text, XStack, YStack } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { HeaderActionItem, HeaderLayoutProps } from './types';

function getActionColor(action: HeaderActionItem, headerIconColor: string) {
  return action.color ?? headerIconColor;
}

export function HeaderLargeScreen({
  title,
  subtitle,
  showBackButton,
  actions,
  headerIconColor,
  onBackPress,
}: HeaderLayoutProps) {
  return (
    <XStack
      bg="$background"
      py="$3"
      px="$4"
      gap="$4"
      alignItems="center"
      minHeight={56}
      testID="large-screen-header"
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
        <XStack gap="$2" testID="header-actions-container">
          {actions.map((action, index) =>
            action.display === 'icon' && !action.showLabelOnLargeScreen ? (
              <Button
                key={index}
                size="$4"
                onPress={action.onPress}
                circular
                testID={action.testID ?? `header-action-${index}`}
                accessibilityLabel={action.testID ?? `header-action-${index}`}
              >
                <MaterialIcons
                  name={action.icon}
                  size={22}
                  color={getActionColor(action, headerIconColor)}
                />
              </Button>
            ) : (
                <Button
                  key={index}
                  size="$4"
                  onPress={action.onPress}
                  borderRadius={12}
                  testID={action.testID ?? `header-action-${index}`}
                  accessibilityLabel={action.testID ?? `header-action-${index}`}
                >
                  <XStack gap="$2" alignItems="center">
                    <MaterialIcons
                      name={action.icon}
                      size={18}
                      color={getActionColor(action, headerIconColor)}
                    />
                    <Text fontSize={14} style={action.color ? { color: action.color } : undefined}>
                      {action.label}
                    </Text>
                  </XStack>
                </Button>
            ),
          )}
        </XStack>
      )}
    </XStack>
  );
}
