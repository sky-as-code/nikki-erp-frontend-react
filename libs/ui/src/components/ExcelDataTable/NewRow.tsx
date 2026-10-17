import { Table as MantineTable, Text } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { useExcelDataTableContext } from './context';
import { buildNewRowPayload, findNewRowConfigProblems, resolveNewRowColumns, splitNewRowErrors } from './newRowModel';
import { useNewRowSearch } from './newRowSearch';
import { EditRowActions } from './rowActions';
import { useColumnCount } from './tableLayout';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';
import { Button } from '../Button';
import { AutoField, CrudFormProvider } from '../form';
import { SearchableSelect } from '../SearchableSelect';
import classes from './NewRow.module.css';

import type { NewRowColumns } from './newRowModel';
import type { FormProviderRenderProps } from '../form';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** Mantine renders selects and date pickers as inputs too; the record picker is a button. */
const FOCUSABLE_INPUT = [
	'input:not([type="hidden"]):not([disabled])', 'textarea:not([disabled])', 'select:not([disabled])',
	'button:not([disabled])',
].join(', ');

type TranslateFn = ReturnType<typeof useTranslate>;

/**
 * The table's last row when rows can be created: `[+ Add a line]` until clicked, then an input per
 * creatable column with Add / Discard in the filler cell. Rendered by `NewRowSlot`.
 */
export function NewRow(): React.ReactNode {
	const { capabilities, editing, modelSchema } = useExcelDataTableContext();
	useNewRowConfigCheck();
	if (!capabilities.includes('create') || !modelSchema) {
		return null;
	}
	return editing.creating ? <InsertRow modelSchema={modelSchema} /> : <AddLineRow />;
}

function useNewRowConfigCheck(): void {
	const { capabilities, modelSchema, fields, newRow, tableName } = useExcelDataTableContext();
	const enabled = import.meta.env.DEV && capabilities.includes('create');
	const key = enabled ? findNewRowConfigProblems(modelSchema, fields, newRow).join('\n') : '';
	React.useEffect(() => {
		if (key) {
			console.error(`ExcelDataTable '${tableName}': ${key}`);
		}
	}, [key, tableName]);
}

/**
 * The idle state. A locked create still shows the button, locked, so the refusal can be read; an
 * open row edit disables it rather than silently dropping what was typed there.
 */
function AddLineRow() {
	const t = useTranslate('common');
	const { newRow, locks, editing, tid } = useExcelDataTableContext();
	const columnCount = useColumnCount();
	return (
		<MantineTable.Tr>
			<MantineTable.Td colSpan={columnCount}>
				<Button
					variant='subtle'
					size='xs'
					leftSection={<IconPlus size={14} />}
					locked={locks.create.locked}
					lockedMissing={locks.create.missing}
					disabled={editing.rowId !== null}
					onClick={editing.startCreate}
					{...tid.addLine()}
				>
					{newRow.prompt ?? t('datatable.addLine', { defaultValue: 'Add a line' })}
				</Button>
			</MantineTable.Td>
		</MantineTable.Tr>
	);
}

/**
 * A create form of its own, so the detail form's field inputs and validation apply unchanged. Its
 * `onSubmit` is never reached: the row validates only the columns it shows (see `useNewRowAdd`).
 */
function InsertRow({ modelSchema }: { modelSchema: dyn.ModelSchema }) {
	const localize = useSchemaLocalize(modelSchema.name);
	return (
		<CrudFormProvider schemaName={modelSchema.name} formVariant='create' localize={localize} onSubmit={ignoreSubmit}>
			{runtime => <InsertCells runtime={runtime} />}
		</CrudFormProvider>
	);
}

function ignoreSubmit(): void {
	// The insert row never submits through the form; `useNewRowAdd` writes instead.
}

function InsertCells({ runtime }: { runtime: FormProviderRenderProps }) {
	const t = useTranslate('common');
	const { fields, newRow, modelSchema, indexColumnVisible, editing, isLoading, tid } = useExcelDataTableContext();
	const columns = React.useMemo(
		() => resolveNewRowColumns(modelSchema, fields, newRow), [modelSchema, fields, newRow],
	);
	const submit = useNewRowAdd(runtime, columns, t);
	const busy = submit.isSubmitting || isLoading;
	const rowRef = useFirstInputFocus();
	const onKeyDown = useInsertRowKeys(busy, submit.add, editing.stopCreate);
	return (
		<MantineTable.Tr
			ref={rowRef}
			tabIndex={-1}
			onKeyDown={onKeyDown}
			aria-label={t('datatable.newLine', { defaultValue: 'New line' })}
			{...tid.attrs('newRow')}
		>
			{indexColumnVisible ? (
				<MantineTable.Td className={classes.indexCell}><IconPlus size={14} aria-hidden /></MantineTable.Td>
			) : null}
			{fields.map(field => (
				<NewRowCell key={field} field={field} columns={columns} runtime={runtime} disabled={busy} />
			))}
			<InsertRowActions submit={submit} busy={busy} />
		</MantineTable.Tr>
	);
}

