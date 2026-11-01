import { Badge, Group } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Modal } from '@nikkierp/ui/components';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { useI18n, useTranslate } from '@nikkierp/ui/i18n';
import { IconAdjustments } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';

import {
	ATTRIBUTE_ROW_EDITORS, MOVES_TEST_ID_PREFIX, MoveAttributeScopeContext, useAttributeOptions, useValueOptions,
} from './moveEditors';
import {
	ATTRIBUTE_FIELD, ATTRIBUTE_ROW_COLUMNS, ATTRIBUTE_ROW_SCHEMA, ATTRIBUTES_FIELD, TEMPLATE_FIELD, VALUE_FIELD,
} from './moveGroups';
import { INVENTORY_MODULE } from '../../../../constants/inventory';
import { localizedName } from '../templateAttributes/attributeCatalogue';

import type { MoveAttribute } from './moveGroups';
import type {
	ExcelDataTableCapability, NewRowFieldEditor, NewRowFieldEditorProps, SearchData, SearchItem,
} from '@nikkierp/ui/components/ExcelDataTable';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


const ROW_CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
/** A table-scope write refuses a row without an etag; the modal's rows never reach the server as such. */
const LOCAL_ETAG = 'local';
const NO_ATTRIBUTES: MoveAttribute[] = [];

type NamedAttribute = MoveAttribute & {
	product_attribute?: { name?: unknown },
	product_attribute_value?: { name?: unknown },
};

function asAttributes(raw: unknown): NamedAttribute[] {
	return Array.isArray(raw) ? raw as NamedAttribute[] : NO_ATTRIBUTES;
}

/**
 * One value as a read-only badge. A saved value carries its name; one picked in the modal is named from the
 * template's options, which the section reads once per template.
 */
function AttributeValueBadge({ templateId, attribute }: {
	templateId: string | undefined,
	attribute: NamedAttribute,
}): React.ReactNode {
	const { language } = useI18n();
	const valueId = String(attribute[VALUE_FIELD] ?? '');
	const stored = attribute.product_attribute_value?.name;
	const attributes = useAttributeOptions(stored == null ? templateId : undefined);
	const line = attributes.options.find(option => option.value === attribute[ATTRIBUTE_FIELD]);
	const values = useValueOptions(stored == null ? line?.templateAttributeId : undefined);
	const label = stored == null
		? values.options.find(option => option.value === valueId)?.label ?? valueId
		: localizedName(stored, language, valueId);
	const attributeName = attribute.product_attribute?.name ?? line?.label;
	return (
		<Badge
			variant='light' color='gray' radius='sm' tt='none'
			title={attributeName == null ? undefined : localizedName(attributeName, language, '')}
		>
			{label}
		</Badge>
	);
}

/** The move's attribute values, as read-only badges. */
export function AttributeBadges({ templateId, attributes }: {
	templateId: string | undefined,
	attributes: NamedAttribute[],
}): React.ReactNode {
	const shown = attributes.filter(attribute => attribute[VALUE_FIELD]);
	if (shown.length === 0) {
		return null;
	}
	return (
		<Group gap={4} wrap='wrap' {...testAttrs(MOVES_TEST_ID_PREFIX, 'attributeBadges')}>
			{shown.map(attribute => (
				<AttributeValueBadge
					key={`${String(attribute[ATTRIBUTE_FIELD])}:${String(attribute[VALUE_FIELD])}`}
					templateId={templateId} attribute={attribute}
				/>
			))}
		</Group>
	);
}

/** The read cell of `attributes`: the list arrives raw (`renderRaw`), with the row for its template. */
export const moveAttributesRenderer: IFieldRenderer = {
	render: (rawValue: string) => rawValue,
	renderRaw: (rawValue, _textValue, record) => (
		<AttributeBadges
			templateId={record?.[TEMPLATE_FIELD] == null ? undefined : String(record[TEMPLATE_FIELD])}
			attributes={asAttributes(rawValue)}
		/>
	),
};

const sameAttributes = (left: MoveAttribute[], right: MoveAttribute[]) => JSON.stringify(left.map(pickIds))
	=== JSON.stringify(right.map(pickIds));

function pickIds(attribute: MoveAttribute): MoveAttribute {
	return { [ATTRIBUTE_FIELD]: attribute[ATTRIBUTE_FIELD] ?? null, [VALUE_FIELD]: attribute[VALUE_FIELD] ?? null };
}

/**
 * The `attributes` cell while the moves are edited: the badges, then `[Configure]`, which opens the
 * attributes modal. The modal's rows reach the move only when it closes, as one change of the cell.
 */
export function AttributesCellEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const templateValue = useWatch({ control: form.form.control, name: TEMPLATE_FIELD }) as unknown;
	const attributes = asAttributes(useWatch({ control: form.form.control, name: field }));
	const templateId = templateValue == null || templateValue === '' ? undefined : String(templateValue);
	const [opened, setOpened] = React.useState(false);
	const onClose = (next: MoveAttribute[]) => {
		setOpened(false);
		if (!sameAttributes(next, attributes)) {
			form.form.setValue(field, next, { shouldDirty: true });
			form.form.clearErrors(field);
		}
	};
	return (
		<Group gap={4} wrap='wrap' align='center'>
			<AttributeBadges templateId={templateId} attributes={attributes} />
			<Button
				variant='subtle' size='compact-sm' leftSection={<IconAdjustments size={14} />}
				disabled={!templateId} onClick={() => setOpened(true)}
				{...testAttrs(MOVES_TEST_ID_PREFIX, 'configureAttributes')}
			>
				{t('stock_transfer_moves_configure', { defaultValue: 'Configure' })}
			</Button>
			{opened ? (
				<MoveAttributesModal templateId={templateId} attributes={attributes} onClose={onClose} />
			) : null}
		</Group>
	);
}

