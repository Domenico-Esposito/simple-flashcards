import { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Alert, TextInput as RNTextInput } from 'react-native';
import { Button, Input, Text, TextArea, View, XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';

type EditDeckScreenProps = {
	deckId: number;
};

export function EditDeckScreen({ deckId }: EditDeckScreenProps) {
	const router = useRouter();

	const { currentDeck, loadDeck, editDeck, removeDeck } = useFlashcardsStore();

	const titleRef = useRef<RNTextInput>(null);
	const descriptionRef = useRef<RNTextInput>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [emoji, setEmoji] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		loadDeck(deckId);
	}, [deckId, loadDeck]);

	useEffect(() => {
		if (currentDeck) {
			setTitle(currentDeck.title);
			setDescription(currentDeck.description || '');
			setEmoji(currentDeck.emoji || '');
			// Update the actual input values
			if (titleRef.current) {
				titleRef.current.setNativeProps({ text: currentDeck.title });
			}
			if (descriptionRef.current) {
				descriptionRef.current.setNativeProps({ text: currentDeck.description || '' });
			}
		}
	}, [currentDeck]);

	const handleSave = async () => {
		if (!title.trim()) {
			setError('Il titolo è obbligatorio');
			return;
		}

		await editDeck(deckId, title.trim(), description.trim() || undefined, emoji.trim() || undefined);
		router.back();
	};

	const handleDelete = () => {
		Alert.alert('Elimina mazzo', 'Sei sicuro di voler eliminare questo mazzo e tutte le sue flashcard?', [
			{ text: 'Annulla', style: 'cancel' },
			{
				text: 'Elimina',
				style: 'destructive',
				onPress: async () => {
					await removeDeck(deckId);
					router.dismissAll();
				},
			},
		]);
	};

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<View flex={1} backgroundColor="$background">
				<Header title="Modifica Mazzo" isModal />
				<YStack gap="$4" flex={1} padding="$4">
					<XStack gap="$3" alignItems="center">
						<Input
							id="emoji"
							size="$4"
							defaultValue={emoji}
							onChangeText={(text) => {
								// Extract only the first emoji/character
								const firstEmoji = [...text].slice(-1).join('');
								setEmoji(firstEmoji);
							}}
							placeholder="📚"
							width={60}
							textAlign="center"
							fontSize={28}
							borderWidth={1}
							borderColor="$borderColor"
							borderRadius="$4"
							backgroundColor="$backgroundHover"
						/>
						<YStack flex={1} gap="$2">
							<Input
								ref={titleRef}
								id="title"
								size="$4"
								defaultValue={title}
								onChangeText={(text) => {
									setTitle(text);
									setError('');
								}}
								placeholder="Titolo"
								borderWidth={0}
								backgroundColor="transparent"
								paddingHorizontal={0}
								paddingVertical={0}
								fontSize={24}
								fontWeight="700"
								color="$color"
								placeholderTextColor="$color9"
							/>
							{error && (
								<Text fontSize={12} color="$red10">
									{error}
								</Text>
							)}
						</YStack>
					</XStack>

					<YStack gap="$1" flex={1}>
						<TextArea
							ref={descriptionRef}
							id="description"
							size="$4"
							flex={1}
							defaultValue={description}
							onChangeText={setDescription}
							placeholder="Corpo del testo (facoltativo)"
							borderWidth={0}
							backgroundColor="transparent"
							paddingHorizontal={0}
							paddingVertical={0}
							fontSize={12}
							color="$color"
							placeholderTextColor="$color9"
						/>
					</YStack>

					<YStack gap="$3">
						<Button size="$4" onPress={handleSave} themeInverse>
							Salva
						</Button>
						<Button size="$4" onPress={handleDelete} theme="red">
							Elimina mazzo
						</Button>
						<Button size="$4" onPress={() => router.back()} chromeless>
							Annulla
						</Button>
					</YStack>
				</YStack>
			</View>
		</KeyboardAvoidingView>
	);
}
