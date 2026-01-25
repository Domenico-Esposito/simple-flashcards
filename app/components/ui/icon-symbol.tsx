// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Existing icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  
  // Navigation icons
  'chevron.left': 'chevron-left',
  'xmark': 'close',
  
  // Action icons  
  'square.and.arrow.up': 'share',
  'pencil': 'edit',
  
  // Tab bar icons
  'rectangle.stack.fill': 'dashboard',
  'gearshape.fill': 'settings',
  
  // Fullscreen icons  
  'arrow.up.left.and.arrow.down.right': 'fullscreen',
  'arrow.down.right.and.arrow.up.left': 'fullscreen-exit',
  
  // Search icons
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedIcon = MAPPING[name];
  
  // Fallback to a default icon if mapping is missing
  const iconName = mappedIcon || 'help-outline';
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
