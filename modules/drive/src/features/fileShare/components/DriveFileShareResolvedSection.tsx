import { Accordion, Group, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessItem } from './DriveFileShareAccessItem';

import type { DriveFileShare, ResolvedDriveFileShareResponse } from '@/features/fileShare/type';
import type { ReduxActionState } from '@nikkierp/ui/appState';


const RESOLVED_ACCORDION_ITEM = 'resolved-shares';

const accordionChromeStyles = {
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
} as const;

export type DriveFileShareResolvedSectionProps = {
	resolvedState: ReduxActionState<ResolvedDriveFileShareResponse>;
	onOpenShareDetail: (share: DriveFileShare) => void;
};

export function DriveFileShareResolvedSection({
	resolvedState,
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
			styles={accordionChromeStyles}
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
							items.map((share: DriveFileShare) => (
								<DriveFileShareAccessItem
									key={share.id}
									share={share}
									onOpenDetail={() => onOpenShareDetail(share)}
								/>
							))
						)}
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
}
