import { useEffect, useState, useCallback } from 'react';
import { FlatList, Alert, SectionList } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { DeckCard } from '@/components/DeckCard';
import { FlashcardListItem } from '@/components/FlashcardListItem';
import { Header, HeaderAction } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { getFlashcardCount, search } from '@/utils/database';
import { Deck, Flashcard } from '@/types';

type SearchResultSection = {
	deckId: number;
	deckTitle: string;
	data: Flashcard[];
};

export function HomeScreen() {
	const router = useRouter();
	const { decks, loadDecks, removeDeck } = useFlashcardsStore();
	const [deckCounts, setDeckCounts] = useState<Record<number, number>>({});
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
	const [searchResults, setSearchResults] = useState<SearchResultSection[]>([]);

	// Perform search using FTS5
	useEffect(() => {
		const performSearch = async () => {
			if (!searchQuery.trim()) {
				setFilteredDecks(decks);
				setSearchResults([]);
				return;
			}

			const { matchingDeckIds, flashcardsByDeck } = await search(searchQuery.trim());

			setFilteredDecks(decks.filter((deck) => matchingDeckIds.includes(deck.id)));

			// Build sections for flashcard results
			const sections: SearchResultSection[] = [];
			for (const deck of decks) {
				if (flashcardsByDeck[deck.id]?.length > 0) {
					sections.push({
						deckId: deck.id,
						deckTitle: deck.title,
						data: flashcardsByDeck[deck.id],
					});
				}
			}
			setSearchResults(sections);
		};

		performSearch();
	}, [decks, searchQuery]);

	const loadCounts = useCallback(async () => {
		const counts: Record<number, number> = {};
		for (const deck of decks) {
			counts[deck.id] = await getFlashcardCount(deck.id);
		}
		setDeckCounts(counts);
	}, [decks]);

	useEffect(() => {
		loadDecks();
	}, [loadDecks]);

	useEffect(() => {
		loadCounts();
	}, [loadCounts]);

	const handleDeleteDeck = (deck: Deck) => {
		Alert.alert('Elimina mazzo', `Sei sicuro di voler eliminare "${deck.title}"?`, [
			{ text: 'Annulla', style: 'cancel' },
			{ text: 'Elimina', style: 'destructive', onPress: () => removeDeck(deck.id) },
		]);
	};

	return (
		<View flex={1} backgroundColor="$background">
			<Header title="I tuoi mazzi" showBackButton={false} actions={[<HeaderAction key="add" icon="add" onPress={() => router.push('/deck/new')} />]} />

			<YStack flex={1} padding="$4" gap="$4">
				{/* Search bar */}
				{decks.length > 0 && <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Cerca mazzi..." />}

				{decks.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$secondary" fontSize={16} textAlign="center">
							Nessun mazzo ancora.{'\n'}Crea il tuo primo mazzo!
						</Text>
					</YStack>
				) : filteredDecks.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$secondary" fontSize={16} textAlign="center">
							Nessun risultato per &quot;{searchQuery}&quot;
						</Text>
					</YStack>
				) : searchQuery.trim() && searchResults.length > 0 ? (
					// Show flashcard results grouped by deck when searching
					<SectionList
						sections={searchResults}
						keyExtractor={(item) => item.id.toString()}
						renderSectionHeader={({ section }) => (
							<View backgroundColor="$background" paddingVertical="$2" marginTop="$3">
								<Text fontSize={14} fontWeight="600" color="$secondary">
									{section.deckTitle}
								</Text>
							</View>
						)}
						renderItem={({ item, section }) => <FlashcardListItem flashcard={item} onPress={() => router.push(`/flashcard-edit/${item.id}`)} />}
						contentContainerStyle={{ paddingBottom: 20 }}
						ItemSeparatorComponent={() => <View height={8} />}
						stickySectionHeadersEnabled={false}
						showsVerticalScrollIndicator={false}
					/>
				) : (
					<FlatList
						data={filteredDecks}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => (
							<DeckCard
								deck={item}
								flashcardCount={deckCounts[item.id] || 0}
								onPress={() => router.push(`/deck/${item.id}`)}
								onLongPress={() => handleDeleteDeck(item)}
							/>
						)}
						contentContainerStyle={{ paddingBottom: 20 }}
						ItemSeparatorComponent={() => <View height={12} />}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</YStack>
		</View>
	);
}
