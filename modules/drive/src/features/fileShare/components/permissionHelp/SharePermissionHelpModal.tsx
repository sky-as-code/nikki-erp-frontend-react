import { Box, Divider, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SharePermissionSummaryTable } from './SharePermissionSummaryTable';


import type { DriveFileSharePermission as DriveFileSharePermissionType } from '@/features/fileShare/type';

import {
	DriveFileSharePermission,
	DriveFileSharePermissionDisplay,
} from '@/features/fileShare';
import { useDriveFileSharePermissionDescription } from '@/features/fileShare/hooks/enum/useDriveFileSharePermissionDescription';
import { SHARE_PERMISSION_INFO_ORDER } from '@/features/fileShare/sharePermissionConstants';


function showsParentFolderPermissionSuffix(permission: DriveFileSharePermissionType): boolean {
	return (
		permission === DriveFileSharePermission.INHERITED_VIEW
		|| permission === DriveFileSharePermission.INHERITED_EDIT
		|| permission === DriveFileSharePermission.INHERITED_EDIT_TRASH
		|| permission === DriveFileSharePermission.ANCESTOR_OWNER
	);
}

export type SharePermissionHelpModalProps = {
	opened: boolean;
	onClose: () => void;
};

export function SharePermissionHelpModal({ opened, onClose }: SharePermissionHelpModalProps): React.ReactNode {
	const { t } = useTranslation();
	const permissionDescription = useDriveFileSharePermissionDescription();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('nikki.drive.share.permissionHelpTitle')}
			size='xl'
			centered
		>
			<Stack gap='xl'>
				<Stack gap='lg'>
					{SHARE_PERMISSION_INFO_ORDER.map((perm) => (
						<Stack key={perm} gap={6}>
							<DriveFileSharePermissionDisplay
								e={perm}
								textProps={{ fw: 600, size: 'sm' }}
							/>
							<Text size='sm' c='dimmed' component='div' style={{ lineHeight: 1.55 }}>
								{permissionDescription(perm)}
								{showsParentFolderPermissionSuffix(perm) ? (
									<>
										{' '}
										<Box component='span' fw={700} c='dimmed' style={{ display: 'inline' }}>
											{t('nikki.drive.share.inheritedPermissionSuffix')}
										</Box>
									</>
								) : null}
							</Text>
						</Stack>
					))}
				</Stack>
				<Divider />
				<SharePermissionSummaryTable />
			</Stack>
		</Modal>
	);
}
