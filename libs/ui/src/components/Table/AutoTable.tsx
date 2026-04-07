import { Anchor, Loader, Table } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ModelSchema } from '../../model';
import { extractLabel } from '../form';


function getAvailableColumns(schema: ModelSchema): string[] {
	return Object.entries(schema.fields)
		.filter(([, field]) => !field.hidden)
		.map(([name]) => name);
}

function getColumnLabel(schema: ModelSchema, fieldName: string): string {
	const field = schema.fields[fieldName];
	if (!field) return fieldName;
	return extractLabel(field.label);
}

export type ColumnSize = {
	width?: number | string;
	minWidth?: number | string;
	maxWidth?: number | string;
	flex?: number;
};

export type AutoTableProps = {
	columns: string[];
	columnSizes?: Record<string, ColumnSize>;
	columnAsLink?: string;
	columnAsLinkHref?: (rowData: any) => string;
	columnAsId?: string;
	columnRenderers?: Record<string, (row: Record<string, unknown>) => React.ReactNode>;
	headerRenderers?: Record<string, (columnName: string, schema: ModelSchema) => React.ReactNode>;
	data: Record<string, unknown>[];
	isLoading?: boolean;
	schema: ModelSchema;
};

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

const AutoTableHead: React.FC<{
	columns: string[];
	headerRenderers?: Record<string, (columnName: string, schema: ModelSchema) => React.ReactNode>;
	schema: ModelSchema;
}> = React.memo(({ columns, headerRenderers, schema }) => {
	const { t: translate } = useTranslation();

	return (
		<Table.Thead>
			<Table.Tr>
				{columns.map((col) => {
					if (headerRenderers?.[col]) {
						return (
							<Table.Th key={col}>
								{headerRenderers[col](col, schema)}
							</Table.Th>
						);
					}
					return (
						<Table.Th key={col}>
							{translate(getColumnLabel(schema, col))}
						</Table.Th>
					);
				})}
			</Table.Tr>
		</Table.Thead>
	);
});

export const AutoTable: React.FC<AutoTableProps> = (props) => {
	const { columnAsId = 'id' } = props;
	const defProps = { ...props, columnAsId };

	const validColumns = useMemo(() => {
		const available = getAvailableColumns(props.schema);
		return props.columns.filter((col) => {
			if (props.columnRenderers?.[col]) return true;
			return available.includes(col);
		});
	}, [props.columns, props.schema, props.columnRenderers]);

	const hasColumnSizes = !!props.columnSizes;

	const colWidths = useMemo(() => {
		if (!hasColumnSizes) return {};
		return buildColumnWidths(validColumns, props.columnSizes!);
	}, [validColumns, props.columnSizes, hasColumnSizes]);

	const tableMinWidth = useMemo(() => {
		if (!hasColumnSizes) return undefined;
		return computeTableMinWidth(validColumns, props.columnSizes!);
	}, [validColumns, props.columnSizes, hasColumnSizes]);

	const tableStyle: React.CSSProperties | undefined = hasColumnSizes
		? { tableLayout: 'fixed', width: '100%', minWidth: tableMinWidth }
		: undefined;

	const tableEl = (
		<Table style={tableStyle}>
			{hasColumnSizes && (
				<colgroup>
					{validColumns.map((col) => (
						<col key={col} style={{ width: colWidths[col] }} />
					))}
				</colgroup>
			)}
			<AutoTableHead
				columns={validColumns}
				headerRenderers={props.headerRenderers}
				schema={props.schema}
			/>
			<Table.Tbody>
				{props.isLoading && (
					<Table.Tr>
						<Table.Td colSpan={validColumns.length} className='text-center'>
							<Loader />
						</Table.Td>
					</Table.Tr>
				)}
				{!props.isLoading && props.data.map((row, index) => (
					<Table.Tr key={String(row[defProps.columnAsId!] || index)}>
						{validColumns.map((col) => (
							<Table.Td key={col}>
								{formatCellValue(col, row, defProps)}
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


function formatCellValue(
	fieldName: string,
	rowData: Record<string, unknown>,
	tableProps: AutoTableProps,
): React.ReactNode {
	if (tableProps.columnRenderers?.[fieldName]) {
		return tableProps.columnRenderers[fieldName](rowData);
	}

	const value = rowData[fieldName];
	if (value === null || value === undefined) return '';

	const field = tableProps.schema.fields[fieldName];
	if (field?.type === 'date' && typeof value === 'string') {
		try {
			const date = new Date(value);
			if (!isNaN(date.getTime())) {
				return date.toLocaleDateString();
			}
		}
		catch {
			// If date parsing fails, fall through to default formatting
		}
	}
	else if (tableProps.columnAsLink && fieldName === tableProps.columnAsLink) {
		const id = rowData[tableProps.columnAsId!] as string;
		let href: string;
		if (tableProps.columnAsLinkHref) {
			href = tableProps.columnAsLinkHref(rowData);
		}
		else {
			href = buildDetailHref(id);
		}
		return (
			<Anchor
				component={Link}
				to={href}
			>
				{String(value)}
			</Anchor>
		);
	}

	return String(value);
}

function buildDetailHref(id: string): string {
	return `./${id}`;
}