import { Accordion, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';
import { shareAccessAccordionStyles } from './shareAccessAccordionStyles';

import type { UseDriveFileSharesByUserResult } from '@/features/fileShare/hooks/useDriveFileSharesByUser';
import type { DriveFileShare } from '@/features/fileShare/type';



export type DriveFileShareViewerSectionProps = {
	viewerShares: UseDriveFileSharesByUserResult;
	shellUser: { id: string; displayName: string; email: string; avatarUrl?: string } | null | undefined;
	/** `true` khi modal chi tiết chỉ xem, không chỉnh sửa (icon/tooltip tương ứng). */
	detailReadOnly?: boolean;
	onOpenShareDetail: (share: DriveFileShare) => void;
};

/**
 * Quyền của user đang đăng nhập trên file (giữa Owner và Inherited).
 * Ẩn khi user là chủ file (đã có hàng Owner phía trên).
 */
export function DriveFileShareViewerSection({
	viewerShares,
	shellUser,
	detailReadOnly = false,
	onOpenShareDetail,
}: DriveFileShareViewerSectionProps): React.ReactNode {
	const { t } = useTranslation();
	const {
		status,
		error,
		appliedShare,
	} = viewerShares;

	const anchorShare = React.useMemo((): DriveFileShare | null => {
		if (!appliedShare || !shellUser?.id) return null;
		return {
			...appliedShare,
			user: appliedShare.user ?? {
				id: shellUser.id,
				displayName: shellUser.displayName,
				email: shellUser.email,
				avatarUrl: shellUser.avatarUrl,
			},
		};
	}, [appliedShare, shellUser]);

	const openDetail = React.useCallback(() => {
		if (anchorShare) onOpenShareDetail(anchorShare);
	}, [anchorShare, onOpenShareDetail]);

	if (status === 'idle') return null;

	return (
		<Accordion
			defaultValue='viewer-section'
			variant='default'
			radius={0}
			styles={shareAccessAccordionStyles}
		>
			<Accordion.Item value='viewer-section'>
				<Accordion.Control>
					<Text size='xs' fw={400} c='dimmed'>
						{t('nikki.drive.share.viewerPermissionTitle')}
					</Text>
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap='xs'>
						{status === 'pending' ? (
							<Group justify='center' py='sm'>
								<Loader size='sm' />
							</Group>
						) : null}
						{status === 'error' ? (
							<Text size='sm' c='red'>{error ?? t('nikki.general.messages.error')}</Text>
						) : null}
						{status === 'success' && !appliedShare ? (
							<Paper withBorder radius='md' p='sm'>
								<Text size='sm' c='dimmed'>{t('nikki.drive.share.viewerPermissionEmpty')}</Text>
							</Paper>
						) : null}
						{status === 'success' && appliedShare && anchorShare ? (
							<DriveFileShareAccessItem
								share={anchorShare}
								detailReadOnly={detailReadOnly}
								onOpenDetail={openDetail}
							/>
						) : null}
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
}
