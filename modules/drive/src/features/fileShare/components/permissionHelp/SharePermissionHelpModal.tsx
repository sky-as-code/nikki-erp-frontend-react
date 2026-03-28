import { Box, Divider, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SharePermissionSummaryTable } from './SharePermissionSummaryTable';

import {
	DriveFileSharePermission,
	DriveFileSharePermissionDisplay,
} from '@/features/fileShare';
import { useDriveFileSharePermissionStrings } from '@/features/fileShare/hooks/enum/useDriveFileSharePermissionStrings';
import { SHARE_PERMISSION_INFO_ORDER } from '@/features/fileShare/sharePermissionConstants';
import { INHERITED_PERMISSIONS } from '../../driveFileShareAccessDetailUtils';


function showsParentFolderPermissionSuffix(permission: DriveFileSharePermission): boolean {
	return Object.values(INHERITED_PERMISSIONS).includes(permission);
}

export type SharePermissionHelpModalProps = {
	opened: boolean;
	onClose: () => void;
};

export function SharePermissionHelpModal({ opened, onClose }: SharePermissionHelpModalProps): React.ReactNode {
	const { t } = useTranslation();
	const { description: permissionDescription } = useDriveFileSharePermissionStrings();

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
