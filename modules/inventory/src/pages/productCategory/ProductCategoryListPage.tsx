/* eslint-disable max-lines-per-function */
import {
	Stack,
} from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
	const { t: translate } = useTranslation();
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
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: translate('nikki.inventory.menu.productCategories'), href: '#' },
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
						{ label: translate('nikki.general.actions.create'), onClick: handleOpenCreatePage },
						{ label: translate('nikki.general.actions.refresh'), onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: translate('nikki.inventory.productCategory.searchPlaceholder'),
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