import { Table as MantineTable, Text } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import clsx from 'clsx';
import React from 'react';

import { getCellText } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import { buildRowUpdatePayload, isRowEditableField } from './editModel';
import { EditRowActions } from './rowActions';
import { readRowKey } from './rowKeys';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';
import { AutoField, CrudFormProvider } from '../form';
import classes from './ExcelDataTable.module.css';

import type { RowUpdateRefusal } from './editModel';
import type { RowId, SearchItem } from './types';
import type { FormProviderRenderProps } from '../form';


export type EditingRowProps = { item: SearchItem, rowId: RowId, rowNumber: number, isSelected: boolean };

/** Mantine renders selects and date pickers as inputs too, so one selector covers every field type. */
const FOCUSABLE_INPUT = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

/**
 * Shown when a row cannot be saved at all. Both cases mean the row was read without the columns a
 * checked write needs, which is a misconfigured list rather than anything the user did.
 */
const REFUSAL_TEXT: Record<Exclude<RowUpdateRefusal, 'unchanged'>, string> = {
	'no-id': 'This row cannot be updated: it carries no id.',
	'no-etag': 'This row cannot be updated safely: reload the list and try again.',
};

/**
 * The row in inline update mode: an input per editable column, text for the rest, and the
 * save/discard pair in the filler cell. It hosts its own form runtime, seeded from the row, so the
 * detail form's field inputs and validation apply unchanged. Selecting another row discards it.
 */
export function EditingRow({ item, rowId, rowNumber, isSelected }: EditingRowProps) {
	const { modelSchema } = useExcelDataTableContext();
	const localize = useSchemaLocalize(modelSchema?.name ?? '');
	const submit = useRowSubmit(item);
	if (!modelSchema) {
		return null;
	}
	return (
		<CrudFormProvider
			schemaName={modelSchema.name}
			formVariant='update'
			localize={localize}
			modelValue={item}
			isSubmitting={submit.isSubmitting}
			onSubmit={submit.onSubmit}
		>
			{runtime => (
				<EditingCells
					item={item}
					rowId={rowId}
					rowNumber={rowNumber}
					isSelected={isSelected}
					runtime={runtime}
					submit={submit}
				/>
			)}
		</CrudFormProvider>
	);
}

type RowSubmit = ReturnType<typeof useRowSubmit>;

/**
 * Publishes the partial update, or hands it to `onUpdated` when no command is given; success ends
 * edit mode and refreshes, failure keeps the inputs.
 */
function useRowSubmit(item: SearchItem) {
	const { editing, refresh, modelSchema, fields } = useExcelDataTableContext();
	const [isSubmitting, setSubmitting] = React.useState(false);
	const [errors, setErrors] = React.useState<ClientErrorItem[]>([]);
	// Read by `save` right after the submit resolves, before the state write has re-rendered.
	const lastErrorsRef = React.useRef<ClientErrorItem[]>([]);
	const editableFields = React.useMemo(
		() => fields.filter(field => isRowEditableField(modelSchema, field)), [fields, modelSchema],
	);
	const write = useRowUpdateWrite();
	const onSubmit = React.useCallback(async (data: Record<string, unknown>): Promise<boolean> => {
		setSubmitting(true);
		const clientErrors = await write(data);
		setSubmitting(false);
		lastErrorsRef.current = clientErrors ?? [];
		if (clientErrors) {
			return false;
		}
		editing.stop();
		refresh();
		return true;
	}, [editing, refresh, write]);
	return { isSubmitting, errors, setErrors, lastErrorsRef, editableFields, onSubmit, item };
}

/** Resolves the write's client errors, `[]` for a failure without any, or `null` on success. */
function useRowUpdateWrite(): (data: Record<string, unknown>) => Promise<ClientErrorItem[] | null> {
	const { sinks } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	return React.useCallback(async (data) => {
		if (sinks.updateCommand) {
			const response = await commandBus.publish<unknown>({ name: sinks.updateCommand, payload: data });
			const clientErrors = response.result?.clientErrors ?? [];
			return response.error != null || clientErrors.length > 0 ? clientErrors : null;
		}
		if (sinks.onUpdated) {
			return (await sinks.onUpdated(data)) === false ? [] : null;
		}
		return [];
	}, [commandBus, sinks]);
}

type EditingCellsProps = EditingRowProps & { runtime: FormProviderRenderProps, submit: RowSubmit };

type RowSaveDeps = {
	item: SearchItem,
	runtime: FormProviderRenderProps,
	submit: RowSubmit,
	editing: ReturnType<typeof useExcelDataTableContext>['editing'],
	t: ReturnType<typeof useTranslate>,
};

