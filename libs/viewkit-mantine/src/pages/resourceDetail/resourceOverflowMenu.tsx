import { Button, Menu } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { IconArchive, IconArchiveOff, IconDots, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { useResourceDetailTestAttrs, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { useResourceUpdateContext } from './resourceUpdateContext';


// Delete and archive sit behind an overflow menu rather than in the action bar: both are
// destructive, and neither is what a reader of a record usually wants to do next.
//
// Split out of resourceUpdateParts.tsx, which was against its 500-line budget. Nothing else uses
// these two, so they move together.

export function ResourceDetailOverflowMenu({
	resource, disabled = false,
}: {
	resource: Record<string, unknown>,
	disabled?: boolean,
}): React.ReactNode {
	const { commands, refresh } = useResourceUpdateContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const deleteCmd = useCommand(commands.delete ?? '');
	const archiveCmd = useCommand(commands.archive ?? '');
	const isBusy = disabled || deleteCmd.isPending || archiveCmd.isPending;

	const onDelete = () => {
		const id = resource.id;
		if (typeof id !== 'string' || !commands.delete) {
			return;
		}
		void deleteCmd.publish({ id }).then(refresh);
	};

	const showArchive = resource.is_archived === false;
	const showUnarchive = resource.is_archived === true;
	const onSetArchived = (archived: boolean) => {
		const request = buildArchiveRequest(resource, archived);
		if (request == null || !commands.archive) {
			return;
		}
		void archiveCmd.publish(request).then(refresh);
	};

	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button
					variant='outline' size='compact-md' aria-label='More actions' disabled={isBusy}
					{...tid('actionMenu')}
				>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{commands.delete ? (
					<Menu.Item
						leftSection={<IconTrash size={16} />}
						disabled={isBusy}
						onClick={onDelete}
						{...commandAttrs(commands.delete)}
						{...tid('action', 'delete')}
					>
						{t('action.delete')}
					</Menu.Item>
				) : null}
				{commands.delete && commands.archive ? <Menu.Divider /> : null}
				{/* Archive and unarchive publish the same command and differ only by payload, so the
					test ids name the intent rather than deriving from the shared command name. */}
				{commands.archive && showArchive ? (
					<Menu.Item
						leftSection={<IconArchive size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(true)}
						{...commandAttrs(commands.archive)}
						{...tid('action', 'archive')}
					>
						{t('action.archive')}
					</Menu.Item>
				) : null}
				{commands.archive && showUnarchive ? (
					<Menu.Item
						leftSection={<IconArchiveOff size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(false)}
						{...commandAttrs(commands.archive)}
						{...tid('action', 'unarchive')}
					>
						{t('action.unarchive')}
					</Menu.Item>
				) : null}
			</Menu.Dropdown>
		</Menu>
	);
}

function buildArchiveRequest(
	resource: Record<string, unknown>,
	isArchived: boolean,
): dyn.RestSetIsArchivedRequest | null {
	const id = resource.id;
	const etag = resource.etag;
	if (typeof id !== 'string' || typeof etag !== 'string') {
		return null;
	}
	return { id, etag, is_archived: isArchived };
}
