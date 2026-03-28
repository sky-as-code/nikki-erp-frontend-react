import { ActionIcon, Box, Group, Paper, Tooltip } from '@mantine/core';
import { IconEdit, IconListDetails } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { DriveUserDisplay } from '@/components';
import { DriveFileSharePermissionDisplay } from '@/features/fileShare';
import { resolveUserRef } from '@/features/fileShare/driveFileShareUserUtils';
import { DriveFileSharePermission, type DriveFileShare } from '@/features/fileShare/type';


export type DriveFileShareAccessItemProps = {
	share: DriveFileShare;
	/** @deprecated Không còn dùng trong logic nút; giữ cho call site cũ. */
	readOnly?: boolean;
	/** `false`: ẩn nút chi tiết. Quyền `OWNER` trên dòng vẫn luôn ẩn nút. */
	allowOpenDetail?: boolean;
	/** `true`: chỉ xem chi tiết trong modal (icon + tooltip “xem”). */
	detailReadOnly?: boolean;
	onOpenDetail?: () => void;
};

export function DriveFileShareAccessItem({
	share,
	allowOpenDetail = true,
	detailReadOnly = false,
	onOpenDetail,
}: DriveFileShareAccessItemProps): React.ReactNode {
	const { t } = useTranslation();
	const detailLabel = detailReadOnly
		? t('nikki.drive.share.accessDetailViewButton')
		: t('nikki.drive.share.accessDetailButton');
	const showDetailButton =
		Boolean(onOpenDetail)
		&& allowOpenDetail !== false
		&& share.permission !== DriveFileSharePermission.OWNER;

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
						<Tooltip label={detailLabel} position='left' withArrow>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='md'
								aria-label={detailLabel}
								onClick={onOpenDetail}
							>
								{detailReadOnly ? <IconListDetails size={18} /> : <IconEdit size={18} />}
							</ActionIcon>
						</Tooltip>
					) : null}
				</Group>
			</Group>
		</Paper>
	);
}
