import { Menu } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { Button, useLockedItemProps } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { IconArchive, IconArchiveOff, IconDots, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { notifyServerError } from './publishServerErrors';
import {
	useResourceDetailSchemaName, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from './ResourceDetailProvider';
import { useResourceUpdateContext } from './resourceUpdateContext';
import { useBackLinkTarget } from './useBackLinkTarget';
import { StandardActionCode, useActionLock } from '../../permissions';

import type { ResourceDetailStandardActionCommands } from './props';
import type { CommandBusResponse } from '@nikkierp/common/commandBus';
import type { ClientErrorTranslator } from '@nikkierp/common/types';


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
	const backLink = useBackLinkTarget();
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const deleteCmd = useCommand(commands.delete ?? '');
	const archiveCmd = useCommand(commands.archive ?? '');
	const isBusy = disabled || deleteCmd.isPending || archiveCmd.isPending;
	const { deleteLocked, archiveLocked } = useOverflowLocks(commands);

	const onDelete = () => {
		const id = resource.id;
		if (typeof id !== 'string' || !commands.delete) {
			return;
		}
		void deleteCmd.publish({ id }).then(response => onWriteSettled(response, t, backLink.go));
	};

	const onSetArchived = (archived: boolean) => {
		const request = buildArchiveRequest(resource, archived);
		if (request == null || !commands.archive) {
			return;
		}
		void archiveCmd.publish(request).then(response => onWriteSettled(response, t, refresh));
	};

	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button aria-label='More actions' disabled={isBusy} {...tid('actionMenu')}>
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
						{...deleteLocked}
					>
						{t('action.delete')}
					</Menu.Item>
				) : null}
				{commands.delete && commands.archive ? <Menu.Divider /> : null}
				{/* Archive and unarchive publish the same command and differ only by payload, so the
					test ids name the intent rather than deriving from the shared command name. */}
				{commands.archive && resource.is_archived === false ? (
					<Menu.Item
						leftSection={<IconArchive size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(true)}
						{...commandAttrs(commands.archive)}
						{...tid('action', 'archive')}
						{...archiveLocked}
					>
						{t('action.archive')}
					</Menu.Item>
				) : null}
				{commands.archive && resource.is_archived === true ? (
					<Menu.Item
						leftSection={<IconArchiveOff size={16} />}
						disabled={isBusy}
						onClick={() => onSetArchived(false)}
						{...commandAttrs(commands.archive)}
						{...tid('action', 'unarchive')}
						{...archiveLocked}
					>
						{t('action.unarchive')}
					</Menu.Item>
				) : null}
			</Menu.Dropdown>
		</Menu>
	);
}

// Locked is orthogonal to busy: a busy item is disabled and unclickable, a locked one is greyed
// but still answers a click with the reason.
function useOverflowLocks(commands: ResourceDetailStandardActionCommands) {
	const schemaName = useResourceDetailSchemaName();
	const deleteLock = useActionLock(schemaName, commands.delete ? StandardActionCode.Delete : null);
	const archiveLock = useActionLock(schemaName, commands.archive ? StandardActionCode.Archive : null);
	return {
		deleteLocked: useLockedItemProps(deleteLock.locked, deleteLock.missing),
		archiveLocked: useLockedItemProps(archiveLock.locked, archiveLock.missing),
	};
}

/**
 * Runs `onSuccess` only after a write that went through. A refusal (`resource_in_use` when the
 * record is still referenced) is published to the Shell Notice stack instead: it used to be
 * dropped, so the menu closed and nothing happened.
 */
function onWriteSettled(
	response: CommandBusResponse<unknown>, t: ClientErrorTranslator, onSuccess: () => void,
): void {
	const clientErrors = response.result?.clientErrors ?? [];
	if (clientErrors.length > 0) {
		// Delete and archive take no form input, so even a field-scoped item goes to the notice.
		clientErrors.forEach(item => notifyServerError(t, item));
		return;
	}
	if (response.error == null) {
		onSuccess();
	}
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
