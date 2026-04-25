import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'tamagui';

type ActionTileProps = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  iconColor: string;
  textColor: ComponentProps<typeof Text>['color'];
  backgroundColor: ComponentProps<typeof View>['backgroundColor'];
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
        backgroundColor={backgroundColor}
        borderRadius={16}
        p="$4"
        gap="$2"
        alignItems="center"
        justifyContent="center"
      >
        <MaterialIcons name={icon} size={24} color={iconColor} />
        <Text fontSize={14} fontWeight="600" color={textColor}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
