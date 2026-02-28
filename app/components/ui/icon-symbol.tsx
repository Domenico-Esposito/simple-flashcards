import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { ComponentProps } from 'react';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// Map SF Symbol names to Material Icon names
const SF_TO_MATERIAL_MAP: Record<string, MaterialIconName> = {
	'magnifyingglass': 'search',
	'rectangle.stack.fill': 'layers',
	'chart.bar.fill': 'bar-chart',
	'gearshape.fill': 'settings',
	'chevron.down': 'keyboard-arrow-down',
	'chevron.up': 'keyboard-arrow-up',
	'chevron.left': 'chevron-left',
	'chevron.right': 'chevron-right',
	'xmark': 'close',
	'xmark.circle.fill': 'cancel',
	'plus': 'add',
	'trash': 'delete',
	'pencil': 'edit',
	'checkmark': 'check',
};

export function IconSymbol({ 
	name, 
	size = 24, 
	color, 
	style 
}: { 
	name: string; 
	size?: number; 
	color: string | OpaqueColorValue; 
	style?: StyleProp<TextStyle> 
}) {
	const materialIconName = (SF_TO_MATERIAL_MAP[name] || name) as MaterialIconName;
	return <MaterialIcons color={color} size={size} name={materialIconName} style={style} />;
}
