import React from 'react';
import { Pressable } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';
import { Flashcard } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FlashcardListItemProps {
	flashcard: Flashcard;
	onPress: () => void;
	onLongPress?: () => void;
}

/**
 * Removes markdown formatting from text
 */
function stripMarkdown(text: string): string {
	return (
		text
			// Remove HTML tags
			.replace(/<[^>]*>/g, '')
			// Remove setext-style headers
			.replace(/^[=-]{2,}\s*$/gm, '')
			// Remove footnotes
			.replace(/\[\^.+?\](: .*?$)?/gm, '')
			.replace(/\s{0,2}\[.*?\]: .*?$/gm, '')
			// Remove images
			.replace(/!\[(.*?)\][[(].*?[\])]/g, '')
			// Remove inline links
			.replace(/\[([\s\S]*?)\]\s*[([].*?[)\]]/g, '$1')
			// Remove blockquotes
			.replace(/^(\n)?\s{0,3}>\s?/gm, '$1')
			// Remove reference-style links
			.replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/gm, '')
			// Remove atx-style headers
			.replace(/^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm, '$1$3$4$6')
			// Remove * emphasis
			.replace(/([*]+)(\S)(.*?\S)??\1/g, '$2$3')
			// Remove _ emphasis
			.replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
			// Remove code blocks
			.replace(/(`{3,})(.*?)\1/gms, '$2')
			// Remove inline code
			.replace(/`(.+?)`/g, '$1')
			// Remove strikethrough
			.replace(/~(.*?)~/g, '$1')
			// Remove list markers
			.replace(/^[-*+]\s+/gm, '')
			.replace(/^\d+\.\s+/gm, '')
			// Clean up extra whitespace
			.replace(/\n{2,}/g, '\n')
			.trim()
	);
}

/**
 * List item displaying a flashcard preview
 */
export function FlashcardListItem({ flashcard, onPress, onLongPress }: FlashcardListItemProps) {
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
							<Text fontSize={15} fontWeight="600" numberOfLines={2} color="$color">
								{flashcard.question}
							</Text>
							<Text fontSize={13} color="$gray10" numberOfLines={2}>
								{answerPreview}
							</Text>
						</YStack>
						<MaterialIcons name="chevron-right" size={22} color="#888888" />
					</XStack>
				</View>
			)}
		</Pressable>
	);
}
