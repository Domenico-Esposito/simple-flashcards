import React from 'react';
import { Pressable } from 'react-native';
import { Heading, Text, View, XStack, YStack } from 'tamagui';
import { Deck } from '@/types';
import { formatDate } from '@/utils';

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
	return (
		<Pressable onPress={onPress} onLongPress={onLongPress}>
			{({ pressed }) => (
				<View backgroundColor={pressed ? '$backgroundPress' : '$cardBackground'} borderRadius="$4" padding="$3" borderWidth={0.5} borderColor="$borderColor">
					<YStack gap="$3">
						<YStack gap="$1">
							<Heading size="$4" numberOfLines={1} fontWeight="600">
								{deck.title}
							</Heading>
							{deck.description && (
								<Text fontSize={14} color="$secondary" numberOfLines={2}>
									{deck.description}
								</Text>
							)}
						</YStack>
						<XStack flexDirection="row" justifyContent="space-between">
							<Text fontSize={12} color="$placeholderColor">
								{flashcardCount} {flashcardCount === 1 ? 'carta' : 'carte'}
							</Text>
							<Text fontSize={12} color="$placeholderColor">
								{formatDate(deck.createdAt)}
							</Text>
						</XStack>
					</YStack>
				</View>
			)}
		</Pressable>
	);
}
