import { Accordion, Group, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';
import { shareAccessAccordionStyles } from './shareAccessAccordionStyles';

import type { DriveFile } from '@/features/files/types';
import type { DriveFileShare, DriveFileSharePermission as DriveFileSharePermissionType, GetDriveFileShareAncestorsResponse } from '@/features/fileShare/type';
import type { ReduxActionState } from '@nikkierp/ui/appState';

import { canOpenShareDetailRow } from '@/features/fileShare/driveFileShareAccessDetailUtils';


export type DriveFileShareInheritedSectionProps = {
	file: DriveFile;
	currentUserId: string | undefined;
	viewerAppliedPermission: DriveFileSharePermissionType | null | undefined;
	ancestorsState: ReduxActionState<GetDriveFileShareAncestorsResponse>;
	ancestorShares: DriveFileShare[];
	/** `true` khi modal chi tiết chỉ xem (icon mắt + tooltip). */
	detailReadOnly?: boolean;
	onOpenShareDetail?: (share: DriveFileShare) => void;
};

export function DriveFileShareInheritedSection({
	file,
	currentUserId,
	viewerAppliedPermission,
	ancestorsState,
	ancestorShares,
	detailReadOnly = false,
	onOpenShareDetail,
}: DriveFileShareInheritedSectionProps): React.ReactNode {
	const { t } = useTranslation();

	if (
		ancestorShares.length === 0
		&& ancestorsState.status !== 'pending'
		&& ancestorsState.status !== 'error'
	) {
		return null;
	}

	return (
		<Accordion
			variant='default'
			radius={0}
			styles={shareAccessAccordionStyles}
		>
			<Accordion.Item value='inherited-owners'>
				<Accordion.Control>
					<Text size='xs' fw={400} c='dimmed'>
						{t('nikki.drive.share.inheritedOwnersTitle')}
					</Text>
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap='xs'>
						{ancestorsState.status === 'error' ? (
							<Text size='xs' c='red'>
								{ancestorsState.error ?? t('nikki.general.messages.error')}
							</Text>
						) : null}
						{ancestorsState.status === 'pending' ? (
							<Group justify='center' py='sm'>
								<Loader size='sm' />
							</Group>
						) : (
							ancestorShares.map((share: DriveFileShare) => {
								const allowOpenDetail = canOpenShareDetailRow({
									file,
									share,
									currentUserId,
									layer: 'inherited',
									viewerAppliedPermission,
								});
								return (
									<DriveFileShareAccessItem
										key={share.id}
										share={share}
										readOnly
										detailReadOnly={detailReadOnly}
										allowOpenDetail={allowOpenDetail}
										onOpenDetail={
											allowOpenDetail && onOpenShareDetail
												? () => onOpenShareDetail(share)
												: undefined
										}
									/>
								);
							})
						)}
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
}
