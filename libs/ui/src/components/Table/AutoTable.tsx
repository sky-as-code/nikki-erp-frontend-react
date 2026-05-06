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

export type AutoTableProps = React.ComponentProps<typeof Table> & {
	columns: string[];
	columnAsLink?: string;
	columnAsLinkHref?: (rowData: any) => string;
	columnAsId?: string;
	columnRenderers?: Record<string, (row: Record<string, unknown>) => React.ReactNode>;
	headerRenderers?: Record<string, (columnName: string) => React.ReactNode>;
	data: Record<string, unknown>[];
	isLoading?: boolean;
	schema: ModelSchema;
	theadProps?: React.ComponentProps<typeof Table.Thead>;
};


const AutoTableHead: React.FC<{
	columns: string[];
	renderers?: Record<string, (columnName: string) => React.ReactNode>;
	schema: ModelSchema;
	theadProps?: React.ComponentProps<typeof Table.Thead>;
}> = React.memo(({ columns, renderers, schema, theadProps }) => {
	const { t: translate } = useTranslation();

	return (
		<Table.Thead {...theadProps}>
			<Table.Tr>
				{columns.map((col) => {
					if (renderers?.[col]) {
						return (
							<Table.Th key={col}>
								{renderers[col](col)}
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

export const AutoTable: React.FC<AutoTableProps> = ({
	columnAsId = 'id',
	columns,
	columnAsLink,
	columnAsLinkHref,
	columnRenderers,
	headerRenderers,
	isLoading,
	data,
	schema,
	theadProps,
	...tableProps
}) => {

	const validColumns = useMemo(() => {
		const available = getAvailableColumns(schema);
		return columns.filter((col) => {
			if (columnRenderers?.[col]) return true;
			return available.includes(col);
		});
	}, [columns, schema, columnRenderers]);

	const tableEl = (
		<Table {...tableProps}>
			<AutoTableHead
				columns={validColumns}
				renderers={headerRenderers}
				schema={schema}
				theadProps={theadProps}
			/>
			<Table.Tbody>
				{isLoading && (
					<Table.Tr>
						<Table.Td colSpan={validColumns.length} className='text-center'>
							<Loader />
						</Table.Td>
					</Table.Tr>
				)}
				{!isLoading && data.map((row, index) => (
					<Table.Tr key={String(row[columnAsId!] || index)}>
						{validColumns.map((col) => (
							<Table.Td key={col}>
								{formatCellValue(col, row, {
									columnAsId,
									columnAsLink,
									columnAsLinkHref,
									columnRenderers,
									schema,
								})}
							</Table.Td>
						))}
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
	return tableEl;
};


function formatCellValue(
	fieldName: string,
	rowData: Record<string, unknown>,
	tableProps: Pick<AutoTableProps, 'columnRenderers' | 'schema' | 'columnAsLink' | 'columnAsLinkHref' | 'columnAsId'>,
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