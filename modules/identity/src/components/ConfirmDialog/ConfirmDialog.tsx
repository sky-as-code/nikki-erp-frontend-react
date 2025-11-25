import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface ConfirmDialogProps {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmColor?: string;
	isLoading?: boolean;
}

export function ConfirmDialog({
	opened,
	onClose,
	onConfirm,
	title,
	message,
	confirmText,
	cancelText,
	confirmColor = 'red',
	isLoading = false,
}: ConfirmDialogProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={title}
			centered
		>
			<Stack gap='md'>
				<Text size='sm'>{message}</Text>
				<Group justify='flex-end' gap='sm'>
					<Button
						variant='subtle'
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText || t('nikki.identity.group.actions.cancel')}
					</Button>
					<Button
						color={confirmColor}
						onClick={onConfirm}
						loading={isLoading}
					>
						{confirmText || t('nikki.identity.group.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
