import { useState } from 'react';
import { Button, Heading, Popover, Stack, Text, XStack, YStack, ZStack } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { getHeaderTopPadding } from '@/utils/windowInsets';

import { truncateText } from './helpers';
import type { HeaderActionItem, HeaderLayoutProps } from './types';

function getActionColor(action: HeaderActionItem, headerIconColor: string) {
  return action.color ?? headerIconColor;
}

export function HeaderMobile({
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
  const iconActions = actions.filter((action) => action.display === 'icon');
  const menuActions = actions.filter((action) => action.display !== 'icon');

  const handleActionPress = (action: HeaderActionItem) => {
    setMenuOpen(false);
    action.onPress();
  };

  const topPadding = getHeaderTopPadding(insets.top, isModal);

  return (
    <Stack pt={topPadding} bg="$background" pb="$2">
      <ZStack gap="$2" minHeight={56}>
        <YStack
          flex={1}
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          alignItems="center"
          justifyContent="center"
        >
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
          px="$4"
          justifyContent={showBackButton ? 'space-between' : 'flex-end'}
          alignItems="center"
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

          {(iconActions.length > 0 || menuActions.length > 0) && (
            <XStack gap="$1" alignItems="center">
              {iconActions.map((action, index) => (
                <Button
                  key={index}
                  size="$4"
                  height="100%"
                  onPress={action.onPress}
                  circular
                  testID={action.testID ?? `header-action-${index}`}
                  accessibilityLabel={action.testID ?? `header-action-${index}`}
                >
                  <MaterialIcons
                    name={action.icon}
                    size={24}
                    color={getActionColor(action, headerIconColor)}
                  />
                </Button>
              ))}

              {menuActions.length > 0 && (
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
                    mt="$1"
                    bg="$background"
                    p="$0"
                    enterStyle={{ opacity: 0, y: -5 }}
                    exitStyle={{ opacity: 0, y: -5 }}
                    animation="bouncy"
                    overflow="hidden"
                    borderRadius={16}
                  >
                    <YStack>
                      {menuActions.map((action, index) => (
                        <Button
                          key={index}
                          borderWidth="$0"
                          size="$4"
                          px="$3"
                          onPress={() => handleActionPress(action)}
                          testID={action.testID ?? `header-action-${index}`}
                          accessibilityLabel={action.testID ?? `header-action-${index}`}
                          borderRadius={0}
                          justifyContent="flex-start"
                        >
                          <XStack gap="$3" alignItems="center">
                            <MaterialIcons
                              name={action.icon}
                              size={20}
                              color={getActionColor(action, headerIconColor)}
                            />
                            <Text style={action.color ? { color: action.color } : undefined}>
                              {action.label}
                            </Text>
                          </XStack>
                        </Button>
                      ))}
                    </YStack>
                  </Popover.Content>
                </Popover>
              )}
            </XStack>
          )}
        </XStack>
      </ZStack>
    </Stack>
  );
}
