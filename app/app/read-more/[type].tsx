import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { View, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { HtmlContent } from '@/components/ui/HtmlContent';

export default function ReadMoreScreen() {
	const { type, content } = useLocalSearchParams<{ type: 'question' | 'answer'; content: string }>();
	const insets = useSafeAreaInsets();

	const title = type === 'question' ? 'Domanda' : 'Risposta';

	return (
		<View flex={1} backgroundColor="$background">
			{/* Header */}
			<Header title={title} isModal />

			{/* Content */}
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
				<Stack gap="$4" flex={1} paddingHorizontal="$4" paddingVertical="$2">
					<HtmlContent html={content || ''} />
				</Stack>
			</ScrollView>
		</View>
	);
}
