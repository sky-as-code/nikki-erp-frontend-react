import { Table } from '@mantine/core';
import { useMemo } from 'react';

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

function formatCellValue(value: unknown, schema: ModelSchema, fieldName: string): string {
	if (value === null || value === undefined) return '';

	const field = schema.fields[fieldName];
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

	return String(value);
}

export const AutoTable: React.FC<{
	columns: string[];
	data: Record<string, unknown>[];
	schema: ModelSchema;
}> = ({ columns, data, schema }) => {
	const validColumns = useMemo(() => {
		const available = getAvailableColumns(schema);
		return columns.filter((col) => available.includes(col));
	}, [columns, schema]);

	const rows = data.map((row, index) => (
		<Table.Tr key={index}>
			{validColumns.map((col) => (
				<Table.Td key={col}>{formatCellValue(row[col], schema, col)}</Table.Td>
			))}
		</Table.Tr>
	));

	return (
		<Table>
			<Table.Thead>
				<Table.Tr>
					{validColumns.map((col) => (
						<Table.Th key={col}>{getColumnLabel(schema, col)}</Table.Th>
					))}
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{rows}</Table.Tbody>
		</Table>
	);
};
