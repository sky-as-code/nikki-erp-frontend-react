import { Table as MantineTable, Text } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import clsx from 'clsx';
import React from 'react';

import { EmptyActionColumnCell } from './actionColumns/ActionColumnCell';
import { CellContent } from './cells/CellContent';
import { useExcelDataTableContext } from './context';
import { buildRowUpdatePayload, isRowEditableField, rowFormData } from './editModel';
import classes from './ExcelDataTable.module.css';
import { EmptySortHandleCell } from './manualSort/ManualSort';
import { EditRowActions } from './rowActions';
import { isPopupEnterForRow, readRowKey } from './rowKeys';
import { RowLoading } from './RowLoading';
import { ROW_SELECT_DEFAULTS } from './rowSelectDefaults';
import { useRowUpdateWrite } from './rowUpdateWrite';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { AutoField, CrudFormProvider } from '../form';
import { SelectDefaultsContext } from '../SearchableSelect/dropdownWidth';

import type { RowUpdateRefusal } from './editModel';
import type { NewRowFieldEditor, RowId, SearchItem } from './types';
import type { FormProviderRenderProps } from '../form';


export type EditingRowProps = { item: SearchItem, rowId: RowId, rowNumber: number };

/** Mantine renders selects and date pickers as inputs too, so one selector covers every field type. */
const FOCUSABLE_INPUT = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

/**
 * Shown when a row cannot be saved at all. Both cases mean the row was read without the columns a
 * checked write needs, which is a misconfigured list rather than anything the user did.
 */
export const REFUSAL_TEXT: Record<Exclude<RowUpdateRefusal, 'unchanged'>, string> = {
	'no-id': 'This row cannot be updated: it carries no id.',
	'no-etag': 'This row cannot be updated safely: reload the list and try again.',
};

/**
 * The row in inline update mode: an input per editable column, text for the rest, and the
 * save/discard pair in the filler cell. It hosts its own form runtime, seeded from the row, so the
 * detail form's field inputs and validation apply unchanged. Selecting another row discards it.
 */
export function EditingRow({ item, rowId, rowNumber }: EditingRowProps) {
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
			loadingFallback={<RowLoading />}
		>
			{runtime => (
				<EditingCells
					item={item}
					rowId={rowId}
					rowNumber={rowNumber}
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
	const { editing, refresh, modelSchema, fields, changes } = useExcelDataTableContext();
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
		changes.noteUpdated(data.id as RowId);
		refresh();
		return true;
	}, [changes, editing, refresh, write]);
	return { isSubmitting, errors, setErrors, lastErrorsRef, editableFields, onSubmit, item };
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
 *
 * Only the row's editable columns are validated, as the insert row does: the schema may require
 * fields the list never projects (a parent id, `org_id`), and the form's full submit would refuse on
 * those with nothing on screen saying why, so the save would silently do nothing.
 */
function useRowSave({ item, runtime, submit, editing, t }: RowSaveDeps): () => Promise<void> {
	const { dirtyFields, setServerErrors } = runtime;
	return React.useCallback(async () => {
		const { editableFields } = submit;
		if (editableFields.length > 0 && !(await runtime.form.trigger(editableFields, { shouldFocus: true }))) {
			return;
		}
		const rawValues = runtime.form.getValues();
		const dirty = dirtyFields as Record<string, unknown>;
		const data = rowFormData(rawValues, editableFields);
		const built = buildRowUpdatePayload(data, dirty, item, editableFields, rawValues);
		if (built.refusal === 'unchanged') {
			editing.stop();
			return;
		}
		if (built.refusal || !built.payload) {
			const refusal = built.refusal ?? 'no-id';
			submit.setErrors([new ClientErrorItem({
				key: `datatable.${refusal}`,
				message: t(`datatable.${refusal}`, { defaultValue: REFUSAL_TEXT[refusal] }),
				type: 'validation',
			})]);
			return;
		}
		if (!(await submit.onSubmit(built.payload))) {
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

function EditingCells({ item, rowId, rowNumber, runtime, submit }: EditingCellsProps) {
	const t = useTranslate('common');
	const context = useExcelDataTableContext();
	const { columns, editing, isLoading, indexColumnVisible, tid, rowFieldEditors, manualSort } = context;
	const editable = new Set(submit.editableFields);
	const disabled = isLoading || submit.isSubmitting;
	const save = useRowSave({ item, runtime, submit, editing, t });
	const rowRef = useFirstInputFocus(rowId);
	const { onKeyDown, onKeyDownCapture } = useEditingRowKeys(disabled, save, editing.stop);
	return (
		<SelectDefaultsContext.Provider value={ROW_SELECT_DEFAULTS}>
			<MantineTable.Tr
				ref={rowRef}
				tabIndex={-1}
				onKeyDown={onKeyDown}
				onKeyDownCapture={onKeyDownCapture}
				aria-label={`Editing row ${rowNumber}`}
				{...tid.row(rowId)}
			>
				{indexColumnVisible ? (
					<MantineTable.Td className={clsx('text-center align-middle', classes.rowNumberCell)}>
						{rowNumber}
					</MantineTable.Td>
				) : null}
				{manualSort.enabled ? <EmptySortHandleCell /> : null}
				{columns.map(column => (column.kind === 'action' ? <EmptyActionColumnCell key={column.key} /> : (
					<MantineTable.Td
						key={column.key}
						className={classes.editingCell}
						{...tid.rowEditInput(rowId, column.field)}
					>
						{editable.has(column.field) ? (
							<fieldset disabled={disabled} className='m-0 p-0 border-0 min-w-0'>
								<EditingInput
									field={column.field}
									runtime={runtime}
									editor={rowFieldEditors[column.field]}
								/>
							</fieldset>
						) : <CellContent item={item} field={column.field} />}
					</MantineTable.Td>
				)))}
				<MantineTable.Td className='align-middle'>
					<EditRowActions
						mode='update'
						busy={disabled}
						onConfirm={() => void save()}
						onDiscard={editing.stop}
						confirmTestId={tid.rowEditSave(rowId)}
						discardTestId={tid.rowEditDiscard(rowId)}
					/>
					<RowErrors errors={submit.errors.filter(error => !error.field)} />
				</MantineTable.Td>
			</MantineTable.Tr>
		</SelectDefaultsContext.Provider>
	);
}

export function EditingInput({ field, runtime, editor: Editor }: {
	field: string, runtime: FormProviderRenderProps, editor: NewRowFieldEditor | undefined,
}) {
	return Editor ? <Editor field={field} form={runtime} /> : <AutoField name={field} labelHidden />;
}

/** Enter saves and Escape discards, for keys pressed in the row's own inputs (see `rowKeyIntent`). */
function useEditingRowKeys(disabled: boolean, save: () => Promise<void>, discard: () => void) {
	const confirm = () => {
		if (!disabled) {
			void save();
		}
	};
	const onKeyDownCapture = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		if (isPopupEnterForRow(event)) {
			event.preventDefault();
			event.stopPropagation();
			confirm();
		}
	};
	const onKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		const intent = readRowKey(event);
		if (intent === 'discard') {
			event.preventDefault();
			discard();
		}
		else if (intent === 'confirm') {
			event.preventDefault();
			confirm();
		}
	};
	return { onKeyDown, onKeyDownCapture };
}

export function RowErrors({ errors }: { errors: ClientErrorItem[] }) {
	if (errors.length === 0) {
		return null;
	}
	return <Text size='xs' c='red'>{errors.map(error => error.message || error.key).join(', ')}</Text>;
}
