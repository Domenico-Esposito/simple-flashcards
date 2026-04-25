import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'tamagui';

type ActionTileProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  iconColor: string;
  textColor: string;
  backgroundColor: string;
  onPress: () => void;
  testID: string;
};

export function ActionTile({
  icon,
  label,
  iconColor,
  textColor,
  backgroundColor,
  onPress,
  testID,
}: ActionTileProps) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }} testID={testID} accessibilityLabel={testID}>
      <View
        p="$4"
        gap="$2"
        style={{
          backgroundColor,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={24} color={iconColor} />
        <Text fontSize={14} fontWeight="600" style={{ color: textColor }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
