import { Text, View, YStack } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { kpiColors } from '@/theme/colors';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor?: string;
  fullWidth?: boolean;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = kpiColors.quizzes,
  fullWidth = false,
}: StatCardProps) {
  return (
    <View
      flex={fullWidth ? undefined : 1}
      flexBasis={fullWidth ? undefined : 0}
      width={fullWidth ? '100%' : undefined}
      bg="$backgroundStrong"
      p="$4"
      borderRadius={16}
    >
      <YStack gap="$2">
        {icon && (
          <View
            width={40}
            height={40}
            mb="$1"
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <MaterialIcons name={icon} size={22} color={iconColor} />
          </View>
        )}
        <Text
          fontSize={13}
          color="$secondary"
          fontWeight="500"
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {title}
        </Text>
        <Text fontSize={28} fontWeight="700" color="$color">
          {value}
        </Text>
        {subtitle && (
          <Text fontSize={12} color="$secondary">
            {subtitle}
          </Text>
        )}
      </YStack>
    </View>
  );
}
