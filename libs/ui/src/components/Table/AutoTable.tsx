import { Anchor, Loader, Table, TableProps } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { testAttrs } from '@nikkierp/common/utils';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { useLocalize, useTranslate } from '../../i18n';
import { LoadingState } from '../Loading';


export type ColumnSize = {
	width?: number | string,
	minWidth?: number | string,
	maxWidth?: number | string,
	flex?: number,
};

export type ColumnRenderer = (row: Record<string, unknown>) => React.ReactNode;
export type HeaderRenderer = (columnName: string, schema: dyn.ModelSchema) => React.ReactNode;

export type AutoTableProps = Omit<TableProps, 'data' | 'children'> & {
	/** Schema resolved from the registry. Omit when `schema` is supplied directly. */
	schemaName?: string,
	// i18next namespace of this resource (namespace "common" is included by default)
	translationNs?: string,
	/** Directly supplied model schema (legacy API). Takes precedence over `schemaName`. */
	schema?: dyn.ModelSchema,
	/** Explicit column list. Defaults to the schema's non-hidden fields. */
	columns?: string[],
	columnSizes?: Record<string, ColumnSize>,
	columnAsLink?: string,
	columnAsLinkHref?: (rowData: any) => string,
	columnAsId?: string,
	columnRenderers?: Record<string, ColumnRenderer>,
	headerRenderers?: Record<string, HeaderRenderer>,
	theadProps?: React.ComponentProps<typeof Table.Thead>,
	data: Record<string, unknown>[],
	isLoading?: boolean,
	/**
	 * `{module}.{component}` prefix for the `data-testid` of each row and cell. Rows are keyed by
	 * `columnAsId` so a test's handle survives sorting and paging.
	 */
	testId?: string,
};

/**
 * Auto-renders a table from a schema registered in the
 * `dyn.schemaRegistry`. The component resolves `schemaName` to a
 * `SchemaPack`, derives columns from `SchemaPack.modelSchema.fields`, and
 * renders each cell through a pipeline that prefers any caller-supplied
 * `columnRenderers` before falling back to data-type-specific renderers.
 */
export const AutoTable: React.FC<AutoTableProps> = (props) => {
	const schemaPack = useDynamicModel(props.schemaName ?? '');
	const modelSchema = props.schema ?? schemaPack?.modelSchema;

	if (!modelSchema) {
		return <LoadingState />;
	}

	return <AutoTableBody {...props} modelSchema={modelSchema} />;
};


type AutoTableBodyProps = AutoTableProps & {
	modelSchema: dyn.ModelSchema,
};

type ResolvedAutoTableProps = AutoTableBodyProps & {
	columnAsId: string,
};

