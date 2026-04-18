import { Text, View, YStack, XStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function InfoScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <View flex={1} backgroundColor="$background" testID="info-screen">
      <Header title={t('info.title')} showBackButton />

      <YStack padding="$4" gap="$6">
        <View backgroundColor="$backgroundStrong" padding="$4" borderRadius="$3" gap="$2">
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

        <YStack gap="$2" marginTop="$4">
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
