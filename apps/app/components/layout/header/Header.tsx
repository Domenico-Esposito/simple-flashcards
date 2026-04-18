import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useIsLargeScreen } from '@/hooks/useLargeScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/theme/colors';

import { HeaderLargeScreen } from './HeaderLargeScreen';
import { HeaderMobile } from './HeaderMobile';
import type { HeaderActionProps, HeaderLayoutProps, HeaderActionItem, HeaderProps } from './types';

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

  return isLargeScreen ? <HeaderLargeScreen {...layoutProps} /> : <HeaderMobile {...layoutProps} />;
}

export function createHeaderAction(props: HeaderActionProps): HeaderActionItem {
  return props;
}
