import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductCategoryCreateForm } from '../../features/productCategory/components';
import { useProductCategoryCreateHandlers } from '../../features/productCategory/hooks';
import categorySchema from '../../schemas/product-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

export const ProductCategoryCreatePageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const { isLoading, onSubmit } = useProductCategoryCreateHandlers();
	const navigate = useNavigate();

	return (
		<PageContainer
			breadcrumbs={[
				{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
				{ title: translate('nikki.inventory.menu.productCategories'), href: '../product-categories' },
				{ title: translate('nikki.inventory.breadcrumbs.createProductCategory'), href: '#' },
			]}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: translate('nikki.general.actions.create'), type: 'submit', form: 'product-category-create-form' },
						{ label: translate('nikki.general.actions.cancel'), variant: 'outline', onClick: () => navigate(-1) },
					]}
				/>,
			]}
		>
			<ProductCategoryCreateForm
				schema={categorySchema as ModelSchema}
				isLoading={isLoading}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const ProductCategoryCreatePage = withWindowTitle(
	'Create Product Category',
	ProductCategoryCreatePageBody,
);

