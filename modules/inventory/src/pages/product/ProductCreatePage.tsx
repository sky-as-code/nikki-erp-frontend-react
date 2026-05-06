import { Group, Stack, Text, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductCreateForm } from '../../features/product/components';
import { useProductCreateHandlers } from '../../features/product/hooks/useProductCreate';


export const ProductCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const { isLoading, units, onSubmit } = useProductCreateHandlers();
	const navigate = useNavigate();
	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.products'), href: '../products' },
		{ title: t('nikki.inventory.breadcrumbs.createProduct'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: t('nikki.general.actions.create'), type: 'submit', form: 'product-create-form' },
						{ label: t('nikki.general.actions.cancel'), variant: 'outline', onClick: () => navigate(-1) },
					]}
				/>,
			]}
		>
			<ProductCreateForm
				isLoading={isLoading}
				units={units}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const ProductCreatePage = withWindowTitle('Create Product', ProductCreatePageBody);
