import { useState, useCallback } from 'react';
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

/**
 * Cross-platform alert hook using Tamagui AlertDialog.
 * API mirrors React Native's Alert.alert(title, message, buttons).
 */
export function useAppAlert() {
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

	const AlertDialogComponent = config ? (
		<AlertDialog open onOpenChange={(open: boolean) => { if (!open) handleClose(); }}>
			<AlertDialog.Portal>
				<AlertDialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
				<AlertDialog.Content key="content" bordered elevate maxWidth={340} paddingHorizontal="$5" paddingVertical="$5" borderRadius="$6">
					<YStack gap="$3">
						<AlertDialog.Title size="$6">{config.title}</AlertDialog.Title>
						<AlertDialog.Description size="$3" color="$secondary">
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
										>
											{button.text}
										</Button>
									</Wrapper>
								);
							})}
						</YStack>
					</YStack>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog>
	) : null;

	return { showAlert, AlertDialog: AlertDialogComponent };
}
