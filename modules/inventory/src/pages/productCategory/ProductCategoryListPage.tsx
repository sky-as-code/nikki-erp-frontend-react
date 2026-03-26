/* eslint-disable max-lines-per-function */
import {
	Stack,
} from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { JsonToString } from '../../utils/serializer';
import {
	useProductCategoryListHandlers,
	useSearchProductCategories,
} from '../../features/productCategory/hooks';
import productCategorySchema from '../../schemas/product-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

const CATEGORY_SCHEMA = productCategorySchema as ModelSchema;

const COLUMNS = ['name', 'createdAt'];

export const ProductCategoryListPageBody: React.FC = () => {
	const {
		categories,
		isLoading,
		handleOpenCreatePage,
		handleRefresh,
	} = useProductCategoryListHandlers();

	const {
		searchValue,
		setSearchValue,
		searchCategories,
	} = useSearchProductCategories({ categories });

	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Product Categories', href: '#' },
	];

	const tableData = React.useMemo(() => {
		return searchCategories.map((category) => ({
			...category,
			name: JsonToString(category.name),
		}));
	}, [searchCategories]);

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