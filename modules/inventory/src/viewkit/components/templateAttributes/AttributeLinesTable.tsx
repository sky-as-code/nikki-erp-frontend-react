import { Alert, Badge, Group, Text, Tooltip } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { actionRequirement } from '@nikkierp/viewkit-mantine';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

import {
	applyRowUpdate, ATTRIBUTE_FIELD, configureColumns, isChangedLineRow, isNewLineRow,
	LINE_TABLE_SCHEMA, linesToRows, MODE_FIELD, readNewLine, rowsToSearchData, VALUES_FIELD,
} from './attributeLineRows';
import { LINE_FIELD_EDITORS, LineEditorContext, ModeBadge, NEW_LINE_FIELD_EDITORS } from './lineEditors';
import { ResolveVariantToolbar } from './ResolveVariantModal';
import { attributeLabel, TEST_ID_PREFIX, valueLabel } from './sectionText';
import { addLineWith, removeLine, reorderLines } from './templateConfigDrafts';
import {
	PRODUCT_ATTRIBUTE_SCHEMA_NAME, PRODUCT_ATTRIBUTE_UPDATE_VALUE_ACTION, PRODUCT_TEMPLATE_SCHEMA_NAME,
} from '../../../constants';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { SectionText } from './sectionText';
import type { TemplateConfigDraft } from './templateConfigDrafts';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ActionColumn, ColumnWidths, ExcelDataTableCapability, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


const EDIT_CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
/** The attribute column holds the name and, in edit mode, the New / Changed badge before it. */
const COLUMN_WIDTHS: ColumnWidths = { [ATTRIBUTE_FIELD]: 260, [VALUES_FIELD]: 360, [MODE_FIELD]: 150 };
/** The lines ride the template's own write, which the backend authorizes as that create or update. */
const CREATE_REQUIREMENT = actionRequirement(PRODUCT_TEMPLATE_SCHEMA_NAME, 'create');
const UPDATE_REQUIREMENT = actionRequirement(PRODUCT_TEMPLATE_SCHEMA_NAME, 'update');
/** Configure leads straight into editing extra prices, so it asks what that edit asks. */
const CONFIGURE_REQUIREMENT = actionRequirement(PRODUCT_ATTRIBUTE_SCHEMA_NAME, PRODUCT_ATTRIBUTE_UPDATE_VALUE_ACTION);

type LinesTableProps = {
	saved: TemplateConfigDraft,
	draft: TemplateConfigDraft,
	catalogue: AttributeCatalogue,
	editable: boolean,
	mode: 'create' | 'update',
	lineErrors: Record<string, ClientErrorItem[]>,
	onChange: (next: TemplateConfigDraft) => void,
	requestValues: (attributeId: string) => void,
	text: SectionText,
};

/**
 * One row per attribute: the attribute, its selected values, a link to their extra prices, and
 * whether it creates variants. In edit mode every row is editable at once and every change is a
 * draft of the template's Save; rows are reordered by dragging, which renumbers `sequence`. Rows
 * are never selected: there is nothing to act on in bulk, so the index column is hidden too and
 * the New/Changed badge sits in the attribute cell.
 */
export function AttributeLinesTable(props: LinesTableProps): React.ReactNode {
	const { draft, catalogue, editable, text } = props;
	const rows = React.useMemo(() => linesToRows(draft, catalogue), [draft, catalogue]);
	const data = React.useMemo(() => rowsToSearchData(rows), [rows]);
	const sinks = useLineSinks(props);
	const actionColumns = useActionColumns(editable, text);
	const fieldRenderers = useLineRenderers(catalogue, text, props.lineErrors);
	const editorState = React.useMemo(
		() => ({ draft, catalogue, text, requestValues: props.requestValues }),
		[draft, catalogue, text, props.requestValues],
	);
	const lock = props.mode === 'create' ? CREATE_REQUIREMENT : UPDATE_REQUIREMENT;
	const generation = useTableGeneration(props.saved, editable);
	if (draft.lines.length === 0 && !editable) {
		return (
			<Text size='sm' c='dimmed' {...testAttrs(TEST_ID_PREFIX, 'empty')}>
				{text.t('product_template_config_empty')}
			</Text>
		);
	}
	return (
		<LineEditorContext.Provider value={editorState}>
			<LineErrors draft={draft} catalogue={catalogue} lineErrors={props.lineErrors} text={text} />
			<ExcelDataTable.Provider
				key={generation}
				testId={`${TEST_ID_PREFIX}.lines`}
				tableName='templateAttributeLines'
				modelSchema={LINE_TABLE_SCHEMA}
				data={data}
				updateMode={editable}
				updateScope='table'
				capabilities={EDIT_CAPABILITIES}
				createEntitlement={lock}
				updateEntitlement={lock}
				deleteEntitlement={lock}
				fieldEditors={LINE_FIELD_EDITORS}
				newRowFieldEditors={NEW_LINE_FIELD_EDITORS}
				newRowPrompt={text.t('product_template_config_add')}
				btnDeleteLabel='inventory:product_template_config_remove'
				indexColumnVisible={false}
				selectionMode='none'
				enableManualSort
				enableChangeIndicator
				actionColumns={actionColumns}
				initialColumnWidths={COLUMN_WIDTHS}
				fieldRenderers={fieldRenderers}
				translateFieldName={sinks.columnLabel}
				emptyMessage={text.t('product_template_config_empty')}
				{...sinks.writes}
			>
				<ResolveVariantToolbar />
				<div>
					<ExcelDataTable.TableHeader enableColumnFilters={false} />
					<ExcelDataTable.Table />
				</div>
			</ExcelDataTable.Provider>
		</LineEditorContext.Provider>
	);
}

