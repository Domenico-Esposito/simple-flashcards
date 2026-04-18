import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TamaguiProvider, Theme } from '@tamagui/core';
import { PortalProvider } from '@tamagui/portal';
import type { ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import config from '../../../tamagui.config';

type RootProvidersProps = {
  children: ReactNode;
  theme: 'light' | 'dark';
};

export function RootProviders({ children, theme }: RootProvidersProps) {
  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <Theme name={theme}>
        <KeyboardProvider>
          <PortalProvider>
            <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
              {children}
            </ThemeProvider>
          </PortalProvider>
        </KeyboardProvider>
      </Theme>
    </TamaguiProvider>
  );
}
