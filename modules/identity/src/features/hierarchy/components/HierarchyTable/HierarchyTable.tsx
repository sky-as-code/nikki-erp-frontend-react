import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';

import { ORG_UNIT_SCHEMA_NAME } from '../../../../constants';
import { HierarchyLevel } from '../../types';


interface HierarchyTableProps {
	hierarchies: HierarchyLevel[];
	isLoading: boolean;
}

export function HierarchyTable({ hierarchies, isLoading }: HierarchyTableProps): React.ReactElement {
	return (
		<Paper className='p-4'>
			<AutoTable
				schemaName={ORG_UNIT_SCHEMA_NAME}
				columnAsLink='name'
				data={hierarchies}
				isLoading={isLoading}
			/>
		</Paper>
	);
}
