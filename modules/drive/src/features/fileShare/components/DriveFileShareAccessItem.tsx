import { ActionIcon, Box, Group, Paper, Tooltip } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { DriveUserDisplay } from '@/components';
import { DriveFileSharePermissionDisplay } from '@/features/fileShare';
import { resolveUserRef } from '@/features/fileShare/driveFileShareUserUtils';
import { DriveFileSharePermission, type DriveFileShare } from '@/features/fileShare/type';


export type DriveFileShareAccessItemProps = {
	share: DriveFileShare;
	readOnly?: boolean;
	onOpenDetail?: () => void;
};

export function DriveFileShareAccessItem({
	share,
	readOnly = false,
	onOpenDetail,
}: DriveFileShareAccessItemProps): React.ReactNode {
	const { t } = useTranslation();
	/** Owner gốc không có nút; ancestor-owner (kế thừa từ folder cha) vẫn mở modal dù row “read-only”. */
	const showDetailButton =
		Boolean(onOpenDetail)
		&& share.permission !== DriveFileSharePermission.OWNER
		&& (!readOnly || share.permission === DriveFileSharePermission.ANCESTOR_OWNER);

	return (
		<Paper withBorder radius='md' p='sm' mih={52}>
			<Group justify='space-between' align='center' wrap='nowrap' gap='sm'>
				<Box style={{ flex: 1, minWidth: 0 }}>
					<DriveUserDisplay
						displayName={share.user?.displayName ?? resolveUserRef(share) ?? '-'}
						email={share.user?.email}
						avatarUrl={share.user?.avatarUrl ?? null}
						avatarSize={32}
					/>
				</Box>
				<Group gap='xs' wrap='nowrap' align='center'>
					<DriveFileSharePermissionDisplay
						e={share.permission}
						textProps={{ size: 'xs', style: { lineHeight: 1.25 } }}
					/>
					{showDetailButton ? (
						<Tooltip label={t('nikki.drive.share.accessDetailButton')} position='left' withArrow>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='md'
								aria-label={t('nikki.drive.share.accessDetailButton')}
								onClick={onOpenDetail}
							>
								<IconEdit size={18} />
							</ActionIcon>
						</Tooltip>
					) : null}
				</Group>
			</Group>
		</Paper>
	);
}
