import { Accordion, Group, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';
import { shareAccessAccordionStyles } from './shareAccessAccordionStyles';

import type { DriveFile } from '@/features/files/types';
import type {
	DriveFileShare,
	DriveFileSharePermission as DriveFileSharePermissionType,
	ResolvedDriveFileShareResponse,
} from '@/features/fileShare/type';
import type { ReduxActionState } from '@nikkierp/ui/appState';

import { canOpenShareDetailRow } from '@/features/fileShare/driveFileShareAccessDetailUtils';


const RESOLVED_ACCORDION_ITEM = 'resolved-shares';

export type DriveFileShareResolvedSectionProps = {
	file: DriveFile;
	currentUserId: string | undefined;
	viewerAppliedPermission: DriveFileSharePermissionType | null | undefined;
	resolvedState: ReduxActionState<ResolvedDriveFileShareResponse>;
	detailReadOnly?: boolean;
	onOpenShareDetail: (share: DriveFileShare) => void;
};

export function DriveFileShareResolvedSection({
	file,
	currentUserId,
	viewerAppliedPermission,
	resolvedState,
	detailReadOnly = false,
	onOpenShareDetail,
}: DriveFileShareResolvedSectionProps): React.ReactNode {
	const { t } = useTranslation();
	const items = resolvedState.data?.items ?? [];

	if (
		items.length === 0
		&& resolvedState.status !== 'pending'
		&& resolvedState.status !== 'error'
	) {
		return null;
	}

	return (
		<Accordion
			defaultValue={RESOLVED_ACCORDION_ITEM}
			variant='default'
			radius={0}
			styles={shareAccessAccordionStyles}
		>
			<Accordion.Item value={RESOLVED_ACCORDION_ITEM}>
				<Accordion.Control>
					<Text size='xs' fw={400} c='dimmed'>
						{t('nikki.drive.share.resolvedSharesTitle')}
					</Text>
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap='xs'>
						{resolvedState.status === 'error' ? (
							<Text size='xs' c='red'>
								{resolvedState.error ?? t('nikki.general.messages.error')}
							</Text>
						) : null}
						{resolvedState.status === 'pending' ? (
							<Group justify='center' py='sm'>
								<Loader size='sm' />
							</Group>
						) : (
							items.map((share: DriveFileShare) => {
								const allowOpenDetail = canOpenShareDetailRow({
									file,
									share,
									currentUserId,
									layer: 'resolved',
									viewerAppliedPermission,
								});
								return (
									<DriveFileShareAccessItem
										key={share.id}
										share={share}
										detailReadOnly={detailReadOnly}
										allowOpenDetail={allowOpenDetail}
										onOpenDetail={
											allowOpenDetail ? () => onOpenShareDetail(share) : undefined
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
