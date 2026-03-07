import { Pressable } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';

type SettingsItem = {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
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

  return (
    <View flex={1} backgroundColor="$background">
      <Header title={t('settings.title')} showBackButton={false} />

      <YStack padding="$4" gap="$2">
        {settingsItems.map((item, index) => (
          <Pressable key={item.route} onPress={() => router.push(item.route as any)}>
            <XStack
              backgroundColor="$backgroundStrong"
              padding="$4"
              borderRadius="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <XStack alignItems="center" gap="$3">
                <MaterialIcons name={item.icon} size={24} color={colors.muted} />
                <Text fontSize={16} color="$color">
                  {item.title}
                </Text>
              </XStack>
              <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </View>
  );
}
