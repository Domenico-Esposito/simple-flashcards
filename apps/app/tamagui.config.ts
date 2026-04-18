import { defaultConfig } from '@tamagui/config/v4';
import { createInterFont } from '@tamagui/font-inter';
import { createTamagui } from 'tamagui';

// Map font weights to the loaded Inter font variants (registered in _layout.tsx via useFonts)
const interFace = {
  100: { normal: 'InterThin' },
  200: { normal: 'InterExtraLight' },
  300: { normal: 'InterLight' },
  400: { normal: 'InterRegular' },
  500: { normal: 'InterMedium' },
  600: { normal: 'InterSemiBold' },
  700: { normal: 'InterBold' },
  800: { normal: 'InterExtraBold' },
  900: { normal: 'InterBlack' },
} as const;

const interFont = createInterFont(
  { face: interFace },
  { sizeLineHeight: (size) => Math.round(size * 1.5) },
);

const lightTheme = {
  background: '#FFFFFF',
  backgroundHover: '#FAFAFA',
  backgroundPress: '#F5F5F5',
  backgroundFocus: '#FAFAFA',
  backgroundStrong: '#F5F5F5',
  backgroundTransparent: 'rgba(255, 255, 255, 0)',

  color: '#171717',
  colorHover: '#262626',
  colorPress: '#404040',
  colorFocus: '#262626',
  colorTransparent: 'rgba(0, 0, 0, 0)',

  borderColor: '#E5E5E5',
  borderColorHover: '#D4D4D4',
  borderColorFocus: '#3B82F6',
  borderColorPress: '#D4D4D4',

  placeholderColor: '#A3A3A3',

  // Semantic colors
  primary: '#3B82F6',
  primaryHover: '#2563EB',

  secondary: '#737373',
  secondaryHover: '#525252',

  success: '#22C55E',
  error: '#EF4444',

  // Card backgrounds
  cardBackground: '#FFFFFF',
  cardBackgroundHover: '#FAFAFA',
};

const darkTheme = {
  background: '#171717',
  backgroundHover: '#262626',
  backgroundPress: '#404040',
  backgroundFocus: '#262626',
  backgroundStrong: '#262626',
  backgroundTransparent: 'rgba(0, 0, 0, 0)',

  color: '#F5F5F5',
  colorHover: '#E5E5E5',
  colorPress: '#D4D4D4',
  colorFocus: '#E5E5E5',
  colorTransparent: 'rgba(255, 255, 255, 0)',

  borderColor: '#404040',
  borderColorHover: '#525252',
  borderColorFocus: '#60A5FA',
  borderColorPress: '#525252',

  placeholderColor: '#737373',

  // Semantic colors
  primary: '#60A5FA',
  primaryHover: '#93C5FD',

  secondary: '#A3A3A3',
  secondaryHover: '#D4D4D4',

  success: '#22C55E',
  error: '#EF4444',

  // Card backgrounds
  cardBackground: '#262626',
  cardBackgroundHover: '#404040',
};

const config = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    body: interFont,
    heading: interFont,
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...lightTheme,
    },
    dark: {
      ...defaultConfig.themes.dark,
      ...darkTheme,
    },
  },
});

export type AppConfig = typeof config;

export default config;
