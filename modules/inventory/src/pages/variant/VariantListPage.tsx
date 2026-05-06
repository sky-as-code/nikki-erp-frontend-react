import {
	Stack,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantTable } from '../../features/variant/components';
import { useVariantListHandlers, useSearchVariants } from '../../features/variant/hooks';

export function VariantListPageBody(): React.ReactNode {
	const { t } = useTranslation();
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
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.variants'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoading}
			sections={[
				<ControlPanel
					actions={[
						{ label: t('nikki.general.actions.create'), onClick: handleCreate },
						{ label: t('nikki.general.actions.refresh'), onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: t('nikki.inventory.variant.searchPlaceholder'),
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
