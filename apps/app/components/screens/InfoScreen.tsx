import { Text, View, YStack, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function InfoScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <View flex={1} bg="$background" testID="info-screen">
      <Header title={t('info.title')} showBackButton />

      <YStack p="$4" gap="$6">
        <View bg="$backgroundStrong" p="$4" gap="$2" borderRadius={12}>
          <XStack justifyContent="space-between">
            <Text color="$secondary">{t('info.version')}</Text>
            <Text color="$color">1.0.0</Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color="$secondary">{t('info.developedWith')}</Text>
            <Text color="$color">React Native + Expo</Text>
          </XStack>
        </View>

        <Text fontSize={12} color="$placeholderColor" textAlign="center">
          {t('info.tagline')}
        </Text>

        <YStack gap="$2" mt="$4">
          <Text fontSize={14} color="$secondary" textAlign="center">
            {t('info.themeSysFollow')}
          </Text>
          <Text fontSize={12} color="$placeholderColor" textAlign="center">
            {t('info.currentTheme', {
              theme: colorScheme === 'dark' ? t('info.darkTheme') : t('info.lightTheme'),
            })}
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}
