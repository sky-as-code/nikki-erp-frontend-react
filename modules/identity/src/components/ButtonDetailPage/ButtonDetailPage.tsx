import { Button, Group as MantineGroup } from '@mantine/core';
import { IconCheck, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ConfirmDialog } from '../ConfirmDialog';


interface ButtonDetailPageProps {
	onDelete: () => void;
	isLoading: boolean;
	disableSave?: boolean;
}

export function ButtonDetailPage({
	onDelete,
	isLoading,
	disableSave = false,
}: ButtonDetailPageProps): React.ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const handleBack = () => {
		navigate(-1);
	};

	const handleDeleteClick = () => {
		setShowDeleteConfirm(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		onDelete();
	};

	return (
		<>
			<MantineGroup>
				<Button
					leftSection={<IconArrowLeft size={16} />}
					size='sm'
					variant='outline'
					onClick={handleBack}
				>
					{t('nikki.identity.group.actions.back')}
				</Button>
				<Button
					leftSection={<IconCheck size={16} />}
					size='sm'
					variant='filled'
					type='submit'
					loading={isLoading}
					disabled={disableSave || isLoading}
				>
					{t('nikki.identity.group.actions.save')}
				</Button>
				<Button
					leftSection={<IconTrash size={16} />}
					size='sm'
					variant='outline'
					color='red'
					onClick={handleDeleteClick}
					loading={isLoading}
				>
					{t('nikki.identity.group.actions.delete')}
				</Button>
			</MantineGroup>

			<ConfirmDialog
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleConfirmDelete}
				title={t('nikki.identity.user.actions.confirmDelete')}
				message={t('nikki.identity.user.actions.confirmDeleteMessage')}
				confirmText={t('nikki.identity.group.actions.delete')}
				confirmColor='red'
				isLoading={isLoading}
			/>
		</>
	);
}
