import { Table as MantineTable, Text } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { EmptyActionColumnCell } from './actionColumns/ActionColumnCell';
import { useExcelDataTableContext } from './context';
import { EmptySortHandleCell } from './manualSort/ManualSort';
import classes from './NewRow.module.css';
import { buildNewRowPayload, findNewRowConfigProblems, resolveNewRowColumns, splitNewRowErrors } from './newRowModel';
import { useNewRowSearch } from './newRowSearch';
import { EditRowActions } from './rowActions';
import { isPopupEnterForRow, readRowKey } from './rowKeys';
import { RowLoading } from './RowLoading';
import { ROW_SELECT_DEFAULTS } from './rowSelectDefaults';
import { useColumnCount } from './tableLayout';
import { useSchemaLocalize, useTranslate } from '../../i18n';
import { useCommandBus } from '../../microApp/MicroAppProvider';
import { Button } from '../Button';
import { AutoField, CrudFormProvider } from '../form';
import { SearchableSelect } from '../SearchableSelect';
import { SelectDefaultsContext } from '../SearchableSelect/dropdownWidth';

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
 * creatable column with Add / Discard in the filler cell. Rendered by `Table` after the data rows.
 * A successful Add opens a fresh, empty insert row in its place; only Discard closes it.
 */
export function NewRow(): React.ReactNode {
	const { capabilities, editing, modelSchema } = useExcelDataTableContext();
	const [generation, setGeneration] = React.useState(0);
	useNewRowConfigCheck();
	if (!capabilities.includes('create') || !modelSchema) {
		return null;
	}
	return editing.creating
		? <InsertRow key={generation} modelSchema={modelSchema} onAdded={() => setGeneration(count => count + 1)} />
		: <AddLineRow />;
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
	const { newRow, locks, editing, selection, tid } = useExcelDataTableContext();
	const columnCount = useColumnCount();
	// No row stays picked behind the insert row: its gestures are frozen while it is open.
	const onOpen = () => {
		selection.clear();
		editing.startCreate();
	};
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
					onClick={onOpen}
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
function InsertRow({ modelSchema, onAdded }: { modelSchema: dyn.ModelSchema, onAdded: () => void }) {
	const localize = useSchemaLocalize(modelSchema.name);
	return (
		<CrudFormProvider
			schemaName={modelSchema.name}
			formVariant='create'
			localize={localize}
			onSubmit={ignoreSubmit}
			loadingFallback={<RowLoading />}
		>
			{runtime => <InsertCells runtime={runtime} onAdded={onAdded} />}
		</CrudFormProvider>
	);
}

function ignoreSubmit(): void {
	// The insert row never submits through the form; `useNewRowAdd` writes instead.
}

function InsertCells({ runtime, onAdded }: { runtime: FormProviderRenderProps, onAdded: () => void }) {
	const t = useTranslate('common');
	const context = useExcelDataTableContext();
	const { fields, newRow, modelSchema, indexColumnVisible, editing, isLoading, tid } = context;
	const columns = React.useMemo(
		() => resolveNewRowColumns(modelSchema, fields, newRow), [modelSchema, fields, newRow],
	);
	const submit = useNewRowAdd({ runtime, columns, t, onAdded });
	const busy = submit.isSubmitting || isLoading;
	const rowRef = useFirstInputFocus(busy);
	const { onKeyDown, onKeyDownCapture } = useInsertRowKeys(busy, submit.add, editing.stopCreate);
	return (
		<SelectDefaultsContext.Provider value={ROW_SELECT_DEFAULTS}>
			<MantineTable.Tr
				ref={rowRef}
				tabIndex={-1}
				onKeyDown={onKeyDown}
				onKeyDownCapture={onKeyDownCapture}
				aria-label={t('datatable.newLine', { defaultValue: 'New line' })}
				{...tid.attrs('newRow')}
			>
				{indexColumnVisible ? (
					<MantineTable.Td className={classes.indexCell}>
						<IconPlus size={14} aria-hidden />
					</MantineTable.Td>
				) : null}
				{context.manualSort.enabled ? <EmptySortHandleCell /> : null}
				{context.columns.map(column => (column.kind === 'action' ? <EmptyActionColumnCell key={column.key} /> : (
					<NewRowCell
						key={column.key}
						field={column.field}
						columns={columns}
						runtime={runtime}
						disabled={busy}
					/>
				)))}
				<InsertRowActions submit={submit} busy={busy} />
			</MantineTable.Tr>
		</SelectDefaultsContext.Provider>
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

/** Enter adds and Escape discards, for keys pressed in the row's own inputs (see `rowKeyIntent`). */
function useInsertRowKeys(busy: boolean, add: () => Promise<void>, discard: () => void) {
	const confirm = () => {
		if (!busy) {
			void add();
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

/**
 * Focus goes into the first input when the row opens: the row's own Enter and Escape only see keys
 * from inside it, and the click that opened it left focus on a button that no longer exists.
 *
 * The row a successful Add remounts usually opens while the refresh it started is loading, with its
 * inputs disabled, where focus cannot land. So the focus waits for the row to be ready, once: a
 * later load must not pull focus back from wherever the user moved it.
 */
function useFirstInputFocus(busy: boolean): React.RefObject<HTMLTableRowElement | null> {
	const rowRef = React.useRef<HTMLTableRowElement | null>(null);
	const pending = React.useRef(true);
	React.useEffect(() => {
		if (busy || !pending.current) {
			return;
		}
		pending.current = false;
		const input = rowRef.current?.querySelector<HTMLElement>(FOCUSABLE_INPUT);
		(input ?? rowRef.current)?.focus();
	}, [busy]);
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
type NewRowAddDeps = {
	runtime: FormProviderRenderProps,
	columns: NewRowColumns,
	t: TranslateFn,
	/** Called after a successful write: the caller opens the next, empty insert row. */
	onAdded: () => void,
};

function useNewRowAdd({ runtime, columns, t, onAdded }: NewRowAddDeps) {
	const { refresh, locks, modelSchema, changes } = useExcelDataTableContext();
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
		changes.beginCreate();
		const clientErrors = await write(collected.payload);
		setSubmitting(false);
		if (clientErrors) {
			changes.cancelCreate();
			setErrors(showServerErrors(runtime, columns, clientErrors));
			return;
		}
		onAdded();
		refresh();
	}, [changes, columns, locks.create.locked, modelSchema, onAdded, refresh, runtime, t, write]);
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
