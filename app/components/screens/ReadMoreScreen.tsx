import { ScrollView } from 'react-native';
import { View, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
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
    <View flex={1} backgroundColor="$background">
      <Header title={title} isModal />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <Stack gap="$4" flex={1} paddingHorizontal="$4" paddingVertical="$2">
          <MarkdownContent markdown={content || ''} />
        </Stack>
      </ScrollView>
    </View>
  );
}
