import { Anchor, Loader, Table } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useDynamicModel } from '../../hooks/useDynamicModel';
import { extractLabel } from '../form';
import { LoadingState } from '../Loading';


export type ColumnSize = {
	width?: number | string;
	minWidth?: number | string;
	maxWidth?: number | string;
	flex?: number;
};

export type ColumnRenderer = (row: Record<string, unknown>) => React.ReactNode;
export type HeaderRenderer = (columnName: string, schema: dyn.ModelSchema) => React.ReactNode;

export type AutoTableProps = {
	schemaName: string;
	columnSizes?: Record<string, ColumnSize>;
	columnAsLink?: string;
	columnAsLinkHref?: (rowData: any) => string;
	columnAsId?: string;
	columnRenderers?: Record<string, ColumnRenderer>;
	headerRenderers?: Record<string, HeaderRenderer>;
	data: Record<string, unknown>[];
	isLoading?: boolean;
};

/**
 * Auto-renders a table from a schema registered in the
 * `dyn.schemaRegistry`. The component resolves `schemaName` to a
 * `SchemaPack`, derives columns from `SchemaPack.modelSchema.fields`, and
 * renders each cell through a pipeline that prefers any caller-supplied
 * `columnRenderers` before falling back to data-type-specific renderers.
 */
export const AutoTable: React.FC<AutoTableProps> = (props) => {
	const schemaPack = useDynamicModel(props.schemaName);

	if (!schemaPack) {
		return <LoadingState />;
	}

	return <AutoTableBody {...props} modelSchema={schemaPack.modelSchema} />;
};


type AutoTableBodyProps = AutoTableProps & {
	modelSchema: dyn.ModelSchema;
};

type ResolvedAutoTableProps = AutoTableBodyProps & {
	columnAsId: string;
};

