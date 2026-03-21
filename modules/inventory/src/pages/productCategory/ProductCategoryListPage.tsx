/* eslint-disable max-lines-per-function */
import {
	Group,
	Pagination,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { selectProductCategoryList } from '../../appState';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
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

export const ProductCategoryListPageBody: React.FC = () => {
	const listProductCategory = useMicroAppSelector(selectProductCategoryList);
	const {
		handleOpenCreatePage,
		handleRefresh,
	} = useProductCategoryListHandlers();

	const categories = (listProductCategory.data ?? []) as ProductCategory[];
	const isLoading = listProductCategory.status === 'pending';
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Product Categories', href: '#' },
	];

	const {
		searchValue,
		setSearchValue,
		pagedCategories,
	} = useProductCategoryListView(categories);

	const tableData = React.useMemo(() => {
		return pagedCategories.map((category) => ({
			...category,
			name: JsonToString(category.name),
		}));
	}, [pagedCategories]);

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={[
						{ label: 'Create', onClick: handleOpenCreatePage },
						{ label: 'Refresh', onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: 'Search by category name',
					}}
				/>,
			]}
		>
			<Stack gap='md'>
				<AutoTable
					schema={CATEGORY_SCHEMA}
					columns={COLUMNS}
					data={tableData as unknown as Record<string, unknown>[]}
					isLoading={isLoading}
					columnAsLink='name'
				/>
			</Stack>
		</PageContainer>
	);
};

export const ProductCategoryListPage = withWindowTitle('Product Categories', ProductCategoryListPageBody);