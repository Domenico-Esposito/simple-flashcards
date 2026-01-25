import { Input, XStack, Button, View } from 'tamagui';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

/**
 * Reusable search bar component with consistent styling
 */
export function SearchBar({ value, onChangeText, placeholder = 'Cerca...' }: SearchBarProps) {
	const handleClear = () => {
		onChangeText('');
	};

	return (
		<View position="relative">
			<View position="absolute" left="$3" top={0} bottom={0} justifyContent="center" zIndex={1} pointerEvents="none">
				<IconSymbol name="magnifyingglass" size={18} color="$secondary" />
			</View>
			<Input
				size="$4"
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				paddingLeft="$7"
				paddingRight={value.length > 0 ? '$10' : '$4'}
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="search"
			/>
			{value.length > 0 && (
				<View position="absolute" right="$3" top={0} bottom={0} justifyContent="center" zIndex={1}>
					<Button onPress={handleClear} unstyled>
						<IconSymbol name="xmark.circle.fill" size={18} color="$secondary" />
					</Button>
				</View>
			)}
		</View>
	);
}
