import { useState, useCallback } from 'react';
import { Modal, StyleSheet, View as RNView } from 'react-native';
import { Button, YStack, AlertDialog } from 'tamagui';

type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

type AlertConfig = {
  title: string;
  message: string;
  buttons: AlertButton[];
};

type UseAppAlertOptions = {
  /**
   * When false, render dialog inline instead of using Portal.
   * Useful for native modal routes where portal content can appear behind the modal.
   */
  usePortal?: boolean;
  /**
   * When true, mount the Tamagui AlertDialog inside a react-native Modal.
   * Useful to ensure full-screen overlay above sheet-style modal presentations.
   */
  useModal?: boolean;
};

/**
 * Cross-platform alert hook using Tamagui AlertDialog.
 * API mirrors React Native's Alert.alert(title, message, buttons).
 */
export function useAppAlert(options: UseAppAlertOptions = {}) {
  const { usePortal = true, useModal = false } = options;
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    setConfig({
      title,
      message,
      buttons: buttons ?? [{ text: 'OK' }],
    });
  }, []);

  const handleClose = useCallback(() => {
    setConfig(null);
  }, []);

  const handleButtonPress = useCallback((button: AlertButton) => {
    setConfig(null);
    button.onPress?.();
  }, []);

  const dialogContent = config ? (
    <AlertDialog.Content
      key="content"
      bordered
      elevate
      maxWidth={340}
      paddingHorizontal="$5"
      paddingVertical="$5"
      borderRadius="$6"
      zIndex={1001}
      alignSelf={useModal ? 'center' : undefined}
      testID="app-alert-content"
    >
      <YStack gap="$3">
        <AlertDialog.Title size="$6" testID="app-alert-title">
          {config.title}
        </AlertDialog.Title>
        <AlertDialog.Description size="$3" color="$secondary" testID="app-alert-message">
          {config.message}
        </AlertDialog.Description>
        <YStack gap="$2" paddingTop="$2">
          {config.buttons.map((button, index) => {
            const isCancel = button.style === 'cancel';
            const isDestructive = button.style === 'destructive';
            const Wrapper = isCancel ? AlertDialog.Cancel : AlertDialog.Action;

            return (
              <Wrapper key={index} asChild>
                <Button
                  borderRadius="$4"
                  {...(isDestructive ? { theme: 'red' } : {})}
                  onPress={() => handleButtonPress(button)}
                  testID={`app-alert-button-${
                    isCancel ? 'cancel' : isDestructive ? 'destructive' : 'default'
                  }-${index}`}
                  accessibilityLabel={`app-alert-button-${
                    isCancel ? 'cancel' : isDestructive ? 'destructive' : 'default'
                  }-${index}`}
                >
                  {button.text}
                </Button>
              </Wrapper>
            );
          })}
        </YStack>
      </YStack>
    </AlertDialog.Content>
  ) : null;

  const dialogBody = config ? (
    <>
      <AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" zIndex={1000} />
      {useModal ? (
        <RNView pointerEvents="box-none" style={styles.centeredContentContainer}>
          {dialogContent}
        </RNView>
      ) : (
        dialogContent
      )}
    </>
  ) : null;

  const alertDialogNode = config ? (
    <AlertDialog
      open
      onOpenChange={(open: boolean) => {
        if (!open) handleClose();
      }}
    >
      {usePortal && !useModal ? <AlertDialog.Portal>{dialogBody}</AlertDialog.Portal> : dialogBody}
    </AlertDialog>
  ) : null;

  const AlertDialogComponent =
    config && useModal ? (
      <Modal
        visible
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <RNView style={styles.modalRoot}>{alertDialogNode}</RNView>
      </Modal>
    ) : (
      alertDialogNode
    );

  return { showAlert, AlertDialog: AlertDialogComponent };
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  centeredContentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
