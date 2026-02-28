import { Input, View, useTheme } from 'tamagui';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

/**
 * Reusable search bar component with consistent styling
 */
export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
	const theme = useTheme();
	const secondaryColor = theme.secondary.val;
	const { t } = useTranslation();
	const resolvedPlaceholder = placeholder ?? t('common.search');

	const handleClear = () => {
		onChangeText('');
	};

	return (
		<View position="relative">
			<View position="absolute" left="$3" top={0} bottom={0} justifyContent="center" zIndex={1} pointerEvents="none">
				<IconSymbol name="magnifyingglass" size={18} color={secondaryColor} />
			</View>
			<Input
				size="$4"
				value={value}
				onChangeText={onChangeText}
				placeholder={resolvedPlaceholder}
				paddingLeft="$7"
				paddingRight={value.length > 0 ? '$10' : '$4'}
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="search"
			/>
			{value.length > 0 && (
				<View position="absolute" right="$3" top={0} bottom={0} justifyContent="center" zIndex={1}>
					<Pressable onPress={handleClear}>
						<IconSymbol name="xmark.circle.fill" size={18} color={secondaryColor} />
					</Pressable>
				</View>
			)}
		</View>
	);
}
