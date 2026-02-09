import {
	Badge,
	Group,
	Pagination,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useParams } from 'react-router';

import { selectProductList } from '../../appState/product';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { ProductTable } from '../../features/product/components';
import { PAGE_SIZE_OPTIONS, useProductListHandlers, useProductListView } from '../../features/product/hooks';
import productSchema from '../../schemas/product-schema.json';

import type { Product } from '../../features/product/types';
import type { ModelSchema } from '@nikkierp/ui/model';


const COLUMNS = [
	'name',
	'description',
	'sku',
	'status',
	'createdAt',
];

export function ProductListPageBody(): React.ReactNode {
	const schema = productSchema as ModelSchema;
	const { categoryId } = useParams<{ categoryId?: string }>();
	const listProduct = useMicroAppSelector(selectProductList);
	const {
		handleCreate,
		handleRefresh,
		handleClearCategoryFilter,
		handleViewDetail,
	} = useProductListHandlers(categoryId);

	const isLoadingList = listProduct.status === 'pending';

	const products = (listProduct.data ?? []) as Product[];
	const {
		searchValue,
		setSearchValue,
		filters,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		tableRows,
		pagedCount,
		filteredCount,
	} = useProductListView(products);

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='center'>
				<Group align='center'>
					<Title order={2}>Product Management</Title>
					{categoryId && (
						<Badge
							size='lg'
							color='blue'
							variant='light'
							style={{ cursor: 'pointer' }}
							onClick={handleClearCategoryFilter}
						>
							Category: {categoryId} ✕
						</Badge>
					)}
				</Group>
			</Group>
			<ActionBar
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				searchPlaceholder='Search by name, SKU, barcode'
				filters={filters}
			/>

			{isLoadingList && <Text c='dimmed'>Loading products...</Text>}

			<ProductTable
				columns={COLUMNS}
				data={tableRows}
				schema={schema}
				isLoading={isLoadingList}
				onViewDetail={handleViewDetail}
			/>

			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					Showing {pagedCount} of {filteredCount} product(s)
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
}

export const ProductListPage: React.FC = withWindowTitle('Product Management', ProductListPageBody);
