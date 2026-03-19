import { Breadcrumbs, Group, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';

import { selectProductList } from '../../appState/product';
import { selectUnitList } from '../../appState/unit';
import { selectVariantList, variantActions } from '../../appState/variant';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { ProductTable } from '../../features/product/components';
import { useProductListHandlers } from '../../features/product/hooks';
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
	const orgId = activeOrg?.id ?? 'org-1';

	const listProduct = useMicroAppSelector(selectProductList);
	const listUnits = useMicroAppSelector(selectUnitList);
	const listVariants = useMicroAppSelector(selectVariantList);
	const {
		handleCreate,
		handleRefresh,
	} = useProductListHandlers();
	useUnitListHandlers();

	React.useEffect(() => {
		dispatch(variantActions.listAllVariants(orgId));
	}, [dispatch, orgId]);

	const isLoading = listProduct.status === 'pending';
	const products = (listProduct.data ?? []) as Product[];
	const units = listUnits.data ?? [];
	const variants = listVariants.data ?? [];

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>Product Management</h4>
					</Typography>
				</Breadcrumbs>
			</Group>
			<ActionBar
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				searchValue=''
				onSearchChange={() => {}}
			/>
			<ProductTable
				columns={COLUMNS}
				products={products}
				isLoading={isLoading}
				schema={productSchema as ModelSchema}
				units={units}
				variants={variants}
			/>
		</Stack>
	);
}

export const ProductListPage: React.FC = withWindowTitle('Product Management', ProductListPageBody);
