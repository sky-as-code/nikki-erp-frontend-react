import { Table as MantineTable } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import clsx from 'clsx';
import React from 'react';

import { fieldsToWrite, isTextEntryElement, sentValueKey } from './tableScopeModel';
import { useSchemaLocalize, useTranslate } from '../../../i18n';
import { CrudFormProvider } from '../../form';
import { INLINE_CONTROLS_ATTRS } from '../../Input/inputDensity';
import { ActionColumnCell } from '../actionColumns/ActionColumnCell';
import { BadgedValue, RowActionsCell, RowNumberCell } from '../BodyRow';
import { CellContent } from '../cells/CellContent';
import { useChangeBadgeSlot } from '../changeIndicator/RowChangeBadge';
import { useExcelDataTableContext } from '../context';
import { buildRowUpdatePayload, isRowEditableField, rowFormData } from '../editModel';
import classes from '../ExcelDataTable.module.css';
import { InlineRowScope } from '../InlineRowScope';
import { SortHandleCell, useSortableRowProps } from '../manualSort/ManualSort';
import { EditingInput, REFUSAL_TEXT, RowErrors } from '../RowEditor';
import { readRowKey } from '../rowKeys';
import { RowLoading } from '../RowLoading';
import { useRowUpdateWrite } from '../rowUpdateWrite';

import type { FormProviderRenderProps } from '../../form';
import type { RowId, SearchItem } from '../types';


export type TableScopeRowProps = { item: SearchItem, rowId: RowId, rowNumber: number };

/**
 * A row of a table in `updateScope='table'` while it is in update mode: every editable column is an
 * input at once, with no Save or Discard. A change is written as soon as it is a decision — a picked
 * option, a ticked box, or typed text once focus leaves its cell or Enter is pressed — as
 * `{id, etag, ...changed}` to `updateCommand`, or to `onUpdated` without one. Escape restores the
 * focused field. Each row hosts its own form, seeded from the row, as the row editor does.
 */
export function TableScopeRow({ item, rowId, rowNumber }: TableScopeRowProps): React.ReactNode {
	const { modelSchema } = useExcelDataTableContext();
	const localize = useSchemaLocalize(modelSchema?.name ?? '');
	if (!modelSchema) {
		return null;
	}
	return (
		<CrudFormProvider
			schemaName={modelSchema.name}
			formVariant='update'
			localize={localize}
			modelValue={item}
			onSubmit={ignoreSubmit}
			loadingFallback={<RowLoading />}
		>
			{runtime => <TableScopeCells item={item} rowId={rowId} rowNumber={rowNumber} runtime={runtime} />}
		</CrudFormProvider>
	);
}

function ignoreSubmit(): void {
	// A table-scope row never submits through the form; `useTableScopeWrite` writes each change.
}

type TableScopeCellsProps = TableScopeRowProps & { runtime: FormProviderRenderProps };

function TableScopeCells({ item, rowId, rowNumber, runtime }: TableScopeCellsProps): React.ReactNode {
	const context = useExcelDataTableContext();
	const { columns, fields, modelSchema, selection, indexColumnVisible, tid } = context;
	const editableFields = React.useMemo(
		() => fields.filter(field => isRowEditableField(modelSchema, field)), [fields, modelSchema],
	);
	const rowRef = React.useRef<HTMLTableRowElement | null>(null);
	const write = useTableScopeWrite(item, runtime, editableFields);
	useWriteOnPick(runtime, editableFields, rowRef, write.flush);
	const onKeyDown = useTableScopeKeys(runtime, write.flush);
	const sortableProps = useSortableRowProps();
	const isSelected = selection.ids.includes(rowId);
	const setRowRef = (element: HTMLTableRowElement | null) => {
		rowRef.current = element;
		sortableProps.ref?.(element);
	};
	return (
		<InlineRowScope>
			<MantineTable.Tr
				{...sortableProps}
				ref={setRowRef}
				onKeyDown={onKeyDown}
				aria-selected={isSelected}
				className={classes.bodyRow}
				{...INLINE_CONTROLS_ATTRS}
				{...tid.row(rowId)}
			>
				{indexColumnVisible ? (
					<RowNumberCell item={item} rowId={rowId} rowNumber={rowNumber} isSelected={isSelected} />
				) : null}
				{context.manualSort.enabled ? <SortHandleCell rowId={rowId} /> : null}
				{columns.map(column => (column.kind === 'action' ? (
					<ActionColumnCell
						key={column.key}
						column={column.column}
						item={item}
						rowId={rowId}
						isSelected={isSelected}
					/>
				) : (
					<TableScopeCell
						key={column.key}
						field={column.field}
						item={item}
						rowId={rowId}
						runtime={runtime}
						editable={editableFields.includes(column.field)}
						onLeave={write.flush}
					/>
				)))}
				<RowActionsCell item={item} rowId={rowId} isSelected={isSelected}>
					<RowErrors errors={write.errors.filter(error => !error.field)} />
				</RowActionsCell>
			</MantineTable.Tr>
		</InlineRowScope>
	);
}

type TableScopeCellProps = {
	field: string,
	item: SearchItem,
	rowId: RowId,
	runtime: FormProviderRenderProps,
	editable: boolean,
	onLeave: () => void,
};

