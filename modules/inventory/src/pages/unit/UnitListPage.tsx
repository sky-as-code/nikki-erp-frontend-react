import {
	Group,
	Stack,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { selectUnitList } from '../../appState/unit';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { useUnitListHandlers } from '../../features/unit/hooks';
import { UnitTable } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

const COLUMNS = ['name', 'symbol', 'baseUnit', 'multiplier', 'createdAt'];

export const UnitListPageBody: React.FC = () => {
	const listUnit = useMicroAppSelector(selectUnitList);
	const {
		handleCreate,
		handleRefresh,
	} = useUnitListHandlers();

	return (
		<Stack gap='md'>
			<Group>
				<Title order={2}>Unit Of Measure</Title>
			</Group>
			<ActionBar
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				searchValue=''
				onSearchChange={() => {}}
			/>
			<UnitTable
				schema={unitSchema as ModelSchema}
				columns={COLUMNS}
				units={listUnit.data}
				isLoading={listUnit.status === 'pending'}
			/>
		</Stack>
	);
};

export const UnitListPage = withWindowTitle('Unit Management', UnitListPageBody);
