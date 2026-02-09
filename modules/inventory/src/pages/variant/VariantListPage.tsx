import {
	Alert,
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
import { selectVariantList } from '../../appState/variant';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { VariantTable } from '../../features/variant/components';
import { PAGE_SIZE_OPTIONS, useVariantListHandlers, useVariantListView } from '../../features/variant/hooks';

import type { Product } from '../../features/product/types';
import type { Variant } from '../../features/variant/types';

export function VariantListPageBody(): React.ReactNode {
	const { productId } = useParams();
	const isAllScope = !productId;

	const listVariant = useMicroAppSelector(selectVariantList);
	const listProduct = useMicroAppSelector(selectProductList);
	const { handleCreate, handleRefresh } = useVariantListHandlers({
		scope: isAllScope ? 'all' : 'product',
	});

	const variants = (listVariant.data ?? []) as Variant[];
	const products = (listProduct.data ?? []) as Product[];
	const isLoadingList = listVariant.status === 'pending';
	const listError = listVariant.status === 'error'
		? String(listVariant.error ?? 'Failed to load variants')
		: null;

	const {
		searchValue,
		setSearchValue,
		filters,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedVariants,
		pagedCount,
		filteredCount,
		productNameById,
		emptyMessage,
	} = useVariantListView({
		variants,
		products,
		isAllScope,
	});

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='flex-end' wrap='wrap'>
				<Stack gap={2}>
					<Title order={2}>{isAllScope ? 'All Variants' : 'Product Variants'}</Title>
					<Text c='dimmed' size='sm'>
						{isAllScope
							? 'Manage and monitor variants across all products'
							: 'Manage variants for the selected product'}
					</Text>
				</Stack>
				<Badge variant='light' color={isAllScope ? 'indigo' : 'blue'} size='lg'>
					{isAllScope ? 'Scope: All products' : 'Scope: Current product'}
				</Badge>
			</Group>

			<ActionBar
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				searchPlaceholder={isAllScope ? 'Search by name, SKU, barcode, product' : 'Search by name, SKU, barcode'}
				filters={filters}
			/>
			
			<VariantTable
				variants={pagedVariants}
				productNameById={isAllScope ? productNameById : undefined}
				getVariantDetailLink={
					isAllScope
						? (variant) => `../products/${variant.productId}/variants/${variant.id}`
						: undefined
				}
				emptyMessage={isLoadingList ? 'Loading variants...' : emptyMessage}
			/>

			<Group justify='space-between' wrap='wrap'>
				<Text size='sm' c='dimmed'>
					{isLoadingList
						? 'Loading variants...'
						: `Showing ${pagedCount} of ${filteredCount} variant(s)`
					}
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

export const VariantListPage: React.FC = withWindowTitle('Variant List', VariantListPageBody);
