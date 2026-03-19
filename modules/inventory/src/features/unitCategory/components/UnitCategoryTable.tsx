import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { JsonToString } from '../../../utils/serializer';
import type { UnitCategory } from '../types';

interface UnitCategoryTableProps {
	categories: UnitCategory[];
	isLoading: boolean;
	schema: ModelSchema;
	columns: string[];
}

export function UnitCategoryTable({
	categories,
	isLoading,
	schema,
	columns,
}: UnitCategoryTableProps): React.ReactElement {
	const tableData = React.useMemo(() => {
		return categories.map((category) => ({
			...category,
			name: JsonToString(category.name),
		}));
	}, [categories]);

	return (
		<Paper p='md' withBorder>
			<AutoTable
				schema={schema}
				columns={columns}
				data={tableData as unknown as Record<string, unknown>[]}
				isLoading={isLoading}
				columnAsLink='name'
			/>
		</Paper>
	);
}