/**
 * Saves the row, translating the three outcomes the payload builder reports: a no-op simply leaves
 * edit mode, a refusal shows why the row cannot be written at all, and a rejected write falls
 * through to the server's own errors.
 */
function useRowSave({ item, runtime, submit, editing, t }: RowSaveDeps): () => Promise<void> {
	const { dirtyFields, setServerErrors } = runtime;
	return React.useCallback(async () => {
		const dirty = dirtyFields as Record<string, unknown>;
		let refusal: RowUpdateRefusal | undefined;
		const ok = await runtime.handleSubmitWithResult((formData) => {
			const built = buildRowUpdatePayload(formData, dirty, item, submit.editableFields);
			refusal = built.refusal;
			return built.payload;
		})();
		if (refusal === 'unchanged') {
			editing.stop();
			return;
		}
		if (refusal) {
			submit.setErrors([new ClientErrorItem({
				key: `datatable.${refusal}`,
				message: t(`datatable.${refusal}`, { defaultValue: REFUSAL_TEXT[refusal] }),
				type: 'validation',
			})]);
			return;
		}
		if (!ok) {
			// Field-level rejections land on their inputs; the rest show beside the buttons.
			submit.setErrors(setServerErrors(submit.lastErrorsRef.current));
		}
	}, [dirtyFields, editing, item, runtime, setServerErrors, submit, t]);
}

/**
 * Moves focus into the row's first input when edit mode opens.
 *
 * Done here rather than through `AutoField`'s `autoFocused`, which is deliberately inert on an
 * update form: a detail page must not steal focus when it loads. A row editor is the opposite case
 * — it only exists because the user just asked for it — and until focus lands inside, the row's own
 * Escape and Enter handlers never see a key, because focus is still on the table's scroll container.
 */
function useFirstInputFocus(rowId: RowId): React.RefObject<HTMLTableRowElement | null> {
	const rowRef = React.useRef<HTMLTableRowElement | null>(null);
	React.useEffect(() => {
		const input = rowRef.current?.querySelector<HTMLElement>(FOCUSABLE_INPUT);
		// A row whose every column is read-only has nothing to focus; the row itself takes it so the
		// keyboard handlers still work.
		(input ?? rowRef.current)?.focus();
	}, [rowId]);
	return rowRef;
}

function EditingCells({ item, rowId, rowNumber, isSelected, runtime, submit }: EditingCellsProps) {
	const t = useTranslate('common');
	const { fields, data, editing, isLoading, indexColumnVisible, tid } = useExcelDataTableContext();
	const editable = new Set(submit.editableFields);
	const disabled = isLoading || submit.isSubmitting;
	const selected = { [classes.selectedCell]: isSelected };

	const save = useRowSave({ item, runtime, submit, editing, t });
	const rowRef = useFirstInputFocus(rowId);

	const onKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		const intent = readRowKey(event);
		if (intent === 'discard') {
			event.preventDefault();
			editing.stop();
		}
		else if (intent === 'confirm') {
			event.preventDefault();
			if (!disabled) {
				void save();
			}
		}
	};
	const unattached = submit.errors.filter(error => !error.field);

	return (
		<MantineTable.Tr
			ref={rowRef}
			tabIndex={-1}
			onKeyDown={onKeyDown}
			aria-selected={isSelected}
			aria-label={`Editing row ${rowNumber}`}
			{...tid.row(rowId)}
		>
			{indexColumnVisible ? (
				<MantineTable.Td className={clsx('text-center align-middle', classes.rowNumberCell, selected)}>
					{rowNumber}
				</MantineTable.Td>
			) : null}
			{fields.map(field => (
				<MantineTable.Td
					key={field}
					className={clsx(classes.editingCell, selected)}
					{...tid.rowEditInput(rowId, field)}
				>
					{editable.has(field) ? (
						<fieldset disabled={disabled} className='m-0 p-0 border-0 min-w-0'>
							<AutoField name={field} labelHidden />
						</fieldset>
					) : getCellText(item, field, data.masked_fields)}
				</MantineTable.Td>
			))}
			<MantineTable.Td className={clsx('align-middle', selected)}>
				<EditRowActions
					mode='update'
					busy={disabled}
					onConfirm={() => void save()}
					onDiscard={editing.stop}
					confirmTestId={tid.rowEditSave(rowId)}
					discardTestId={tid.rowEditDiscard(rowId)}
				/>
				<RowErrors errors={unattached} />
			</MantineTable.Td>
		</MantineTable.Tr>
	);
}

function RowErrors({ errors }: { errors: ClientErrorItem[] }) {
	if (errors.length === 0) {
		return null;
	}
	return <Text size='xs' c='red'>{errors.map(error => error.message || error.key).join(', ')}</Text>;
}
