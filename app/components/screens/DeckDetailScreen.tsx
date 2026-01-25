import { useEffect, useState, useMemo } from 'react';
import { FlatList, Alert, Share } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardListItem } from '@/components/FlashcardListItem';
import { Header, HeaderAction } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { exportDeckToJson } from '@/utils/import-export';

type DeckDetailScreenProps = {
	deckId: number;
};

export function DeckDetailScreen({ deckId }: DeckDetailScreenProps) {
	const router = useRouter();

	const { currentDeck, flashcards, loadDeck, removeFlashcard } = useFlashcardsStore();
	const [searchQuery, setSearchQuery] = useState('');

	// Filter flashcards based on search query
	const filteredFlashcards = useMemo(() => {
		if (!searchQuery.trim()) return flashcards;
		const query = searchQuery.toLowerCase().trim();
		return flashcards.filter((fc) => fc.question.toLowerCase().includes(query) || fc.answer.toLowerCase().includes(query));
	}, [flashcards, searchQuery]);

	useEffect(() => {
		loadDeck(deckId);
	}, [deckId, loadDeck]);

	const handleDeleteFlashcard = (flashcardId: number) => {
		Alert.alert('Elimina flashcard', 'Sei sicuro di voler eliminare questa flashcard?', [
			{ text: 'Annulla', style: 'cancel' },
			{ text: 'Elimina', style: 'destructive', onPress: () => removeFlashcard(flashcardId) },
		]);
	};

	const handleExport = async () => {
		try {
			const json = await exportDeckToJson(deckId);
			await Share.share({
				message: json,
				title: `${currentDeck?.title}.json`,
			});
		} catch {
			Alert.alert('Errore', 'Impossibile esportare il mazzo');
		}
	};

	if (!currentDeck) {
		return (
			<View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
				<Text color="$secondary">Caricamento...</Text>
			</View>
		);
	}

	return (
		<View flex={1} backgroundColor="$background">
			<Header
				title={currentDeck.title}
				subtitle={currentDeck.description}
				actions={[<HeaderAction key="edit" icon="edit" onPress={() => router.push(`/deck/${deckId}/edit`)} />]}
			/>

			<YStack flex={1} padding="$4" gap="$4">
				{/* Actions */}
				<View flexDirection="row" gap="$3">
					<View flex={1}>
						<Button size="$4" onPress={() => router.push(`/deck/${deckId}/flashcard/new`)} themeInverse>
							+ Flashcard
						</Button>
					</View>
					{flashcards.length > 0 && (
						<View flex={1}>
							<Button size="$4" onPress={() => router.push(`/deck/${deckId}/quiz`)}>
								▶ Quiz
							</Button>
						</View>
					)}
				</View>

				{/* Search bar */}
				{flashcards.length > 0 && <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Cerca flashcard..." />}

				{/* Flashcards list */}
				{flashcards.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$secondary" fontSize={16} textAlign="center">
							Nessuna flashcard in questo mazzo.{'\n'}Aggiungine una!
						</Text>
					</YStack>
				) : filteredFlashcards.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$secondary" fontSize={16} textAlign="center">
							Nessuna flashcard trovata per &quot;{searchQuery}&quot;
						</Text>
					</YStack>
				) : (
					<FlatList
						data={filteredFlashcards}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => (
							<FlashcardListItem
								flashcard={item}
								onPress={() => router.push(`/deck/${deckId}/flashcard/${item.id}/edit`)}
								onLongPress={() => handleDeleteFlashcard(item.id)}
							/>
						)}
						contentContainerStyle={{ paddingBottom: 20 }}
						ItemSeparatorComponent={() => <View height={10} />}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</YStack>
		</View>
	);
}
