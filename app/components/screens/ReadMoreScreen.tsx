import { ScrollView } from 'react-native';
import { View, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { HtmlContent } from '@/components/ui/HtmlContent';

type ReadMoreScreenProps = {
	type: 'question' | 'answer';
	content: string;
};

export function ReadMoreScreen({ type, content }: ReadMoreScreenProps) {
	const insets = useSafeAreaInsets();

	const title = type === 'question' ? 'Domanda' : 'Risposta';

	return (
		<View flex={1} backgroundColor="$background">
			<Header title={title} isModal />

			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
				<Stack gap="$4" flex={1} paddingHorizontal="$4" paddingVertical="$2">
					<HtmlContent html={content || ''} />
				</Stack>
			</ScrollView>
		</View>
	);
}
