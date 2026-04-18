import { Button, AlertDialog, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

type QuizExitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitWithSave: () => void;
  onExitDiscard: () => void;
};

export function QuizExitDialog({
  open,
  onOpenChange,
  onExitWithSave,
  onExitDiscard,
}: QuizExitDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
        <AlertDialog.Content
          key="content"
          bordered
          elevate
          maxWidth={340}
          paddingHorizontal="$5"
          paddingVertical="$5"
          borderRadius="$6"
          testID="quiz-exit-dialog"
        >
          <YStack gap="$3">
            <AlertDialog.Title size="$6">{t('quiz.exitTitle')}</AlertDialog.Title>
            <AlertDialog.Description size="$3" color="$secondary">
              {t('quiz.exitMessage')}
            </AlertDialog.Description>
            <YStack gap="$2" paddingTop="$2">
              <AlertDialog.Cancel asChild>
                <Button
                  borderRadius="$4"
                  testID="quiz-exit-cancel-button"
                  accessibilityLabel="quiz-exit-cancel-button"
                >
                  {t('common.cancel')}
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  borderRadius="$4"
                  onPress={onExitWithSave}
                  testID="quiz-exit-save-button"
                  accessibilityLabel="quiz-exit-save-button"
                >
                  {t('common.exit')}
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Action asChild>
                <Button
                  theme="red"
                  borderRadius="$4"
                  onPress={onExitDiscard}
                  testID="quiz-exit-discard-button"
                  accessibilityLabel="quiz-exit-discard-button"
                >
                  {t('quiz.exitWithoutSaving')}
                </Button>
              </AlertDialog.Action>
            </YStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}

type QuizAllEasyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExit: () => void;
  onContinue: () => void;
};

export function QuizAllEasyDialog({
  open,
  onOpenChange,
  onExit,
  onContinue,
}: QuizAllEasyDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
        <AlertDialog.Content
          key="content"
          bordered
          elevate
          maxWidth={340}
          paddingHorizontal="$5"
          paddingVertical="$5"
          borderRadius="$6"
          testID="quiz-all-easy-dialog"
        >
          <YStack gap="$3">
            <AlertDialog.Title size="$6">{t('quiz.allEasyTitle')}</AlertDialog.Title>
            <AlertDialog.Description size="$3" color="$secondary">
              {t('quiz.allEasyMessage')}
            </AlertDialog.Description>
            <YStack gap="$2" paddingTop="$2">
              <AlertDialog.Action asChild>
                <Button
                  theme="active"
                  borderRadius="$4"
                  onPress={onExit}
                  testID="quiz-all-easy-exit-button"
                  accessibilityLabel="quiz-all-easy-exit-button"
                >
                  {t('quiz.closeButton')}
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Cancel asChild>
                <Button
                  borderRadius="$4"
                  onPress={onContinue}
                  testID="quiz-all-easy-continue-button"
                  accessibilityLabel="quiz-all-easy-continue-button"
                >
                  {t('quiz.continue')}
                </Button>
              </AlertDialog.Cancel>
            </YStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
