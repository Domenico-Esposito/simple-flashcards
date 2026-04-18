import { Platform } from 'react-native';

export const appFonts = {
  sans: 'Inter',
  sansBold: 'InterBold',
  serif: 'Inter',
  rounded: 'Inter',
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  }) as string,
};
