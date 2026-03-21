import {
	Alert,
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

import { selectProductList } from '../../appState/product';
import { selectVariantList } from '../../appState/variant';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantTable } from '../../features/variant/components';
import { PAGE_SIZE_OPTIONS, useVariantListHandlers, useVariantListView } from '../../features/variant/hooks';

import type { Product } from '../../features/product/types';
import type { Variant } from '../../features/variant/types';

export function VariantListPageBody(): React.ReactNode {
	const listVariant = useMicroAppSelector(selectVariantList);
	const listProduct = useMicroAppSelector(selectProductList);
	const { handleCreate, handleRefresh } = useVariantListHandlers({
		scope: 'all',
	});

	const variants = (listVariant.data ?? []) as Variant[];
	const products = (listProduct.data ?? []) as Product[];
	const isLoadingList = listVariant.status === 'pending';
	const listError = listVariant.status === 'error'
		? String(listVariant.error ?? 'Failed to load variants')
		: null;
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Variants', href: '#' },
	];

	const {
		searchValue,
		setSearchValue,
		filters,
		pagedVariants,
		productNameById,
		emptyMessage,
	} = useVariantListView({
		variants,
		products,
		isAllScope: true,
	});

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
						placeholder: 'Search by name, SKU, barcode, product',
					}}
					filters={filters}
				/>,
			]}
		>
			<Stack gap='md'>
				{listError && (
					<Alert color='red' variant='light'>
						{listError}
					</Alert>
				)}

				<VariantTable
					variants={pagedVariants}
					productNameById={productNameById}
					getVariantDetailLink={(variant) => `../products/${variant.productId}/variants/${variant.id}`}
					emptyMessage={isLoadingList ? 'Loading variants...' : emptyMessage}
				/>

			</Stack>
		</PageContainer>
	);
}

export const VariantListPage: React.FC = withWindowTitle('Variant List', VariantListPageBody);