type AttributeRow = SearchItem & MoveAttribute;

/** The modal's rows from the move's attributes, each with a local id and etag. */
function toRows(attributes: MoveAttribute[]): AttributeRow[] {
	return attributes.map((attribute, index) => ({ ...pickIds(attribute), id: `row:${index}`, etag: LOCAL_ETAG }));
}

/** The modal's rows that name a value: a row left without one would make the backend refuse the move. */
function toAttributes(rows: AttributeRow[]): MoveAttribute[] {
	return rows.filter(row => row[ATTRIBUTE_FIELD] && row[VALUE_FIELD]).map(pickIds);
}

function useAttributeRows(attributes: MoveAttribute[]) {
	const [rows, setRows] = React.useState<AttributeRow[]>(() => toRows(attributes));
	const nextKey = React.useRef(attributes.length);
	const onCreated = (values: Record<string, unknown>): boolean => {
		const row = { ...pickIds(values), id: `row:${nextKey.current++}`, etag: LOCAL_ETAG };
		setRows(previous => [...previous, row]);
		return true;
	};
	const onUpdated = (values: Record<string, unknown>): boolean => {
		setRows(previous => previous.map(row => (
			row.id === values.id ? { ...row, ...pickIds({ ...row, ...values }) } : row
		)));
		return true;
	};
	const onDeleted = (items: SearchItem[]) => {
		const ids = new Set(items.map(item => item.id));
		setRows(previous => previous.filter(row => !ids.has(row.id)));
	};
	return { rows, onCreated, onUpdated, onDeleted };
}

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

/**
 * Attribute | Value of one move, always editable, with an insert row; no action button, only the X. Closing
 * hands the rows that name a value back. The modal's events stop at its wrapper: through the portal they would
 * otherwise bubble into the moves row that opened it (Enter writes that row, Escape resets its field).
 */
function MoveAttributesModal({ templateId, attributes, onClose }: {
	templateId: string | undefined,
	attributes: MoveAttribute[],
	onClose: (attributes: MoveAttribute[]) => void,
}): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const { rows, ...sinks } = useAttributeRows(attributes);
	const scope = React.useMemo(() => ({
		templateId,
		attributeByRow: new Map(rows.filter(row => row[ATTRIBUTE_FIELD]).map(row => [
			String(row.id), String(row[ATTRIBUTE_FIELD]),
		])),
	}), [templateId, rows]);
	const data = React.useMemo((): SearchData => ({
		items: rows, total: rows.length, page: 0, size: Math.max(rows.length, 1), desired_fields: ATTRIBUTE_ROW_COLUMNS,
		masked_fields: [], schema_etag: '', edge_labels: {},
	} as SearchData), [rows]);
	return (
		<span className='contents' onKeyDown={stopPropagation} onFocus={stopPropagation} onBlur={stopPropagation}>
			<Modal
				opened centered size='lg' onClose={() => onClose(toAttributes(rows))}
				title={t('stock_transfer_moves_configure_title', { defaultValue: 'Configure attributes' })}
				{...testAttrs(MOVES_TEST_ID_PREFIX, 'attributesModal')}
			>
				<MoveAttributeScopeContext.Provider value={scope}>
					<ExcelDataTable.Provider
						tableName='stockTransferMoveAttributes'
						modelSchema={ATTRIBUTE_ROW_SCHEMA}
						localModelSchema
						data={data}
						isLoading={false}
						indexColumnVisible={false}
						selectionMode='none'
						capabilities={ROW_CAPABILITIES}
						updateMode
						updateScope='table'
						fieldEditors={ATTRIBUTE_ROW_EDITORS}
						newRowPrompt={t('stock_transfer_moves_add_attribute', { defaultValue: 'Add attribute' })}
						emptyMessage={t('stock_transfer_moves_no_attributes', { defaultValue: 'No attributes yet' })}
						testId={`${MOVES_TEST_ID_PREFIX}.attributes`}
						{...sinks}
					>
						<ExcelDataTable.TableHeader enableColumnFilters={false} />
						<ExcelDataTable.Table />
					</ExcelDataTable.Provider>
				</MoveAttributeScopeContext.Provider>
			</Modal>
		</span>
	);
}

/**
 * Module-level, so the rows keep the same editor components (and their state) across renders. The template keeps
 * its relation select (`AutoField`); the section's sink drops a move's attributes when its template changes.
 */
export const MOVE_FIELD_EDITORS: Record<string, NewRowFieldEditor> = { [ATTRIBUTES_FIELD]: AttributesCellEditor };

export const MOVE_FIELD_RENDERERS: Record<string, IFieldRenderer> = { [ATTRIBUTES_FIELD]: moveAttributesRenderer };
