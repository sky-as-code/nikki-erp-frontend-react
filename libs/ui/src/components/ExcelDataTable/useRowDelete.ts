import { notifications } from '@mantine/notifications';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { buildRowDeletePayload, deletableRowId, rowDeleteOutcome } from './rowDeleteModel';
import { useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';

import type { RowDeleteOutcome } from './rowDeleteModel';
import type { SearchItem } from './types';


export type RowDelete = {
	/** False for a command-backed table whose row has no record id to name. */
	isDeletable: boolean,
	isDeleting: boolean,
	onDelete: () => Promise<void>,
};

/**
 * Deletes one row: publishes `deleteCommand` with `{ids: [id]}`, or hands the row to `onDeleted`
 * when no command is given. Success refreshes, which also drops the row from the selection;
 * a failure nobody else explained shows a notice.
 */
export function useRowDelete(item: SearchItem): RowDelete {
	const { sinks, refresh } = useExcelDataTableContext();
	const t = useTranslate('common');
	const [isDeleting, setDeleting] = React.useState(false);
	const write = useRowDeleteWrite(item);
	const onDelete = React.useCallback(async () => {
		setDeleting(true);
		const outcome = await write();
		setDeleting(false);
		if (outcome.status === 'deleted') {
			refresh();
		}
		else if (outcome.status === 'failed') {
			const title = t('datatable.deleteFailed', { defaultValue: 'The row could not be deleted' });
			const message = outcome.messages.join(', ');
			notifications.show({
				color: 'var(--mantine-color-error)',
				title: message ? title : undefined,
				message: message || title,
			});
		}
	}, [refresh, t, write]);
	const isDeletable = !sinks.deleteCommand || deletableRowId(item) !== undefined;
	return { isDeletable, isDeleting, onDelete };
}

function useRowDeleteWrite(item: SearchItem): () => Promise<RowDeleteOutcome> {
	const { sinks } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	return React.useCallback(async () => {
		const rowId = deletableRowId(item);
		if (sinks.deleteCommand && rowId !== undefined) {
			const payload = buildRowDeletePayload(rowId);
			return rowDeleteOutcome(await commandBus.publish<unknown>({ name: sinks.deleteCommand, payload }));
		}
		if (!sinks.deleteCommand && sinks.onDeleted) {
			try {
				return (await sinks.onDeleted([item])) === false ? { status: 'explained' } : { status: 'deleted' };
			}
			catch (error) {
				return { status: 'failed', messages: error instanceof Error ? [error.message] : [] };
			}
		}
		return { status: 'failed', messages: [] };
	}, [commandBus, item, sinks]);
}
