import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useController, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { OptionField } from '@/components/flashcard-form/types';
import { useFlashcardsStore } from '@/store/flashcards';
import { FlashcardType } from '@/types';
import { getFlashcardById } from '@/utils/database';

export type FlashcardFormMode = 'new' | 'edit';

export type FlashcardFormValues = {
  question: string;
  answer: string;
  cardType: FlashcardType;
  options: OptionField[];
};

type UseFlashcardFormStateParams = {
  mode: FlashcardFormMode;
  deckId?: number;
  flashcardId?: number;
};

const DEFAULT_OPTIONS: OptionField[] = [
  { id: '1', text: '', isCorrect: true },
  { id: '2', text: '', isCorrect: false },
];

export function createDefaultOptions(): OptionField[] {
  return DEFAULT_OPTIONS.map((option) => ({ ...option }));
}

function serializeFormValues(values: FlashcardFormValues): string {
  return JSON.stringify({
    question: values.question,
    answer: values.answer,
    cardType: values.cardType,
    options: values.options.map((option) => ({
      id: option.id,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  });
}

export function useFlashcardFormState({ mode, deckId, flashcardId }: UseFlashcardFormStateParams) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    addFlashcard,
    addMultipleChoiceFlashcard,
    editFlashcard,
    editMultipleChoiceFlashcard,
    removeFlashcard,
  } = useFlashcardsStore();

  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const nextId = useRef(3);
  const initialValuesRef = useRef(
    serializeFormValues({
      question: '',
      answer: '',
      cardType: 'standard',
      options: createDefaultOptions(),
    }),
  );

  const {
    control,
    clearErrors,
    getValues,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FlashcardFormValues>({
    defaultValues: {
      question: '',
      answer: '',
      cardType: 'standard',
      options: createDefaultOptions(),
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const cardType = useWatch({ control, name: 'cardType' }) ?? 'standard';
  const watchedOptions = useWatch({ control, name: 'options' });

  const { field: questionField } = useController({
    control,
    name: 'question',
    rules: {
      validate: (value) => value.trim().length > 0 || t('flashcard.questionRequired'),
    },
  });

  const { field: answerField } = useController({
    control,
    name: 'answer',
    rules: {
      validate: (value) =>
        cardType === 'multiple_choice' || value.trim().length > 0 || t('flashcard.answerRequired'),
    },
  });

  const questionText = questionField.value;
  const answerText = answerField.value;
  const options = useMemo(() => watchedOptions ?? [], [watchedOptions]);

  const setInitialValues = useCallback(
    (values: FlashcardFormValues) => {
      initialValuesRef.current = serializeFormValues(values);
      reset(values);
    },
    [reset],
  );

  const { append, replace } = useFieldArray({
    control,
    name: 'options',
    keyName: 'fieldKey',
  });

  useEffect(() => {
    let isMounted = true;

    const loadFlashcard = async () => {
      if (mode !== 'edit') {
        setIsLoading(false);
        return;
      }

      if (!flashcardId) {
        setIsLoading(false);
        return;
      }

      const flashcard = await getFlashcardById(flashcardId);

      if (!isMounted) {
        return;
      }

      if (flashcard?.type === 'multiple_choice') {
        const loadedOptions = flashcard.options.map((option, index) => ({
          id: String(index + 1),
          text: option.text,
          isCorrect: option.isCorrect,
        }));

        nextId.current = loadedOptions.length + 1;
        setInitialValues({
          question: flashcard.question,
          answer: '',
          cardType: 'multiple_choice',
          options: loadedOptions,
        });
      } else if (flashcard) {
        nextId.current = 3;
        setInitialValues({
          question: flashcard.question,
          answer: flashcard.answer,
          cardType: 'standard',
          options: createDefaultOptions(),
        });
      }

      setIsLoading(false);
    };

    loadFlashcard();

    return () => {
      isMounted = false;
    };
  }, [flashcardId, mode, setInitialValues]);

  useEffect(() => {
    if (mode !== 'new') {
      return;
    }

    nextId.current = 3;
    setIsLoading(false);
    setInitialValues({
      question: '',
      answer: '',
      cardType: 'standard',
      options: createDefaultOptions(),
    });
  }, [mode, setInitialValues]);

  const handleAddOption = useCallback(() => {
    append({ id: String(nextId.current++), text: '', isCorrect: false });
    clearErrors('options');
  }, [append, clearErrors]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      const currentOptions = getValues('options');
      const updatedOptions = currentOptions.filter((_, optionIndex) => optionIndex !== index);

      if (currentOptions[index]?.isCorrect && updatedOptions.length > 0) {
        updatedOptions[0] = { ...updatedOptions[0], isCorrect: true };
      }

      replace(updatedOptions);
      clearErrors('options');
    },
    [clearErrors, getValues, replace],
  );

  const handleOptionTextChange = useCallback(
    (index: number, text: string) => {
      setValue(`options.${index}.text`, text, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearErrors('options');
    },
    [clearErrors, setValue],
  );

  const handleSetCorrectOption = useCallback(
    (index: number) => {
      const currentOptions = getValues('options');
      replace(
        currentOptions.map((option, optionIndex) => ({
          ...option,
          isCorrect: optionIndex === index,
        })),
      );
      clearErrors('options');
    },
    [clearErrors, getValues, replace],
  );

  const handleTypeChange = useCallback(
    (newType: FlashcardType) => {
      setValue('cardType', newType, { shouldDirty: true, shouldTouch: true });
      clearErrors(['answer', 'options']);
    },
    [clearErrors, setValue],
  );

  const validateOptions = useCallback(
    (values: OptionField[]): string | null => {
      const filledOptions = values.filter((option) => option.text.trim().length > 0);

      if (filledOptions.length < 2) {
        return t('flashcard.minOptionsRequired');
      }

      if (!filledOptions.some((option) => option.isCorrect)) {
        return t('flashcard.correctOptionRequired');
      }

      return null;
    },
    [t],
  );

  const handleSave = handleSubmit(async (values) => {
    const question = values.question.trim();

    if (values.cardType === 'multiple_choice') {
      const optionsValidationError = validateOptions(values.options);

      if (optionsValidationError) {
        setError('options', { type: 'validate', message: optionsValidationError });
        return;
      }

      const filledOptions = values.options
        .filter((option) => option.text.trim().length > 0)
        .map((option) => ({
          text: option.text.trim(),
          isCorrect: option.isCorrect,
        }));

      if (mode === 'new' && deckId !== undefined) {
        await addMultipleChoiceFlashcard(deckId, question, filledOptions);
      } else if (mode === 'edit' && flashcardId !== undefined) {
        await editMultipleChoiceFlashcard(flashcardId, question, filledOptions);
      }
    } else {
      const answer = values.answer.trim();

      if (mode === 'new' && deckId !== undefined) {
        await addFlashcard(deckId, question, answer);
      } else if (mode === 'edit' && flashcardId !== undefined) {
        await editFlashcard(flashcardId, question, answer);
      }
    }

    router.back();
  });

  const deleteCurrentFlashcard = useCallback(async () => {
    if (mode !== 'edit' || flashcardId === undefined) {
      return;
    }

    await removeFlashcard(flashcardId);
    router.back();
  }, [flashcardId, mode, removeFlashcard, router]);

  const shouldShowSave = useMemo(() => {
    if (mode === 'new') {
      return true;
    }

    return (
      serializeFormValues({
        question: questionText,
        answer: answerText,
        cardType,
        options,
      }) !== initialValuesRef.current
    );
  }, [answerText, cardType, mode, options, questionText]);

  return {
    isLoading,
    cardType,
    options,
    questionText,
    answerText,
    onQuestionChange: questionField.onChange,
    onAnswerChange: answerField.onChange,
    questionError: typeof errors.question?.message === 'string' ? errors.question.message : '',
    answerError: typeof errors.answer?.message === 'string' ? errors.answer.message : '',
    optionsError: typeof errors.options?.message === 'string' ? errors.options.message : '',
    shouldShowSave,
    canDelete: mode === 'edit' && flashcardId !== undefined,
    handleTypeChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionTextChange,
    handleSetCorrectOption,
    handleSave,
    deleteCurrentFlashcard,
  };
}
