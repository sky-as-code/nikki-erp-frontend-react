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
import { selectProductCategoryList } from '../../appState';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { JsonToString } from '../../utils/serializer';
import {
	PAGE_SIZE_OPTIONS,
	useProductCategoryListHandlers,
	useProductCategoryListView,
} from '../../features/productCategory/hooks';
import productCategorySchema from '../../schemas/product-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { ProductCategory } from '../../features/productCategory/types';


const CATEGORY_SCHEMA = productCategorySchema as ModelSchema;

const COLUMNS = ['name', 'createdAt'];

const COLUMN_RENDERERS = {
	name: (row: Record<string, unknown>) => JsonToString(row.name),
};

export const ProductCategoryListPageBody: React.FC = () => {
	const listProductCategory = useMicroAppSelector(selectProductCategoryList);
	const {
		handleOpenCreatePage,
		handleRefresh,
	} = useProductCategoryListHandlers();

	const categories = (listProductCategory.data ?? []) as ProductCategory[];
	const isLoading = listProductCategory.status === 'pending';

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
	} = useProductCategoryListView(categories);

	return (
		<Stack gap='md'>
			<Title order={2}>Product Categories</Title>
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
					columnRenderers={COLUMN_RENDERERS}
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

export const ProductCategoryListPage = withWindowTitle('Product Categories', ProductCategoryListPageBody);