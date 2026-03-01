import { Pressable } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';
import { Flashcard } from '@/types';
import { stripMarkdown } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FlashcardListItemProps {
	flashcard: Flashcard;
	onPress: () => void;
	onLongPress?: () => void;
}

/**
 * List item displaying a flashcard preview
 */
export function FlashcardListItem({ flashcard, onPress, onLongPress }: FlashcardListItemProps) {
	const colorScheme = useColorScheme();
	const colors = getColors(colorScheme === 'dark' ? 'dark' : 'light');
	const questionPreview = stripMarkdown(flashcard.question);
	const answerPreview = stripMarkdown(flashcard.answer);

	return (
		<Pressable onPress={onPress} onLongPress={onLongPress}>
			{({ pressed }) => (
				<View 
					backgroundColor={pressed ? '$backgroundPress' : '$backgroundStrong'} 
					borderRadius="$4" 
					padding="$4"
				>
					<XStack gap="$3" alignItems="center">
						<YStack flex={1} gap="$2">
							<Text fontSize={15} lineHeight={20} fontWeight="600" numberOfLines={2} height={40} color="$color">
								{questionPreview}
							</Text>
							<Text fontSize={13} lineHeight={18} color="$gray10" numberOfLines={2} height={36}>
								{answerPreview}
							</Text>
						</YStack>
						<MaterialIcons name="chevron-right" size={22} color={colors.muted} />
					</XStack>
				</View>
			)}
		</Pressable>
	);
}
