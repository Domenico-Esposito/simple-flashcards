import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/colors';
import { getSafeTopInsetForIpadWindowControls } from '@/utils/windowInsets';

type SidebarTab = {
  path: Href;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  testID: string;
};

function isActiveTab(pathname: string, tabPath: string) {
  return pathname === tabPath || (tabPath !== '/' && pathname.startsWith(tabPath));
}

export function Sidebar() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const accentColor = getColors(colorScheme === 'dark' ? 'dark' : 'light').accent;
  const insets = useSafeAreaInsets();
  const topInset = getSafeTopInsetForIpadWindowControls(insets.top);

  const tabs: SidebarTab[] = [
    { path: '/', label: t('tab.decks'), icon: 'layers', testID: 'sidebar-tab-decks' },
    {
      path: '/statistics',
      label: t('tab.statistics'),
      icon: 'bar-chart',
      testID: 'sidebar-tab-statistics',
    },
    {
      path: '/settings',
      label: t('tab.settings'),
      icon: 'settings',
      testID: 'sidebar-tab-settings',
    },
  ];

  return (
    <YStack
      width={200}
      backgroundColor="$backgroundStrong"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      paddingTop={topInset + 16}
      paddingLeft={insets.left}
      paddingHorizontal="$2"
      gap="$1"
      testID="sidebar-navigation"
    >
      {tabs.map((tab) => {
        const tabPath = tab.path.toString();
        const isActive = isActiveTab(pathname, tabPath);

        return (
          <Pressable key={tabPath} onPress={() => router.push(tab.path)} testID={tab.testID}>
            <XStack
              paddingVertical="$3"
              paddingHorizontal="$3"
              borderRadius="$3"
              backgroundColor={isActive ? '$background' : 'transparent'}
              gap="$3"
              alignItems="center"
            >
              <MaterialIcons name={tab.icon} size={22} color={isActive ? accentColor : '#888'} />
              <Text
                fontSize={15}
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? '$color' : '$gray10'}
              >
                {tab.label}
              </Text>
            </XStack>
          </Pressable>
        );
      })}
    </YStack>
  );
}
