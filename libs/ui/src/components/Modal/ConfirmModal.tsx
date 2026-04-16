import { Button, Group, Modal, ModalProps, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface ConfirmModalProps {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: React.ReactNode;
	message?: React.ReactNode;
	confirmLabel?: React.ReactNode;
	cancelLabel?: React.ReactNode;
	confirmColor?: React.CSSProperties['color'];
	size?: ModalProps['size'];
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	opened,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel,
	cancelLabel,
	confirmColor = 'red',
	size = 'md',
}) => {

	const { t } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Text fw={700} fz='lg'>{title}</Text>}
			size={size}
			centered
		>
			<Stack gap='md'>
				<Text>{message}</Text>
				<Group justify='flex-end'>
					<Button variant='outline' onClick={onClose} color='gray'>
						{cancelLabel || t('nikki.general.actions.cancel')}
					</Button>
					<Button color={confirmColor} onClick={onConfirm}>
						{confirmLabel || t('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};