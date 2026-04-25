import { Pressable } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter, type Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/colors';

type SettingsItem = {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: Href;
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');

  const settingsItems: SettingsItem[] = [
    {
      title: t('settings.import'),
      icon: 'file-download',
      route: '/settings/import',
    },
    {
      title: t('settings.export'),
      icon: 'file-upload',
      route: '/settings/export',
    },
    { title: t('settings.backup'), icon: 'backup', route: '/settings/backup' },
    {
      title: t('settings.resetStats'),
      icon: 'delete-outline',
      route: '/settings/reset-stats',
    },
    {
      title: t('settings.resetData'),
      icon: 'delete-forever',
      route: '/settings/reset-data',
    },
    {
      title: t('settings.info'),
      icon: 'info-outline',
      route: '/settings/info',
    },
  ];
  const testIDByRoute: Record<string, string> = {
    '/settings/import': 'settings-item-import',
    '/settings/export': 'settings-item-export',
    '/settings/backup': 'settings-item-backup',
    '/settings/reset-stats': 'settings-item-reset-stats',
    '/settings/reset-data': 'settings-item-reset-data',
    '/settings/info': 'settings-item-info',
  };

  return (
    <View flex={1} bg="$background" testID="settings-screen">
      <Header title={t('settings.title')} showBackButton={false} />

      <YStack p="$4" gap="$2">
        {settingsItems.map((item, index) => {
          const itemTestID = testIDByRoute[item.route.toString()] ?? `settings-item-${index}`;
          return (
            <Pressable
              key={item.route.toString()}
              onPress={() => router.push(item.route)}
              testID={itemTestID}
              accessibilityLabel={itemTestID}
            >
              <XStack
                bg="$backgroundStrong"
                p="$4"
                borderRadius={12}
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack gap="$3" alignItems="center">
                  <MaterialIcons name={item.icon} size={24} color={colors.muted} />
                  <Text fontSize={16} color="$color">
                    {item.title}
                  </Text>
                </XStack>
                <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </View>
  );
}
