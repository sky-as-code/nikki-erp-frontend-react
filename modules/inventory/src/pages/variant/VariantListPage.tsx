import {
	Stack,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantTable } from '../../features/variant/components';
import { useVariantListHandlers, useSearchVariants } from '../../features/variant/hooks';

export function VariantListPageBody(): React.ReactNode {
	const { 
		handleCreate, 
		handleRefresh, 
		isLoading, 
		variants,
	} = useVariantListHandlers();

	const {
		searchValue,
		setSearchValue,
		searchVariants,
	} = useSearchVariants({variants});

	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Variants', href: '#' },
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
						placeholder: 'Search by name, SKU, barcode, product',
					}}
				/>,
			]}
		>
			<Stack gap='md'>
				<VariantTable
					variants={searchVariants}
					getVariantDetailLink={(variant) => `../products/${variant.productId}/variants/${variant.id}`}
				/>

			</Stack>
		</PageContainer>
	);
}

export const VariantListPage: React.FC = withWindowTitle('Variant List', VariantListPageBody);