/** The table's row writes, applied to the draft; nothing is sent until the template's Save. */
function useLineSinks(props: LinesTableProps) {
	const { saved, draft, onChange, text } = props;
	const latest = React.useRef(draft);
	latest.current = draft;
	const writes = React.useMemo(() => ({
		onCreated: (values: Record<string, unknown>): boolean => {
			const line = readNewLine(values);
			if (line) {
				onChange(addLineWith(latest.current, line.attributeId, line.valueIds));
			}
			return line !== null;
		},
		onUpdated: (values: Record<string, unknown>): boolean => {
			onChange(applyRowUpdate(latest.current, values));
			return true;
		},
		onDeleted: (items: SearchItem[]) => {
			const removeRow = (next: TemplateConfigDraft, item: SearchItem) => removeLine(next, String(item.id));
			onChange(items.reduce(removeRow, latest.current));
		},
		onManualSort: (orderedIds: string[]) => onChange(reorderLines(latest.current, orderedIds)),
	}), [onChange]);
	const badges = React.useMemo(() => ({
		isNewRow: (row: SearchItem) => isNewLineRow(saved, row),
		isChangedRow: (row: SearchItem) => isChangedLineRow(saved, draft, row),
	}), [saved, draft]);
	const columnLabel = React.useCallback((field: string) => text.t(COLUMN_LABELS[field] ?? field), [text]);
	return { writes: { ...writes, ...badges }, columnLabel };
}

/**
 * Remounts the table whenever the saved configuration or the mode changes, which resets the
 * badges it tracks itself: a saved or discarded edit is no longer "New" or "Changed". The draft
 * keys restart at `line:1` on every reload, so a stale badge would land on another line.
 */
function useTableGeneration(saved: TemplateConfigDraft, editable: boolean): string {
	const ref = React.useRef({ saved, generation: 0 });
	if (ref.current.saved !== saved) {
		ref.current = { saved, generation: ref.current.generation + 1 };
	}
	return `${ref.current.generation}:${editable}`;
}

const COLUMN_LABELS: Record<string, string> = {
	[ATTRIBUTE_FIELD]: 'product_template_config_attribute',
	[VALUES_FIELD]: 'product_template_config_values',
	[MODE_FIELD]: 'product_template_config_variantCreation',
};

/** "Configure" opens the saved line's extra prices; hidden in edit mode, which it would leave. */
function useActionColumns(editable: boolean, text: SectionText): ActionColumn[] {
	return React.useMemo(() => configureColumns(editable, {
		configure: text.t('product_template_config_configure'),
		saveFirst: text.t('product_template_config_saveFirst'),
	}, CONFIGURE_REQUIREMENT), [editable, text]);
}

/** Read-only cells: the attribute's name, the values as badges, and the mode with the row's save errors. */
function useLineRenderers(
	catalogue: AttributeCatalogue, text: SectionText, lineErrors: Record<string, ClientErrorItem[]>,
): FieldRendererMap {
	return React.useMemo((): FieldRendererMap => ({
		[ATTRIBUTE_FIELD]: {
			render: value => value,
			renderRaw: raw => <Text size='sm'>{attributeLabel(catalogue, String(raw ?? ''), text)}</Text>,
		},
		[VALUES_FIELD]: {
			render: value => value,
			renderRaw: raw => (
				<ValueBadges valueIds={Array.isArray(raw) ? raw.map(String) : []} catalogue={catalogue} text={text} />
			),
		},
		[MODE_FIELD]: {
			render: value => value,
			renderRaw: (raw, _text, record) => (
				<ModeCell mode={typeof raw === 'string' ? raw : ''} errors={lineErrors[String(record?.id)] ?? []} text={text} />
			),
		},
	}), [catalogue, text, lineErrors]);
}

function ValueBadges({ valueIds, catalogue, text }: {
	valueIds: string[], catalogue: AttributeCatalogue, text: SectionText,
}): React.ReactNode {
	return (
		<Group gap={4}>
			{valueIds.map(id => {
				const value = catalogue.values.get(id);
				return (
					<Badge key={id} size='sm' variant='outline' color={value?.isArchived ? 'gray' : 'blue'} tt='none'>
						{value ? valueLabel(value, text) : id}
					</Badge>
				);
			})}
		</Group>
	);
}

function ModeCell({ mode, errors, text }: {
	mode: string, errors: ClientErrorItem[], text: SectionText,
}): React.ReactNode {
	return (
		<Group gap='xs' wrap='nowrap'>
			{mode ? <ModeBadge mode={mode} text={text} /> : null}
			{errors.length > 0 ? (
				<Tooltip label={errors.map(text.translateError).join('\n')} multiline maw={360} withinPortal>
					<IconAlertCircle
						size={16}
						color='var(--mantine-color-red-filled)'
						{...testAttrs(TEST_ID_PREFIX, 'lineError')}
					/>
				</Tooltip>
			) : null}
		</Group>
	);
}

/** Every rejected line, named by its attribute: in edit mode the line's cells are inputs, not text. */
function LineErrors({ draft, catalogue, lineErrors, text }: {
	draft: TemplateConfigDraft,
	catalogue: AttributeCatalogue,
	lineErrors: Record<string, ClientErrorItem[]>,
	text: SectionText,
}): React.ReactNode {
	const messages = draft.lines.flatMap(line => (lineErrors[line.key] ?? []).map(item => (
		`${attributeLabel(catalogue, line.attributeId, text)}: ${text.translateError(item)}`
	)));
	if (messages.length === 0) {
		return null;
	}
	return (
		<Alert variant='light' color='red' {...testAttrs(TEST_ID_PREFIX, 'lineErrors')}>
			{messages.map((message, index) => <div key={index}>{message}</div>)}
		</Alert>
	);
}
