/* eslint-disable max-lines-per-function */
import {
	Group,
	Stack,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { selectUnitCategoryList } from '../../appState/unitCategory';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { useUnitCategoryListHandlers } from '../../features/unitCategory/hooks';
import { UnitCategoryTable } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { UnitCategory } from '../../features/unitCategory/types';
import type { ModelSchema } from '@nikkierp/ui/model';


const COLUMNS = ['name', 'createdAt', 'updatedAt'];

export const UnitCategoryListPageBody: React.FC = () => {
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const {
		handleOpenCreatePage,
		handleRefresh,
	} = useUnitCategoryListHandlers();

	const categories = (listUnitCategory.data ?? []) as UnitCategory[];
	const isLoading = listUnitCategory.status === 'pending';

	return (
		<Stack gap='md'>
			<Group>
				<Title order={2}>Unit Categories</Title>
			</Group>
			<ActionBar
				onCreate={handleOpenCreatePage}
				onRefresh={handleRefresh}
				searchValue=''
				onSearchChange={() => {}}
			/>
			<UnitCategoryTable
				schema={categorySchema as ModelSchema}
				columns={COLUMNS}
				categories={categories}
				isLoading={isLoading}
			/>
		</Stack>
	);
};

export const UnitCategoryListPage = withWindowTitle('Unit Categories', UnitCategoryListPageBody);
