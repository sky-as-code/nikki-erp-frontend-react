import { Anchor, Loader, Table } from '@mantine/core';
import { useMemo } from 'react';
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

export type AutoTableProps = {
	columns: string[];
	columnAsLink?: string;
	columnAsLinkHref?: (rowData: any) => string;
	columnAsId?: string;
	columnRenderers?: Record<string, (row: Record<string, unknown>) => React.ReactNode>;
	headerRenderers?: Record<string, (columnName: string, schema: ModelSchema) => React.ReactNode>;
	data: Record<string, unknown>[];
	isLoading?: boolean;
	schema: ModelSchema;
};

export const AutoTable: React.FC<AutoTableProps> = (props) => {
	const { t: translate } = useTranslation();
	const {
		columnAsId = 'id',
	} = props;
	const defProps = {
		...props,
		columnAsId,
	};
	const validColumns = useMemo(() => {
		const available = getAvailableColumns(props.schema);
		return props.columns.filter((col) => {
			// Allow columns that have custom renderers even if not in schema
			if (props.columnRenderers?.[col]) {
				return true;
			}
			return available.includes(col);
		});
	}, [props.columns, props.schema, props.columnRenderers]);

	return (
		<Table>
			<Table.Thead>
				<Table.Tr>
					{validColumns.map((col) => {
						if (props.headerRenderers?.[col]) {
							return <Table.Th key={col}>{props.headerRenderers[col](col, props.schema)}</Table.Th>;
						}
						return (
							<Table.Th key={col}>{translate(getColumnLabel(props.schema, col))}</Table.Th>
						);
					})}
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{props.isLoading && (<>
					<Table.Tr>
						<Table.Td colSpan={validColumns.length} className='text-center'>
							<Loader />
						</Table.Td>
					</Table.Tr>
				</>)}
				{!props.isLoading && props.data.map((row, index) => {
					return (
						<Table.Tr key={String(row[defProps.columnAsId!] || index)}>
							{validColumns.map((col) => {
								return (
									<Table.Td key={col}>{formatCellValue(col, row, defProps)}</Table.Td>
								);
							})}
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
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