import { Group } from '@mantine/core';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import React from 'react';

import { useTranslate } from '../../i18n';
import { Button } from '../Button';

import type { LockedProps } from '../Button';
import type { TestIdAttributes } from '@nikkierp/common/utils';


export type EditRowActionsProps = {
	/** `create` confirms with Add (insert row), `update` with Save (row editor). */
	mode: 'create' | 'update',
	onConfirm: () => void,
	onDiscard: () => void,
	/** Blocks the confirm while a write or a load is in flight; discarding stays possible. */
	busy?: boolean,
	confirmTestId?: TestIdAttributes,
	discardTestId?: TestIdAttributes,
};

/** The confirm/discard pair an editing or inserting row shows in the filler column, both in the default colour. */
export function EditRowActions({
	mode, onConfirm, onDiscard, busy = false, confirmTestId, discardTestId,
}: EditRowActionsProps): React.ReactElement {
	const t = useTranslate('common');
	const confirmLabel = mode === 'create'
		? t('action.add', { defaultValue: 'Add' })
		: t('action.save', { defaultValue: 'Save' });
	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				variant='default'
				size='xs'
				leftSection={<IconCheck size={14} />}
				disabled={busy}
				onClick={onConfirm}
				{...confirmTestId}
			>
				{confirmLabel}
			</Button>
			<Button
				variant='default'
				size='xs'
				leftSection={<IconX size={14} />}
				onClick={onDiscard}
				{...discardTestId}
			>
				{t('datatable.discardChanges', { defaultValue: 'Discard changes' })}
			</Button>
		</Group>
	);
}

export type DeleteRowActionProps = LockedProps & {
	onDelete: () => void,
	/** Editing, loading, or the delete itself in flight. A locked button still answers a click. */
	disabled?: boolean,
	/** A translation key replacing the default "Delete"; a `ns:key` form names another namespace. */
	label?: string,
	testId?: TestIdAttributes,
};

/** The delete a read row offers in the filler column. */
export function DeleteRowAction({
	onDelete, disabled = false, locked, lockedMissing, label, testId,
}: DeleteRowActionProps): React.ReactElement {
	const t = useTranslate('common');
	return (
		<Button
			variant='default'
			size='xs'
			leftSection={<IconTrash size={14} />}
			disabled={disabled}
			locked={locked}
			lockedMissing={lockedMissing}
			onClick={onDelete}
			{...testId}
		>
			{label ? t(label) : t('action.delete', { defaultValue: 'Delete' })}
		</Button>
	);
}

export type EditRowActionProps = LockedProps & {
	onEdit: () => void,
	disabled?: boolean,
	testId?: TestIdAttributes,
};

/** The edit a read row offers left of its delete; it opens the row editor on that row. */
export function EditRowAction({
	onEdit, disabled = false, locked, lockedMissing, testId,
}: EditRowActionProps): React.ReactElement {
	const t = useTranslate('common');
	return (
		<Button
			variant='default'
			size='xs'
			leftSection={<IconPencil size={14} />}
			disabled={disabled}
			locked={locked}
			lockedMissing={lockedMissing}
			onClick={onEdit}
			{...testId}
		>
			{t('action.edit', { defaultValue: 'Edit' })}
		</Button>
	);
}
