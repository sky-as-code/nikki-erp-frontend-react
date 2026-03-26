import { Group, Stack, Text, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductCreateForm } from '../../features/product/components';
import { useProductCreateHandlers } from '../../features/product/hooks/useProductCreate';


export const ProductCreatePageBody: React.FC = () => {
	const { isLoading, units, onSubmit } = useProductCreateHandlers();
	const navigate = useNavigate();
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '../products' },
		{ title: 'Create Product', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Create', type: 'submit', form: 'product-create-form' },
						{ label: 'Cancel', variant: 'outline', onClick: () => navigate(-1) },
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
