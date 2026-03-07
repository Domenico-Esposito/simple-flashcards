import { Pressable } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { Deck } from '@/types';
import { formatDate } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface DeckCardProps {
  deck: Deck;
  flashcardCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}

/**
 * Card component displaying a deck summary
 */
export function DeckCard({ deck, flashcardCount, onPress, onLongPress }: DeckCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      {({ pressed }) => (
        <View
          backgroundColor={pressed ? '$backgroundPress' : '$backgroundStrong'}
          borderRadius="$4"
          padding="$4"
        >
          <XStack gap="$4" alignItems="center">
            <MaterialIcons name="style" size={34} color={colors.accent} />
            <YStack flex={1} gap="$1.5">
              <Text fontSize={17} fontWeight="600" numberOfLines={1} color="$color">
                {deck.title}
              </Text>
              {deck.description && (
                <Text fontSize={14} color="$gray10" numberOfLines={1}>
                  {deck.description}
                </Text>
              )}
              <XStack gap="$3" marginTop="$2">
                <XStack alignItems="center" gap="$1">
                  <MaterialIcons name="layers" size={14} color={colors.muted} />
                  <Text fontSize={12} color="$gray9">
                    {t('deck.cardCount', { count: flashcardCount })}
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <MaterialIcons name="schedule" size={14} color={colors.muted} />
                  <Text fontSize={12} color="$gray9">
                    {formatDate(deck.createdAt)}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
            <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
          </XStack>
        </View>
      )}
    </Pressable>
  );
}
