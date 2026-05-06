/* eslint-disable max-lines-per-function */
import {
	Stack,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectUnitCategoryList } from '../../appState/unitCategory';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { useUnitCategoryListHandlers, useUnitCategoryListView } from '../../features/unitCategory/hooks';
import { UnitCategoryTable } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { UnitCategory } from '../../features/unitCategory/types';
import type { ModelSchema } from '@nikkierp/ui/model';


const COLUMNS = ['name', 'createdAt', 'updatedAt'];

export const UnitCategoryListPageBody: React.FC = () => {
	const { t } = useTranslation();
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const {
		handleOpenCreatePage,
		handleRefresh,
	} = useUnitCategoryListHandlers();

	const categories = (listUnitCategory.data ?? []) as UnitCategory[];
	const isLoading = listUnitCategory.status === 'pending';

	const {
		searchValue,
		setSearchValue,
		pagedCategories,
	} = useUnitCategoryListView(categories);

	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.unitCategories'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={[
						{ label: t('nikki.general.actions.create'), onClick: handleOpenCreatePage },
						{ label: t('nikki.general.actions.refresh'), onClick: handleRefresh, variant: 'outline' },
					]}
					search={{
						value: searchValue,
						onChange: setSearchValue,
						placeholder: t('nikki.inventory.unitCategory.searchPlaceholder'),
					}}
				/>,
			]}
		>
			<Stack gap='md'>
				<UnitCategoryTable
					schema={categorySchema as ModelSchema}
					columns={COLUMNS}
					categories={pagedCategories as UnitCategory[]}
					isLoading={isLoading}
				/>
			</Stack>
		</PageContainer>
	);
};

export const UnitCategoryListPage = withWindowTitle('Unit Categories', UnitCategoryListPageBody);

