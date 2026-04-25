import { ScrollView } from 'react-native';
import { View, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/layout/header';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

type ReadMoreScreenProps = {
  type: 'question' | 'answer';
  content: string;
};

export function ReadMoreScreen({ type, content }: ReadMoreScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const title = type === 'question' ? t('flashcard.question') : t('flashcard.answer');

  return (
    <View flex={1} bg="$background" testID="read-more-screen">
      <Header title={title} isModal />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <Stack gap="$4" flex={1} px="$4" py="$2" testID="read-more-content">
          <MarkdownContent markdown={content || ''} />
        </Stack>
      </ScrollView>
    </View>
  );
}
