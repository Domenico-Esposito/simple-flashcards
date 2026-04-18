import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface HeaderActionItem {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
  display?: 'button' | 'icon';
  color?: string;
  showLabelOnLargeScreen?: boolean;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  actions?: HeaderActionItem[];
  onBackPress?: () => void;
  isModal?: boolean;
  maxTitleLength?: number;
  maxSubtitleLength?: number;
}

export type HeaderLayoutProps = {
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

export interface HeaderActionProps {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  onPress: () => void;
  testID?: string;
  display?: 'button' | 'icon';
  color?: string;
  showLabelOnLargeScreen?: boolean;
}
