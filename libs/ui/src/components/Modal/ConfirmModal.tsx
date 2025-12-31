import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import React from 'react';


export interface ConfirmModalProps {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmColor?: string;
	size?: string | number;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	opened,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	confirmColor = 'blue',
	size = 'md',
}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{title}</Title>}
			size={size}
			centered
		>
			<Stack gap='md'>
				<Text>{message}</Text>
				<Group justify='flex-end'>
					<Button variant='outline' onClick={onClose}>
						{cancelLabel}
					</Button>
					<Button color={confirmColor} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

