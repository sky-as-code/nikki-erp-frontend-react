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

import { selectUnitList } from '../../appState/unit';
import { selectUnitCategoryList } from '../../appState/unitCategory';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import {
	PAGE_SIZE_OPTIONS,
	useUnitListHandlers,
	useUnitListView,
} from '../../features/unit/hooks';
import unitSchema from '../../schemas/unit-schema.json';

import type { Unit } from '../../features/unit/types';
import type { UnitCategory } from '../../features/unitCategory/types';
import type { ModelSchema } from '@nikkierp/ui/model';


const UNIT_SCHEMA = unitSchema as ModelSchema;
const COLUMNS = ['name', 'symbol', 'categoryId'];

export const UnitListPageBody: React.FC = () => {
	const listUnit = useMicroAppSelector(selectUnitList);
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const {
		handleCreate,
		handleRefresh,
	} = useUnitListHandlers();

	const units = (listUnit.data ?? []) as Unit[];
	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const isLoading = listUnit.status === 'pending';

	const {
		searchValue,
		setSearchValue,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedUnits,
		pagedCount,
		filteredCount,
		columnRenderers,
	} = useUnitListView(units, unitCategories);

	return (
		<Stack gap='md'>
			<Title order={2}>Unit Of Measure</Title>
			<ActionBar
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				searchPlaceholder='Search by name, symbol, category'
			/>

			<Paper p='md' withBorder>
				<AutoTable
					schema={UNIT_SCHEMA}
					columns={COLUMNS}
					data={pagedUnits as unknown as Record<string, unknown>[]}
					isLoading={isLoading}
					columnAsLink='name'
					columnRenderers={columnRenderers}
				/>
			</Paper>

			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					Showing {pagedCount} of {filteredCount} unit(s)
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

export const UnitListPage = withWindowTitle('Unit Management', UnitListPageBody);
