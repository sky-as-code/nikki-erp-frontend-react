import { Pagination, Select, Stack, Text } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';

import { selectProductList } from '../../appState/product';
import { selectUnitList } from '../../appState/unit';
import { selectVariantList, variantActions } from '../../appState/variant';
import { ControlPanel, type ControlPanelFilterConfig } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductTable } from '../../features/product/components';
import { PAGE_SIZE_OPTIONS, useProductListHandlers, useProductListView } from '../../features/product/hooks';
import { useUnitListHandlers } from '../../features/unit/hooks';
import productSchema from '../../schemas/product-schema.json';

import type { InventoryDispatch } from '../../appState';
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
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id;

	const listProduct = useMicroAppSelector(selectProductList);
	const listUnits = useMicroAppSelector(selectUnitList);
	const listVariants = useMicroAppSelector(selectVariantList);
	const {
		handleCreate,
		handleRefresh,
	} = useProductListHandlers();
	useUnitListHandlers();

	const products = (listProduct.data ?? []) as Product[];
	const units = listUnits.data ?? [];
	const variants = listVariants.data ?? [];

	const {
		searchValue,
		setSearchValue,
		filters,
		tableRows,
	} = useProductListView(products);

	React.useEffect(() => {
		if (orgId) {
			dispatch(variantActions.listAllVariants(orgId));
		}
	}, [dispatch, orgId]);

	const isLoading = listProduct.status === 'pending';
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
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
					units={units}
					variants={variants}
				/>
			</Stack>
		</PageContainer>
	);
}

export const ProductListPage: React.FC = withWindowTitle('Product Management', ProductListPageBody);
