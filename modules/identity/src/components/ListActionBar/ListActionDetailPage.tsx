import { Button, Group as MantineGroup } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { IconCheck, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


interface ListActionDetailPageProps {
	onDelete?: () => void;
	disableSave?: boolean;
	disableDelete?: boolean;
	titleDelete: string;
	titleConfirmDelete: string;
	messageConfirmDelete: string;
}

export function ListActionDetailPage({
	onDelete,
	disableSave = false,
	disableDelete = false,
	titleDelete,
	titleConfirmDelete,
	messageConfirmDelete,
}: ListActionDetailPageProps): React.ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const handleBack = () => {
		navigate(-1);
	};

	const handleDeleteClick = () => {
		if (!onDelete) return;
		setShowDeleteConfirm(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		onDelete?.();
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
					disabled={disableSave}
				>
					{t('nikki.identity.group.actions.save')}
				</Button>
				{onDelete && (
					<Button
						leftSection={<IconTrash size={16} />}
						size='sm'
						variant='outline'
						color='red'
						onClick={handleDeleteClick}
						disabled={disableDelete}
					>
						{t('nikki.identity.group.actions.delete')}
					</Button>
				)}
			</MantineGroup>

			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleConfirmDelete}
				title={titleDelete}
				message={messageConfirmDelete}
				confirmLabel={titleConfirmDelete}
				confirmColor='red'
			/>
		</>
	);
}
