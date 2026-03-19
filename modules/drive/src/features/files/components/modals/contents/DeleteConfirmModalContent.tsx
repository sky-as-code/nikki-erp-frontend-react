import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRefreshCurrentFolder } from '../../../hooks';

import { driveFileActions } from '@/appState/file';


type DeleteConfirmModalProps = {
	fileId: string;
	fileName: string;
	parentDriveFileRef?: string;
	onClose: () => void;
};

export function DeleteConfirmModalContent({
	fileId,
	fileName,
	parentDriveFileRef,
	onClose,
}: DeleteConfirmModalProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const { refresh } = useRefreshCurrentFolder();
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			const result = await (
				dispatch as (action: unknown) => Promise<{ type?: string }>
			)(driveFileActions.deleteDriveFile(fileId));

			if (result?.type?.endsWith('/fulfilled')) {
				refresh({
					parentId: parentDriveFileRef,
					includeTree: true,
					treePageSize: 50,
				});
				notifications.show({
					title: t('nikki.drive.toast.deleteSuccess'),
					message: fileName,
					color: 'green',
				});
				onClose();
			}
			else {
				notifications.show({
					title: t('nikki.drive.toast.deleteError'),
					message: fileName,
					color: 'red',
				});
			}
		}
		finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Text size='sm' c='dimmed'>
				{t('nikki.drive.deleteConfirm.message', { name: fileName })}
			</Text>
			<Group justify='flex-end' mt='md' gap='xs'>
				<Button variant='subtle' onClick={onClose} disabled={loading}>
					{t('nikki.drive.modals.cancel')}
				</Button>
				<Button color='red' onClick={handleConfirm} loading={loading}>
					{t('nikki.drive.deleteConfirm.delete')}
				</Button>
			</Group>
		</>
	);
}
