import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { Group } from '../../types';


interface GroupTableProps {
	columns: string[];
	groups: Group[];
	isLoading: boolean;
	schema: ModelSchema;
}

export function GroupTable({ columns, groups, isLoading, schema }: GroupTableProps): React.ReactElement {
	return (
		<Paper className='p-4'>
			<AutoTable
				columns={columns}
				columnAsLink='name'
				data={groups}
				schema={schema}
				isLoading={isLoading}
			/>
		</Paper>
	);
}
