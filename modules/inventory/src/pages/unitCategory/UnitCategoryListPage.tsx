/* eslint-disable max-lines-per-function */
import {
	Group,
	Pagination,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { selectUnitCategoryList } from '../../appState/unitCategory';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import {
	PAGE_SIZE_OPTIONS,
	useUnitCategoryListHandlers,
	useUnitCategoryListView,
} from '../../features/unitCategory/hooks';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { UnitCategory } from '../../features/unitCategory/types';
import type { ModelSchema } from '@nikkierp/ui/model';


const CATEGORY_SCHEMA = categorySchema as ModelSchema;

const COLUMNS = ['name', 'createdAt'];

export const UnitCategoryListPageBody: React.FC = () => {
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const {
		handleOpenCreatePage,
		handleRefresh,
	} = useUnitCategoryListHandlers();

	const categories = (listUnitCategory.data ?? []) as UnitCategory[];
	const isLoading = listUnitCategory.status === 'pending';

	const {
		searchValue,
		setSearchValue,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedCategories,
		filteredCount,
		pagedCount,
	} = useUnitCategoryListView(categories);

	return (
		<Stack gap='md'>
			<Title order={2}>Unit Categories</Title>
			<ActionBar
				onCreate={handleOpenCreatePage}
				onRefresh={handleRefresh}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				searchPlaceholder='Search by category name'
			/>

			<Paper p='md' withBorder>
				<AutoTable
					schema={CATEGORY_SCHEMA}
					columns={COLUMNS}
					data={pagedCategories as unknown as Record<string, unknown>[]}
					isLoading={isLoading}
					columnAsLink='name'
				/>
			</Paper>

			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					Showing {pagedCount} of {filteredCount} categor{filteredCount === 1 ? 'y' : 'ies'}
				</Text>
				<Group>
					<Select
						w={120}
						data={PAGE_SIZE_OPTIONS}
						value={String(pageSize)}
						onChange={handlePageSizeChange}
					/>
					<Pagination
						total={totalPages}
						value={page}
						onChange={setPage}
					/>
				</Group>
			</Group>
		</Stack>
	);
};

export const UnitCategoryListPage = withWindowTitle('Unit Categories', UnitCategoryListPageBody);
