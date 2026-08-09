import { Button, Group, Modal, ModalProps, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
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
	/**
	 * `{module}.{component}` prefix for this dialog's buttons. Defaults to `ui.confirmModal`, which
	 * is unambiguous while only one confirmation is open — pass a prefix when a page can show two.
	 */
	testId?: string;
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
	testId,
}) => {

	const { t } = useTranslation();
	const prefix = testId ?? 'ui.confirmModal';

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
					<Button variant='outline' onClick={onClose} color='gray' {...testAttrs(prefix, 'cancel')}>
						{cancelLabel || t('nikki.general.actions.cancel')}
					</Button>
					<Button color={confirmColor} onClick={onConfirm} {...testAttrs(prefix, 'confirm')}>
						{confirmLabel || t('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};