import { ActionIcon, Group, Table as MantineTable, Text } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import { IconCheck, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { getCellText } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import { buildRowUpdatePayload, isRowEditableField } from './editModel';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';
import { AutoField, CrudFormProvider } from '../form';
import classes from './ExcelDataTable.module.css';

import type { RowUpdateRefusal } from './editModel';
import type { RowId, SearchItem } from './types';
import type { FormProviderRenderProps } from '../form';


export type EditingRowProps = { item: SearchItem, rowId: RowId, rowNumber: number };

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
 * save/discard pair in the gray cell. It hosts its own form runtime, seeded from the row, so the
 * detail form's field inputs and validation apply unchanged. Selection is frozen while it lives.
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
		>
			{runtime => (
				<EditingCells item={item} rowId={rowId} rowNumber={rowNumber} runtime={runtime} submit={submit} />
			)}
		</CrudFormProvider>
	);
}

type RowSubmit = ReturnType<typeof useRowSubmit>;

/** Publishes the partial update; success ends edit mode and refreshes, failure keeps the inputs. */
function useRowSubmit(item: SearchItem) {
	const { updateCommand, editing, refresh, modelSchema, fields } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	const [isSubmitting, setSubmitting] = React.useState(false);
	const [errors, setErrors] = React.useState<ClientErrorItem[]>([]);
	// Read by `save` right after the submit resolves, before the state write has re-rendered.
	const lastErrorsRef = React.useRef<ClientErrorItem[]>([]);
	const editableFields = React.useMemo(
		() => fields.filter(field => isRowEditableField(modelSchema, field)), [fields, modelSchema],
	);
	const onSubmit = React.useCallback(async (data: Record<string, unknown>): Promise<boolean> => {
		if (!updateCommand) {
			return false;
		}
		setSubmitting(true);
		const response = await commandBus.publish<unknown>({ name: updateCommand, payload: data });
		setSubmitting(false);
		const clientErrors = response.result?.clientErrors ?? [];
		lastErrorsRef.current = clientErrors;
		if (response.error != null || clientErrors.length > 0) {
			return false;
		}
		editing.stop();
		refresh();
		return true;
	}, [commandBus, editing, refresh, updateCommand]);
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

function EditingCells({ item, rowId, rowNumber, runtime, submit }: EditingCellsProps) {
	const t = useTranslate('common');
	const { fields, data, editing, isLoading, tid } = useExcelDataTableContext();
	const editable = new Set(submit.editableFields);
	const disabled = isLoading || submit.isSubmitting;

	const save = useRowSave({ item, runtime, submit, editing, t });
	const rowRef = useFirstInputFocus(rowId);

	const onKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			editing.stop();
		}
		else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement) && !disabled) {
			event.preventDefault();
			void save();
		}
	};
	const unattached = submit.errors.filter(error => !error.field);

	return (
		<MantineTable.Tr
			ref={rowRef}
			tabIndex={-1}
			onKeyDown={onKeyDown}
			aria-label={`Editing row ${rowNumber}`}
			{...tid.row(rowId)}
		>
			<MantineTable.Td className={clsx('align-middle', classes.rowNumberCell)}>
				<Group gap={2} wrap='nowrap' justify='center'>
					<ActionIcon
						variant='subtle'
						color='green'
						title={t('action.save')}
						aria-label={t('action.save')}
						disabled={disabled}
						onClick={() => void save()}
						{...tid.rowEditSave(rowId)}
					>
						<IconCheck size={16} />
					</ActionIcon>
					<ActionIcon
						variant='subtle'
						color='red'
						title={t('action.cancel')}
						aria-label={t('action.cancel')}
						onClick={editing.stop}
						{...tid.rowEditDiscard(rowId)}
					>
						<IconX size={16} />
					</ActionIcon>
				</Group>
				{unattached.length > 0 ? (
					<Text size='xs' c='red'>{unattached.map(error => error.message || error.key).join(', ')}</Text>
				) : null}
			</MantineTable.Td>
			{fields.map(field => (
				<MantineTable.Td key={field} className={classes.editingCell} {...tid.rowEditInput(rowId, field)}>
					{editable.has(field) ? (
						<fieldset disabled={disabled} className='m-0 p-0 border-0 min-w-0'>
							<AutoField name={field} />
						</fieldset>
					) : getCellText(item, field, data.masked_fields)}
				</MantineTable.Td>
			))}
			<MantineTable.Td aria-hidden />
		</MantineTable.Tr>
	);
}