const AutoTableBody: React.FC<AutoTableBodyProps> = (props) => {
	const { t } = useTranslation();
	const columnAsId = props.columnAsId ?? 'id';

	const columns = useMemo(
		() => Object.keys(props.modelSchema.fields),
		[props.modelSchema],
	);

	const hasColumnSizes = !!props.columnSizes;

	const colWidths = useMemo(() => {
		if (!hasColumnSizes) return {};
		return buildColumnWidths(columns, props.columnSizes!);
	}, [columns, props.columnSizes, hasColumnSizes]);

	const tableMinWidth = useMemo(() => {
		if (!hasColumnSizes) return undefined;
		return computeTableMinWidth(columns, props.columnSizes!);
	}, [columns, props.columnSizes, hasColumnSizes]);

	const tableStyle: React.CSSProperties | undefined = hasColumnSizes
		? { tableLayout: 'fixed', width: '100%', minWidth: tableMinWidth }
		: undefined;

	const resolved: ResolvedAutoTableProps = { ...props, columnAsId };

	const tableEl = (
		<Table style={tableStyle}>
			{hasColumnSizes && (
				<colgroup>
					{columns.map((col) => (
						<col key={col} style={{ width: colWidths[col] }} />
					))}
				</colgroup>
			)}
			<AutoTableHead
				columns={columns}
				headerRenderers={props.headerRenderers}
				modelSchema={props.modelSchema}
			/>
			<Table.Tbody>
				{props.isLoading && (
					<Table.Tr>
						<Table.Td colSpan={columns.length} className='text-center'>
							<Loader />
						</Table.Td>
					</Table.Tr>
				)}
				{!props.isLoading && props.data.map((row, index) => (
					<Table.Tr key={String(row[columnAsId] || index)}>
						{columns.map((col) => (
							<Table.Td key={col}>
								{renderCell(col, row, resolved, t)}
							</Table.Td>
						))}
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);

	if (tableMinWidth) {
		return <div style={{ overflowX: 'auto' }}>{tableEl}</div>;
	}
	return tableEl;
};


const AutoTableHead: React.FC<{
	columns: string[];
	headerRenderers?: Record<string, HeaderRenderer>;
	modelSchema: dyn.ModelSchema;
}> = React.memo(({ columns, headerRenderers, modelSchema }) => {
	const { t } = useTranslation();

	return (
		<Table.Thead>
			<Table.Tr>
				{columns.map((col) => {
					if (headerRenderers?.[col]) {
						return (
							<Table.Th key={col}>
								{headerRenderers[col](col, modelSchema)}
							</Table.Th>
						);
					}
					return (
						<Table.Th key={col}>
							{t(getColumnLabel(modelSchema, col))}
						</Table.Th>
					);
				})}
			</Table.Tr>
		</Table.Thead>
	);
});


// ---------------------------------------------------------------------------
// Cell rendering
// ---------------------------------------------------------------------------

type TranslateFn = (key: string) => string;

type CellRendererContext = {
	value: unknown;
	row: Record<string, unknown>;
	fieldName: string;
	field?: dyn.ModelSchemaField;
	modelSchema: dyn.ModelSchema;
	schemaName: string;
	t: TranslateFn;
};

type TypeCellRenderer = (ctx: CellRendererContext) => React.ReactNode;

/**
 * Renders a single cell, honouring the following precedence:
 * 1. `columnRenderers[fieldName]` — caller-supplied override (highest).
 * 2. `columnAsLink` — wrap the value in a link to the row detail.
 * 3. Data-type renderer — mapped from `field.data_type.name`.
 * 4. `String(value)` fallback.
 */
function renderCell(
	fieldName: string,
	row: Record<string, unknown>,
	props: ResolvedAutoTableProps,
	t: TranslateFn,
): React.ReactNode {
	if (props.columnRenderers?.[fieldName]) {
		return props.columnRenderers[fieldName](row);
	}

	const value = row[fieldName];
	if (value === null || value === undefined) return '';

	const field = props.modelSchema.fields[fieldName];
	const ctx: CellRendererContext = {
		value,
		row,
		fieldName,
		field,
		modelSchema: props.modelSchema,
		schemaName: props.schemaName,
		t,
	};

	if (props.columnAsLink && fieldName === props.columnAsLink) {
		return renderLinkCell(ctx, props);
	}

	const renderer = field ? TYPE_CELL_RENDERERS[field.data_type.name] : undefined;
	if (renderer) {
		return renderer(ctx);
	}

	return String(value);
}

const TYPE_CELL_RENDERERS: Partial<Record<dyn.ModelSchemaFieldDataTypeName, TypeCellRenderer>> = {
	boolean: renderBooleanCell,
	nikkiDateTime: renderDateTimeCell,
	url: renderUrlCell,
	enumString: renderEnumStringCell,
	// `string`, `email`, `ulid`, `nikkiEtag`, `model` use the default
	// `String(value)` fallback. Callers override these via `columnRenderers`
	// when richer rendering is required (e.g. avatars, badge lists).
};

function renderBooleanCell({ value, t }: CellRendererContext): React.ReactNode {
	if (value === true) return t('nikki.general.boolean.true');
	if (value === false) return t('nikki.general.boolean.false');
	return String(value);
}

function renderDateTimeCell({ value }: CellRendererContext): React.ReactNode {
	if (value instanceof Date) {
		return value.toLocaleString();
	}
	if (typeof value === 'string') {
		const date = new Date(value);
		if (!isNaN(date.getTime())) {
			return date.toLocaleString();
		}
	}
	return String(value);
}

function renderUrlCell({ value }: CellRendererContext): React.ReactNode {
	const href = String(value);
	return (
		<Anchor href={href} target='_blank' rel='noopener noreferrer'>
			{href}
		</Anchor>
	);
}

function renderEnumStringCell({ value, field, schemaName, t }: CellRendererContext): React.ReactNode {
	if (!field) return String(value);
	// Enum values are translated by key `{schemaName}.{fieldName}.{value}`,
	// matching the convention used by `StaticEnumSelectField`. Fall back to
	// the raw value when the translation is missing.
	const key = `${schemaName}.${field.name}.${String(value)}`;
	const translated = t(key);
	return translated === key ? String(value) : translated;
}

function renderLinkCell(
	ctx: CellRendererContext,
	props: ResolvedAutoTableProps,
): React.ReactNode {
	const { value, row } = ctx;
	const id = row[props.columnAsId] as string;
	const href = props.columnAsLinkHref ? props.columnAsLinkHref(row) : buildDetailHref(id);
	return (
		<Anchor component={Link} to={href}>
			{String(value)}
		</Anchor>
	);
}

function buildDetailHref(id: string): string {
	return `./${id}`;
}


// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

function getColumnLabel(schema: dyn.ModelSchema, fieldName: string): string {
	const field = schema.fields[fieldName];
	if (!field) return fieldName;
	const label = extractLabel(field.label);
	return label || fieldName;
}

function parsePxValue(value: number | string): number | null {
	if (typeof value === 'number') return value;
	if (value.endsWith('px')) return parseFloat(value);
	return null;
}

function buildColumnWidths(
	columns: string[],
	sizes: Record<string, ColumnSize>,
): Record<string, string | number> {
	let fixedPx = 0;
	let totalFlex = 0;

	for (const col of columns) {
		const size = sizes[col];
		const px = size?.width != null ? parsePxValue(size.width) : null;
		if (size?.width != null && px != null) {
			fixedPx += px;
		}
		else {
			totalFlex += size?.flex ?? 1;
		}
	}

	const widths: Record<string, string | number> = {};
	for (const col of columns) {
		const size = sizes[col];
		if (size?.width != null) {
			widths[col] = size.width;
		}
		else {
			const flex = size?.flex ?? 1;
			const ratio = flex / totalFlex;
			widths[col] = fixedPx > 0
				? `calc((100% - ${fixedPx}px) * ${ratio})`
				: `${(ratio * 100).toFixed(4)}%`;
		}
	}
	return widths;
}

function computeTableMinWidth(
	columns: string[],
	sizes: Record<string, ColumnSize>,
): number | undefined {
	let total = 0;
	let hasMin = false;
	for (const col of columns) {
		const size = sizes[col];
		const min = size?.minWidth != null ? parsePxValue(size.minWidth) : null;
		const fixed = size?.width != null ? parsePxValue(size.width) : null;
		const px = min ?? fixed;
		if (px != null) {
			total += px;
			hasMin = true;
		}
	}
	return hasMin ? total : undefined;
}
