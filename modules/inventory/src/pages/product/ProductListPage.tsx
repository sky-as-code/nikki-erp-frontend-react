import { Pagination, Select, Stack, Text } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { selectProductList } from '../../appState/product';
import { selectVariantList } from '../../appState/variant';
import { ControlPanel, type ControlPanelFilterConfig } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductTable } from '../../features/product/components';
import { useProductListHandlers, useProductListView } from '../../features/product/hooks';
import productSchema from '../../schemas/product-schema.json';
import type { Product } from '../../features/product/types';

const COLUMNS = [
	'name',
	'description',
	'sku',
	'proposedPrice',
	'unitId',
	'status',
	'createdAt',
];

export function ProductListPageBody(): React.ReactElement {
	const listProduct = useMicroAppSelector(selectProductList);
	const listVariants = useMicroAppSelector(selectVariantList);
	const {
		handleCreate,
		handleRefresh,
	} = useProductListHandlers();

	const products = (listProduct.data ?? []) as Product[];
	const variants = listVariants.data ?? [];

	const {
		searchValue,
		setSearchValue,
		filters,
		tableRows,
	} = useProductListView(products);

	const isLoading = listProduct.status === 'pending' || listVariants.status === 'pending';
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoading}
			sections={[
				<ControlPanel
					actions={[
						{ label: 'Create', onClick: handleCreate },
						{ label: 'Refresh', onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: 'Search by name, SKU, barcode',
					}}
					filters={filters as ControlPanelFilterConfig[]}
				/>,
				]}
		>
			<Stack gap='md'>
				<ProductTable
					columns={COLUMNS}
					products={tableRows as unknown as Product[]}
					isLoading={isLoading}
					schema={productSchema as ModelSchema}
					variants={variants}
				/>
			</Stack>
		</PageContainer>
	);
}

export const ProductListPage: React.FC = withWindowTitle('Product Management', ProductListPageBody);
