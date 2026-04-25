import { Input, View, useTheme } from 'tamagui';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
  clearButtonTestID?: string;
}

/**
 * Reusable search bar component with consistent styling
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder,
  testID,
  clearButtonTestID,
}: SearchBarProps) {
  const theme = useTheme();
  const secondaryColor = theme.secondary.val;
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.search');
  const inputTestID = testID ?? 'search-input';
  const resolvedClearButtonTestID = clearButtonTestID ?? `${inputTestID}-clear`;

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View position="relative">
      <View
        pointerEvents="none"
        position="absolute"
        left={12}
        top={0}
        bottom={0}
        justifyContent="center"
        zIndex={1}
      >
        <IconSymbol name="magnifyingglass" size={18} color={secondaryColor} />
      </View>
      <Input
        testID={inputTestID}
        accessibilityLabel={inputTestID}
        size="$4"
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        paddingLeft={28}
        paddingRight={value.length > 0 ? 40 : 16}
      />
      {value.length > 0 && (
        <View
          position="absolute"
          right={12}
          top={0}
          bottom={0}
          justifyContent="center"
          zIndex={1}
        >
          <Pressable
            onPress={handleClear}
            testID={resolvedClearButtonTestID}
            accessibilityLabel={resolvedClearButtonTestID}
          >
            <IconSymbol name="xmark.circle.fill" size={18} color={secondaryColor} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
