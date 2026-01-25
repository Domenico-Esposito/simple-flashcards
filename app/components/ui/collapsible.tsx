import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from 'tamagui';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View backgroundColor="$background">
      <TouchableOpacity onPress={() => setIsOpen((value) => !value)} activeOpacity={0.8}>
        <View flexDirection="row" alignItems="center" gap="$1.5">
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />
          <Text fontSize={16} fontWeight="600" color="$color">{title}</Text>
        </View>
      </TouchableOpacity>
      {isOpen && <View marginTop="$1.5" marginLeft="$6" backgroundColor="$background">{children}</View>}
    </View>
  );
}


