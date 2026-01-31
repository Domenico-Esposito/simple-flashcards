import { useEffect, useState, useMemo } from 'react';
import { FlatList, Alert, Share, Pressable } from 'react-native';
import { Text, View, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardListItem } from '@/components/FlashcardListItem';
import { Header, createHeaderAction } from '@/components/Header';
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
				<Text color="$gray10">Caricamento...</Text>
			</View>
		);
	}

	return (
		<View flex={1} backgroundColor="$background">
			<Header
				title={currentDeck.title}
				subtitle={currentDeck.description}
				actions={[
					createHeaderAction({ icon: 'bar-chart', label: 'Statistiche', onPress: () => router.push(`/deck/${deckId}/statistics`) }),
					createHeaderAction({ icon: 'edit', label: 'Modifica', onPress: () => router.push(`/deck/${deckId}/edit`) }),
				]}
			/>

			<YStack flex={1} paddingHorizontal="$4" gap="$4">
				{/* Action Buttons */}
				<XStack gap="$3">
					<Pressable 
						onPress={() => router.push(`/deck/${deckId}/flashcard/new`)} 
						style={{ flex: 1 }}
					>
						<View
							backgroundColor="$primary"
							borderRadius="$4"
							padding="$4"
							alignItems="center"
							justifyContent="center"
							gap="$2"
						>
							<MaterialIcons name="add" size={24} color="#FFFFFF" />
							<Text fontSize={14} fontWeight="600" color="#FFFFFF">
								Nuova Flashcard
							</Text>
						</View>
					</Pressable>
					{flashcards.length > 0 && (
						<Pressable 
							onPress={() => router.push(`/deck/${deckId}/quiz`)} 
							style={{ flex: 1 }}
						>
							<View
								backgroundColor="$backgroundStrong"
								borderRadius="$4"
								padding="$4"
								alignItems="center"
								justifyContent="center"
								gap="$2"
							>
								<MaterialIcons name="play-arrow" size={24} color="#4CD964" />
								<Text fontSize={14} fontWeight="600" color="$color">
									Avvia Quiz
								</Text>
							</View>
						</Pressable>
					)}
				</XStack>

				{/* Search bar */}
				{flashcards.length > 0 && <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Cerca flashcard..." />}

				{/* Section title */}
				{flashcards.length > 0 && (
					<Text fontSize={18} fontWeight="600" color="$color" marginTop="$2">
						Flashcard ({flashcards.length})
					</Text>
				)}

				{/* Flashcards list */}
				{flashcards.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$gray10" fontSize={16} textAlign="center">
							Nessuna flashcard in questo mazzo.{'\n'}Aggiungine una!
						</Text>
					</YStack>
				) : filteredFlashcards.length === 0 ? (
					<YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
						<Text color="$gray10" fontSize={16} textAlign="center">
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
