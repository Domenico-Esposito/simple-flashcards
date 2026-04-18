import { Pressable, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, Text, View, XStack, YStack } from 'tamagui';

import { FormErrorText } from '@/components/ui/FormErrorText';
import type { OptionField } from '@/components/flashcard-form/types';

type MultipleChoiceOptionsFieldProps = {
  options: OptionField[];
  colors: {
    success: string;
    iconDefault: string;
    placeholder: string;
    text: string;
    border: string;
    inputBg: string;
    error: string;
    accent: string;
  };
  addOptionLabel: string;
  getOptionPlaceholder: (index: number) => string;
  optionsError?: string;
  onAddOption: () => void;
  onOptionTextChange: (index: number, text: string) => void;
  onSetCorrectOption: (index: number) => void;
  onRemoveOption: (index: number) => void;
  onOptionFocus?: (optionId: string) => void;
  onOptionBlur?: () => void;
  onOptionSelectionChange?: () => void;
  inputAccessoryViewID?: string;
};

export function MultipleChoiceOptionsField({
  options,
  colors,
  addOptionLabel,
  getOptionPlaceholder,
  optionsError,
  onAddOption,
  onOptionTextChange,
  onSetCorrectOption,
  onRemoveOption,
  onOptionFocus,
  onOptionBlur,
  onOptionSelectionChange,
  inputAccessoryViewID,
}: MultipleChoiceOptionsFieldProps) {
  return (
    <YStack gap="$3">
      {options.map((option, index) => (
        <XStack key={option.id} gap="$2" alignItems="center">
          <Pressable
            onPress={() => onSetCorrectOption(index)}
            hitSlop={8}
            testID={`flashcard-form-option-correct-${index}`}
            accessibilityLabel={`flashcard-form-option-correct-${index}`}
          >
            <MaterialIcons
              name={option.isCorrect ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={option.isCorrect ? colors.success : colors.iconDefault}
            />
          </Pressable>
          <View flex={1}>
            <TextInput
              testID={`flashcard-form-option-input-${index}`}
              accessibilityLabel={`flashcard-form-option-input-${index}`}
              value={option.text}
              onChangeText={(text) => onOptionTextChange(index, text)}
              onSelectionChange={onOptionSelectionChange}
              onFocus={() => onOptionFocus?.(option.id)}
              onBlur={onOptionBlur}
              inputAccessoryViewID={inputAccessoryViewID}
              placeholder={getOptionPlaceholder(index)}
              placeholderTextColor={colors.placeholder}
              style={{
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: option.isCorrect ? colors.success : colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.inputBg,
              }}
            />
          </View>
          {options.length > 2 && (
            <Pressable
              onPress={() => onRemoveOption(index)}
              hitSlop={8}
              testID={`flashcard-form-option-remove-${index}`}
              accessibilityLabel={`flashcard-form-option-remove-${index}`}
            >
              <MaterialIcons name="close" size={20} color={colors.error} />
            </Pressable>
          )}
        </XStack>
      ))}
      <Button
        size="$3"
        onPress={onAddOption}
        chromeless
        icon={<MaterialIcons name="add" size={18} color={colors.accent} />}
        testID="flashcard-form-add-option-button"
        accessibilityLabel="flashcard-form-add-option-button"
      >
        <Text color={colors.accent}>{addOptionLabel}</Text>
      </Button>
      <FormErrorText
        message={optionsError}
        testID="flashcard-form-options-error"
        accessibilityLabel="flashcard-form-options-error"
      />
    </YStack>
  );
}
