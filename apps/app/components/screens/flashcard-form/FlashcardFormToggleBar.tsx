import { View, XStack } from 'tamagui';

import { CompactBooleanToggle } from '@/components/flashcard-form/CompactBooleanToggle';
import type { FlashcardFormColors } from '@/components/screens/flashcard-form/types';

type FlashcardFormToggleBarProps = {
  colors: FlashcardFormColors;
  isLargeScreen: boolean;
  isMultipleChoice: boolean;
  isSecondarySectionActive: boolean;
  questionHasError: boolean;
  secondarySectionHasError: boolean;
  standardTypeLabel: string;
  multipleChoiceTypeLabel: string;
  questionLabel: string;
  secondarySectionLabel: string;
  onCardTypeToggle: (enabled: boolean) => void;
  onSectionToggle: (enabled: boolean) => void;
};

export function FlashcardFormToggleBar({
  colors,
  isLargeScreen,
  isMultipleChoice,
  isSecondarySectionActive,
  questionHasError,
  secondarySectionHasError,
  standardTypeLabel,
  multipleChoiceTypeLabel,
  questionLabel,
  secondarySectionLabel,
  onCardTypeToggle,
  onSectionToggle,
}: FlashcardFormToggleBarProps) {
  return (
    <View bg="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
      <XStack gap="$2" px="$4" py="$2">
        <CompactBooleanToggle
          value={isMultipleChoice}
          onChange={onCardTypeToggle}
          accentColor={colors.accent}
          errorColor={colors.error}
          activeBackgroundColor={colors.accentBgTint}
          inactiveIconColor={colors.toolbarInactive}
          inactiveTextColor="$secondary"
          falseLabel={standardTypeLabel}
          trueLabel={multipleChoiceTypeLabel}
          falseIcon="short-text"
          trueIcon="playlist-add-check"
          falseTestID="flashcard-form-single-answer-toggle"
          trueTestID="flashcard-form-multiple-choice-toggle"
          showActiveLabel={isLargeScreen}
          equalSegmentWidths={isLargeScreen}
        />
        <CompactBooleanToggle
          value={isSecondarySectionActive}
          onChange={onSectionToggle}
          accentColor={colors.accent}
          errorColor={colors.error}
          activeBackgroundColor={colors.accentBgTint}
          inactiveIconColor={colors.toolbarInactive}
          inactiveTextColor="$secondary"
          falseLabel={questionLabel}
          trueLabel={secondarySectionLabel}
          falseIcon="help-outline"
          trueIcon={isMultipleChoice ? 'format-list-bulleted' : 'chat-bubble-outline'}
          falseTestID="flashcard-form-question-toggle"
          trueTestID="flashcard-form-answer-toggle"
          falseHasError={questionHasError}
          trueHasError={secondarySectionHasError}
          showActiveLabel={isLargeScreen}
          equalSegmentWidths={isLargeScreen}
        />
      </XStack>
    </View>
  );
}