/** Focus leaving the cell — not moving within it, nor into its portalled dropdown — writes the row. */
function TableScopeCell({ field, item, rowId, runtime, editable, onLeave }: TableScopeCellProps): React.ReactNode {
	const { tid, rowFieldEditors } = useExcelDataTableContext();
	const withBadge = useChangeBadgeSlot() === field;
	const onBlur = (event: React.FocusEvent<HTMLTableCellElement>) => {
		const next = event.relatedTarget as Node | null;
		if (!next || !event.currentTarget.contains(next)) {
			onLeave();
		}
	};
	const content = editable
		? <EditingInput field={field} runtime={runtime} editor={rowFieldEditors[field]} />
		: <CellContent item={item} field={field} />;
	return (
		<MantineTable.Td
			className={clsx(editable && classes.editingCell)}
			data-field={field}
			onBlur={editable ? onBlur : undefined}
			{...tid.rowEditInput(rowId, field)}
		>
			{withBadge ? <BadgedValue item={item} rowId={rowId}>{content}</BadgedValue> : content}
		</MantineTable.Td>
	);
}

type TableScopeWrite = { flush: () => void, errors: ClientErrorItem[] };

/**
 * Writes every changed, not yet written field of the row in one payload. A field is not sent twice
 * with the same value: a command-backed row stays dirty until its refresh lands. After a command
 * write the table refreshes, which brings the next `etag`; a page callback keeps its own rows (a
 * form's drafts), so nothing is re-read for it.
 */
function useTableScopeWrite(
	item: SearchItem, runtime: FormProviderRenderProps, editableFields: string[],
): TableScopeWrite {
	const { changes, sinks, refresh } = useExcelDataTableContext();
	const t = useTranslate('common');
	const write = useRowUpdateWrite();
	const [errors, setErrors] = React.useState<ClientErrorItem[]>([]);
	const sent = React.useRef(new Map<string, string>());
	const itemKey = JSON.stringify(item);
	React.useEffect(() => {
		sent.current = new Map();
	}, [itemKey]);
	const { form, setServerErrors } = runtime;
	const writeChanged = React.useCallback(async () => {
		const changed = fieldsToWrite(
			editableFields, field => form.getFieldState(field).isDirty, field => form.getValues(field), sent.current,
		);
		if (changed.length === 0 || !(await form.trigger(changed))) {
			return;
		}
		const raw = form.getValues();
		const dirty = Object.fromEntries(changed.map(field => [field, true]));
		const built = buildRowUpdatePayload(rowFormData(raw, changed), dirty, item, changed, raw);
		if (built.refusal === 'unchanged') {
			return;
		}
		if (built.refusal || !built.payload) {
			const refusal = built.refusal ?? 'no-id';
			const message = t(`datatable.${refusal}`, { defaultValue: REFUSAL_TEXT[refusal] });
			setErrors([new ClientErrorItem({ key: `datatable.${refusal}`, message, type: 'validation' })]);
			return;
		}
		changed.forEach(field => sent.current.set(field, sentValueKey(form.getValues(field))));
		const clientErrors = await write(built.payload);
		if (clientErrors) {
			changed.forEach(field => sent.current.delete(field));
			setErrors(setServerErrors(clientErrors));
			return;
		}
		setErrors([]);
		changes.noteUpdated(built.payload.id as RowId);
		if (sinks.updateCommand) {
			refresh();
		}
	}, [changes, editableFields, form, item, refresh, setServerErrors, sinks.updateCommand, t, write]);
	const flush = React.useCallback(() => void writeChanged(), [writeChanged]);
	return { flush, errors };
}

/**
 * A change that is already a decision writes at once: anything but typing into a text input of this
 * row, which waits for its cell's blur or Enter. Re-seeding the form (`reset`) names no field and is
 * never a change.
 */
function useWriteOnPick(
	runtime: FormProviderRenderProps,
	editableFields: string[],
	rowRef: React.RefObject<HTMLTableRowElement | null>,
	flush: () => void,
): void {
	const { form } = runtime;
	const latestFlush = React.useRef(flush);
	React.useEffect(() => {
		latestFlush.current = flush;
	}, [flush]);
	React.useEffect(() => {
		const subscription = form.watch((_values, info) => {
			if (!info.name || !editableFields.includes(info.name)) {
				return;
			}
			const focused = document.activeElement;
			if (isTextEntryElement(focused as HTMLInputElement | null) && rowRef.current?.contains(focused)) {
				return;
			}
			queueMicrotask(() => latestFlush.current());
		});
		return () => subscription.unsubscribe();
	}, [editableFields, form, rowRef]);
}

/** Enter writes the row's changes; Escape puts the focused field back to the row's value. */
function useTableScopeKeys(runtime: FormProviderRenderProps, flush: () => void) {
	return (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		const intent = readRowKey(event);
		if (intent === 'confirm') {
			event.preventDefault();
			flush();
		}
		else if (intent === 'discard') {
			const field = (event.target as HTMLElement).closest?.('[data-field]')?.getAttribute('data-field');
			if (field) {
				event.preventDefault();
				runtime.form.resetField(field);
			}
		}
	};
}
