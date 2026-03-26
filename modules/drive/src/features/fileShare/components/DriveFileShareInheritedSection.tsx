import { Accordion, Group, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';

import type { ReduxActionState } from '@nikkierp/ui/appState';

import { DriveFileSharePermission, type DriveFileShare, type GetDriveFileShareAncestorsResponse } from '@/features/fileShare/type';


export type DriveFileShareInheritedSectionProps = {
	ancestorsState: ReduxActionState<GetDriveFileShareAncestorsResponse>;
	ancestorShares: DriveFileShare[];
	onOpenShareDetail?: (share: DriveFileShare) => void;
};

export function DriveFileShareInheritedSection({
	ancestorsState,
	ancestorShares,
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
			styles={{
				item: {
					border: 'none',
					backgroundColor: 'transparent',
				},
				control: {
					padding: 0,
					minHeight: 'unset',
				},
				label: {
					padding: 0,
				},
				chevron: {
					marginLeft: 'var(--mantine-spacing-xs)',
					width: '1rem',
					height: '1rem',
				},
				panel: {
					padding: 0,
				},
				content: {
					padding: 0,
				},
			}}
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
							ancestorShares.map((share: DriveFileShare) => (
								<DriveFileShareAccessItem
									key={share.id}
									share={share}
									readOnly
									onOpenDetail={
										share.permission === DriveFileSharePermission.ANCESTOR_OWNER
										&& onOpenShareDetail
											? () => onOpenShareDetail(share)
											: undefined
									}
								/>
							))
						)}
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
}
