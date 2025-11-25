import { Paper, Stack } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { HierarchyLevel } from '../../types';


interface HierarchyTableProps {
	columns: string[];
	hierarchies: HierarchyLevel[];
	isLoading: boolean;
	schema: ModelSchema;
}

export function HierarchyTable({ columns, hierarchies, isLoading, schema }: HierarchyTableProps): React.ReactElement {
	return (
		<Stack gap='md'>
			<AutoTable
				columns={columns}
				columnAsLink='name'
				data={hierarchies}
				schema={schema}
				isLoading={isLoading}
			/>
		</Stack>
	);
}