function InsertRowActions({ submit, busy }: { submit: NewRowAdd, busy: boolean }) {
	const { editing, tid } = useExcelDataTableContext();
	return (
		<MantineTable.Td className={classes.actionsCell}>
			<EditRowActions
				mode='create'
				busy={busy}
				onConfirm={() => void submit.add()}
				onDiscard={editing.stopCreate}
				confirmTestId={tid.newRowAdd()}
				discardTestId={tid.newRowDiscard()}
			/>
			<RowErrors errors={submit.errors} />
		</MantineTable.Td>
	);
}

/**
 * Enter adds and Escape discards, for keys pressed in the row's own inputs. A dropdown's search box
 * is portalled out of the row but still bubbles here through React, so a key from outside the
 * row's DOM, or one a select already consumed (its option pick), is left alone.
 */
function useInsertRowKeys(busy: boolean, add: () => Promise<void>, discard: () => void) {
	return (event: React.KeyboardEvent<HTMLTableRowElement>) => {
		if (event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			discard();
		}
		else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) {
			event.preventDefault();
			if (!busy) {
				void add();
			}
		}
	};
}

/**
 * Focus goes into the first input when the row opens: the row's own Enter and Escape only see keys
 * from inside it, and the click that opened it left focus on a button that no longer exists.
 */
function useFirstInputFocus(): React.RefObject<HTMLTableRowElement | null> {
	const rowRef = React.useRef<HTMLTableRowElement | null>(null);
	React.useEffect(() => {
		const input = rowRef.current?.querySelector<HTMLElement>(FOCUSABLE_INPUT);
		(input ?? rowRef.current)?.focus();
	}, []);
	return rowRef;
}

type NewRowCellProps = { field: string, columns: NewRowColumns, runtime: FormProviderRenderProps, disabled: boolean };

function NewRowCell({ field, columns, runtime, disabled }: NewRowCellProps) {
	const { newRow, tid } = useExcelDataTableContext();
	if (!columns.editable.includes(field)) {
		return <MantineTable.Td className={classes.inputCell} />;
	}
	const Editor = columns.editorFields.includes(field) ? newRow.fieldEditors[field] : undefined;
	let content: React.ReactNode;
	if (field === columns.searchField) {
		content = <RecordSearchInput field={field} runtime={runtime} disabled={disabled} />;
	}
	else if (Editor) {
		content = <Editor field={field} form={runtime} />;
	}
	else {
		content = <AutoField name={field} labelHidden />;
	}
	return (
		<MantineTable.Td className={classes.inputCell} {...tid.newRowInput(field)}>
			<fieldset disabled={disabled} className='m-0 p-0 border-0 min-w-0'>{content}</fieldset>
		</MantineTable.Td>
	);
}

type RecordSearchInputProps = { field: string, runtime: FormProviderRenderProps, disabled: boolean };

/** The `server-resource` row's one input: the picked record's id is the form value of its column. */
function RecordSearchInput({ field, runtime, disabled }: RecordSearchInputProps) {
	const t = useTranslate('common');
	const { newRow, tid } = useExcelDataTableContext();
	const search = useNewRowSearch(newRow);
	const value = useWatch({ control: runtime.form.control, name: field }) as string | undefined;
	const onChange = (picked: string) => {
		const option = search.pick(picked);
		runtime.form.setValue(field, option?.value, { shouldDirty: true });
	};
	const unselected = search.isPending ? 'messages.loading' : 'action.select';
	return (
		<>
			<SearchableSelect
				items={search.items}
				variant='input'
				value={value ?? null}
				onChange={onChange}
				onSearchChange={search.setTerm}
				searchBoxEnabledAt={0}
				searchPlaceholder={t('action.search')}
				unselectedPlaceholder={t(unselected)}
				disabled={disabled}
				testId={`${tid.prefix}.newRow.search`}
			/>
			{search.failure ? <Text size='xs' className={classes.errorText}>{search.failure}</Text> : null}
		</>
	);
}

