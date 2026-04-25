import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';

import { GROUP_SCHEMA_NAME } from '../../../../constants';
import { Group } from '../../types';


interface GroupTableProps {
	groups: Group[];
	isLoading: boolean;
}

export function GroupTable({ groups, isLoading }: GroupTableProps): React.ReactElement {
	return (
		<Paper className='p-4'>
			<AutoTable
				schemaName={GROUP_SCHEMA_NAME}
				columnAsLink='name'
				data={groups}
				isLoading={isLoading}
			/>
		</Paper>
	);
}
