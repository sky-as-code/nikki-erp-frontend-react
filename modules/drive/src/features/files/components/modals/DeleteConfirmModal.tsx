import { Button, Group, Text } from '@mantine/core';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useState } from 'react';

import { driveFileActions } from '@/appState/file';

import { useRefreshCurrentFolder } from '../../hooks';

type DeleteConfirmModalProps = {
	fileId: string;
	fileName: string;
	parentDriveFileRef?: string;
	onClose: () => void;
};

export function DeleteConfirmModal({
	fileId,
	fileName,
	parentDriveFileRef,
	onClose,
}: DeleteConfirmModalProps): React.ReactNode {
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
				onClose();
			}
		}
		finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Text size='sm' c='dimmed'>
				Are you sure you want to permanently delete &quot;{fileName}&quot;? This action cannot be undone.
			</Text>
			<Group justify='flex-end' mt='md' gap='xs'>
				<Button variant='subtle' onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button color='red' onClick={handleConfirm} loading={loading}>
					Delete
				</Button>
			</Group>
		</>
	);
}
