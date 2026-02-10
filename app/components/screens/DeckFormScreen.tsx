import { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Alert, TextInput as RNTextInput } from 'react-native';
import { Button, Text, TextArea, View, YStack, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';

import { useFlashcardsStore } from '@/store/flashcards';
import { Header } from '@/components/Header';

const TITLE_LINE_HEIGHT = 32;

type DeckFormScreenProps = {
	deckId?: number;
};

/**
 * Unified deck form screen for creating and editing decks.
 * When deckId is provided, operates in edit mode; otherwise in create mode.
 */
export function DeckFormScreen({ deckId }: DeckFormScreenProps) {
	const isEditing = deckId != null;
	const router = useRouter();
	const theme = useTheme();

	const { currentDeck, loadDeck, addDeck, editDeck, removeDeck } = useFlashcardsStore();

	const titleRef = useRef<RNTextInput>(null);
	const descriptionRef = useRef<RNTextInput>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (isEditing) {
			loadDeck(deckId);
		}
	}, [deckId, isEditing, loadDeck]);

	useEffect(() => {
		if (isEditing && currentDeck) {
			setTitle(currentDeck.title);
			setDescription(currentDeck.description || '');
			// Update the actual input values
			if (titleRef.current) {
				titleRef.current.setNativeProps({ text: currentDeck.title });
			}
			if (descriptionRef.current) {
				descriptionRef.current.setNativeProps({ text: currentDeck.description || '' });
			}
		}
	}, [isEditing, currentDeck]);

	const handleSave = async () => {
		if (!title.trim()) {
			setError('Il titolo è obbligatorio');
			return;
		}

		if (isEditing) {
			await editDeck(deckId, title.trim(), description.trim() || undefined);
		} else {
			await addDeck(title.trim(), description.trim() || undefined);
		}
		router.back();
	};

	const handleDelete = () => {
		if (!isEditing) return;
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
				<Header title={isEditing ? 'Modifica Mazzo' : 'Nuovo Mazzo'} isModal={isEditing} />
				<YStack gap="$4" flex={1} padding="$4">
					<YStack gap="$2">
						<RNTextInput
							ref={titleRef}
							defaultValue={title}
							onChangeText={(text) => {
								setTitle(text);
								setError('');
							}}
							placeholder="Titolo"
							multiline
							scrollEnabled={false}
							style={{
								fontSize: 24,
								lineHeight: TITLE_LINE_HEIGHT,
								fontWeight: '700',
								padding: 0,
								color: theme.color.val,
							}}
							placeholderTextColor={theme.color9.val}
						/>
						{error && (
							<Text fontSize={12} color="$red10">
								{error}
							</Text>
						)}
					</YStack>

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
							fontSize={16}
							color="$color"
							placeholderTextColor="$color9"
						/>
					</YStack>

					<YStack gap="$3">
						<Button size="$4" onPress={handleSave} themeInverse>
							Salva
						</Button>
						{isEditing && (
							<Button size="$4" onPress={handleDelete} theme="red">
								Elimina mazzo
							</Button>
						)}
						<Button size="$4" onPress={() => router.back()} chromeless>
							Annulla
						</Button>
					</YStack>
				</YStack>
			</View>
		</KeyboardAvoidingView>
	);
}