/**
 * Validates and writes the row. Only the shown columns are validated: the schema may require fields
 * this row has no input for (a parent id the page or the command supplies), and the form's own
 * submit would refuse on those without anything on screen saying why.
 */
function useNewRowAdd(runtime: FormProviderRenderProps, columns: NewRowColumns, t: TranslateFn) {
	const { editing, refresh, locks, modelSchema } = useExcelDataTableContext();
	const write = useNewRowWrite(t);
	const [isSubmitting, setSubmitting] = React.useState(false);
	const [errors, setErrors] = React.useState<ClientErrorItem[]>([]);
	const add = React.useCallback(async () => {
		if (locks.create.locked) {
			return;
		}
		const collected = await collectPayload(runtime, columns, modelSchema, t);
		if (collected.errors) {
			setErrors(collected.errors);
			return;
		}
		setSubmitting(true);
		setErrors([]);
		const clientErrors = await write(collected.payload);
		setSubmitting(false);
		if (clientErrors) {
			setErrors(showServerErrors(runtime, columns, clientErrors));
			return;
		}
		editing.stopCreate();
		refresh();
	}, [columns, editing, locks.create.locked, modelSchema, refresh, runtime, t, write]);
	return { isSubmitting, errors, add };
}

type NewRowAdd = ReturnType<typeof useNewRowAdd>;

/** Field rejections land on their inputs; the rest are returned to show beside the buttons. */
function showServerErrors(
	runtime: FormProviderRenderProps, columns: NewRowColumns, clientErrors: ClientErrorItem[],
): ClientErrorItem[] {
	const split = splitNewRowErrors(clientErrors, [...columns.autoFields, ...columns.editorFields]);
	runtime.setServerErrors(split.attached);
	return split.unattached;
}

type CollectedPayload = { payload: Record<string, unknown>, errors?: undefined } | { errors: ClientErrorItem[] };

async function collectPayload(
	runtime: FormProviderRenderProps, columns: NewRowColumns, modelSchema: dyn.ModelSchema | undefined, t: TranslateFn,
): Promise<CollectedPayload> {
	if (columns.autoFields.length > 0 && !(await runtime.form.trigger(columns.autoFields, { shouldFocus: true }))) {
		// The inputs show their own errors.
		return { errors: [] };
	}
	const payload = buildNewRowPayload(runtime.form.getValues(), columns, modelSchema);
	if (columns.searchField && !(columns.searchField in payload)) {
		return { errors: [rowError('datatable.pickRecord', t('datatable.pickRecord', {
			defaultValue: 'Pick a record to add.',
		}), 'validation')] };
	}
	return { payload };
}

/** Resolves the write's client errors, `[]` for a refusal the page reports itself, or `null` on success. */
function useNewRowWrite(t: TranslateFn): (payload: Record<string, unknown>) => Promise<ClientErrorItem[] | null> {
	const { sinks } = useExcelDataTableContext();
	const commandBus = useCommandBus();
	return React.useCallback(async (payload) => {
		if (sinks.createCommand) {
			const response = await commandBus.publish<unknown>({ name: sinks.createCommand, payload });
			const clientErrors = response.result?.clientErrors ?? [];
			if (clientErrors.length > 0) {
				return clientErrors;
			}
			return response.error == null ? null : [rowError('datatable.addFailed', t('datatable.addFailed', {
				defaultValue: 'The line could not be added. Try again.',
			}), 'business')];
		}
		if (sinks.onCreated) {
			return (await sinks.onCreated(payload)) === false ? [] : null;
		}
		return [];
	}, [commandBus, sinks, t]);
}

function rowError(key: string, message: string, type: 'validation' | 'business'): ClientErrorItem {
	return new ClientErrorItem({ key, message, type });
}

/** Refusals no input of the row can show; one naming a field outside the row says which. */
function RowErrors({ errors }: { errors: ClientErrorItem[] }) {
	const { translateFieldName } = useExcelDataTableContext();
	if (errors.length === 0) {
		return null;
	}
	const text = errors
		.map(error => (error.field ? `${translateFieldName(error.field)}: ` : '') + (error.message || error.key))
		.join(', ');
	return <Text size='xs' className={classes.errorText}>{text}</Text>;
}
