import { ScrollView as RNScrollView } from 'react-native';
import { View, YStack } from 'tamagui';

import { FlashcardFormActions } from '@/components/flashcard-form/FlashcardFormActions';
import { MultipleChoiceOptionsField } from '@/components/flashcard-form/MultipleChoiceOptionsField';
import type { OptionField } from '@/components/flashcard-form/types';
import { FORM_CONTENT_PADDING } from '@/components/screens/flashcard-form/constants';
import type { FlashcardFormColors } from '@/components/screens/flashcard-form/types';

type FlashcardOptionsSectionProps = {
  options: OptionField[];
  colors: FlashcardFormColors;
  addOptionLabel: string;
  getOptionPlaceholder: (index: number) => string;
  optionsError?: string;
  saveLabel: string;
  showSave: boolean;
  scrollContentBottomPadding: number;
  keyboardDismissMode: 'interactive' | 'on-drag';
  onAddOption: () => void;
  onOptionTextChange: (index: number, text: string) => void;
  onSetCorrectOption: (index: number) => void;
  onRemoveOption: (index: number) => void;
  onSave: () => void;
};

export function FlashcardOptionsSection({
  options,
  colors,
  addOptionLabel,
  getOptionPlaceholder,
  optionsError,
  saveLabel,
  showSave,
  scrollContentBottomPadding,
  keyboardDismissMode,
  onAddOption,
  onOptionTextChange,
  onSetCorrectOption,
  onRemoveOption,
  onSave,
}: FlashcardOptionsSectionProps) {
  return (
    <RNScrollView
      style={{ flex: 1 }}
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustKeyboardInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode={keyboardDismissMode}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: FORM_CONTENT_PADDING,
        paddingBottom: scrollContentBottomPadding,
      }}
    >
      <YStack gap="$4" paddingHorizontal="$4">
        <View>
          <MultipleChoiceOptionsField
            options={options}
            colors={colors}
            addOptionLabel={addOptionLabel}
            getOptionPlaceholder={getOptionPlaceholder}
            optionsError={optionsError}
            onAddOption={onAddOption}
            onOptionTextChange={onOptionTextChange}
            onSetCorrectOption={onSetCorrectOption}
            onRemoveOption={onRemoveOption}
          />
        </View>
        <FlashcardFormActions showSave={showSave} saveLabel={saveLabel} onSave={onSave} />
      </YStack>
    </RNScrollView>
  );
}