const AutoTableBody: React.FC<AutoTableBodyProps> = (props) => {
	// Custom props are pulled out (some unused) so `tableProps` holds only Mantine Table props.
	const {
		schemaName: _schemaName, translationNs, schema: _schema, columns: columnsProp, columnSizes,
		columnAsLink: _columnAsLink, columnAsLinkHref: _columnAsLinkHref, columnAsId: columnAsIdProp,
		columnRenderers: _columnRenderers, headerRenderers, theadProps, data, isLoading, modelSchema,
		testId,
		...tableProps
	} = props;
	const t = useTranslate(translationNs);
	const columnAsId = columnAsIdProp ?? 'id';

	const columns = useMemo(
		() => columnsProp ?? Object.entries(modelSchema.fields)
			.filter(([, field]) => !(field as { hidden?: boolean }).hidden)
			.map(([name]) => name),
		[columnsProp, modelSchema],
	);

	const hasColumnSizes = !!columnSizes;

	const colWidths = useMemo(() => {
		if (!hasColumnSizes) return {};
		return buildColumnWidths(columns, columnSizes!);
	}, [columns, columnSizes, hasColumnSizes]);

	const tableMinWidth = useMemo(() => {
		if (!hasColumnSizes) return undefined;
		return computeTableMinWidth(columns, columnSizes!);
	}, [columns, columnSizes, hasColumnSizes]);

	const tableStyle: React.CSSProperties | undefined = hasColumnSizes
		? { tableLayout: 'fixed', width: '100%', minWidth: tableMinWidth }
		: undefined;

	const resolved: ResolvedAutoTableProps = { ...props, columnAsId };

	const tableEl = (
		<Table {...tableProps} style={{ ...(tableProps.style as React.CSSProperties), ...tableStyle }}>
			{hasColumnSizes && (
				<colgroup>
					{columns.map((col) => (
						<col key={col} style={{ width: colWidths[col] }} />
					))}
				</colgroup>
			)}
			<AutoTableHead
				columns={columns}
				headerRenderers={headerRenderers}
				modelSchema={modelSchema}
				translationNs={translationNs}
				theadProps={theadProps}
			/>
			<Table.Tbody>
				{isLoading && (
					<Table.Tr>
						<Table.Td colSpan={columns.length} className='text-center'>
							<Loader />
						</Table.Td>
					</Table.Tr>
				)}
				{!isLoading && data.map((row, index) => {
					const rowId = String(row[columnAsId] || index);
					return (
						<Table.Tr key={rowId} {...testAttrs(testId, 'row', rowId)}>
							{columns.map((col) => (
								<Table.Td key={col} {...testAttrs(testId, 'row', rowId, 'cell', col)}>
									{renderCell(col, row, resolved, t)}
								</Table.Td>
							))}
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);

	if (tableMinWidth) {
		return <div style={{ overflowX: 'auto' }}>{tableEl}</div>;
	}
	return tableEl;
};


const AutoTableHead: React.FC<{
	columns: string[],
	headerRenderers?: Record<string, HeaderRenderer>,
	modelSchema: dyn.ModelSchema,
	translationNs?: string,
	theadProps?: React.ComponentProps<typeof Table.Thead>,
}> = React.memo(({ columns, headerRenderers, modelSchema, translationNs, theadProps }) => {
	const localize = useLocalize(translationNs);

	return (
		<Table.Thead {...theadProps}>
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
							{localize(normalizeLegacyLabelRef(modelSchema.fields[col]?.label))}
						</Table.Th>
					);
				})}
			</Table.Tr>
		</Table.Thead>
	);
});

// Legacy local schema JSONs carry labels as pseudo-JSON strings, e.g.
// "{ \"$ref\": 'themes.fields.code' }" — single-quoted, so not parseable as JSON.
// Extract the translation key so `useLocalize` can resolve it.
function normalizeLegacyLabelRef(
	label: dyn.ModelSchemaLangJson | string | undefined,
): dyn.ModelSchemaLangJson | string | undefined {
	if (typeof label === 'string' && label.includes(dyn.LangJsonRefKey)) {
		const match = label.match(/'([^']+)'/) ?? label.match(/"\$ref"\s*:\s*"([^"]+)"/);
		if (match) return match[1];
	}
	return label;
}


// ---------------------------------------------------------------------------
// Cell rendering
// ---------------------------------------------------------------------------

type TranslateFn = (key: string) => string;

type CellRendererContext = {
	value: unknown,
	row: Record<string, unknown>,
	fieldName: string,
	field?: dyn.ModelSchemaField,
	modelSchema: dyn.ModelSchema,
	schemaName: string,
	t: TranslateFn,
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
		schemaName: props.schemaName ?? props.modelSchema.name,
		t,
	};

	if (props.columnAsLink && fieldName === props.columnAsLink) {
		return renderLinkCell(ctx, props);
	}

	// Legacy directly-supplied schemas have no `data_type` on their fields.
	const renderer = field?.data_type ? TYPE_CELL_RENDERERS[field.data_type.name] : undefined;
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
	if (value === true) return t('boolean.yes');
	if (value === false) return t('boolean.no');
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
