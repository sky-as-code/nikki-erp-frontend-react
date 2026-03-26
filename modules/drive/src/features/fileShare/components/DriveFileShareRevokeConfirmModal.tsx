import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AncestorShareRow } from './DriveFileShareAccessDetailModalBody';

import type { DriveFileShare } from '@/features/fileShare/type';

import { useOrgModulePath } from '@/hooks/useRootPath';


export type DriveFileShareRevokeConfirmModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	inheritedAncestorRow: DriveFileShare | null;
};

export function DriveFileShareRevokeConfirmModal({
	opened,
	onClose,
	onConfirm,
	inheritedAncestorRow,
}: DriveFileShareRevokeConfirmModalProps): React.ReactNode {
	const { t } = useTranslation();
	const basePath = useOrgModulePath();
	const hasInherited = inheritedAncestorRow !== null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('nikki.drive.share.accessDetailRevokeConfirmTitle')}
			size='sm'
			centered
		>
			<Stack gap='md'>
				{hasInherited ? (
					<>
						<Text size='sm'>
							{t('nikki.drive.share.accessDetailRevokeHasInherited')}
						</Text>
						<AncestorShareRow row={inheritedAncestorRow} basePath={basePath} />
					</>
				) : (
					<Text size='sm'>
						{t('nikki.drive.share.accessDetailRevokeNoInherited')}
					</Text>
				)}
				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onClose}>
						{t('nikki.drive.share.accessDetailRevokeCancelButton')}
					</Button>
					<Button color='red' onClick={onConfirm}>
						{t('nikki.drive.share.accessDetailRevokeConfirmButton')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
