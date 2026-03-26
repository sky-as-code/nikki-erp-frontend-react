import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantCreateForm } from '../../features/variant/components';
import { useVariantCreateHandlers } from '../../features/variant/hooks/useVariantCreate';
import variantSchema from '../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { JsonToString } from '../../utils/serializer';


export const VariantCreatePageBody: React.FC = () => {
	const { 
		isLoading, 
		handleCancel, 
		handleCreate, 
		products, 
		productId 
	} = useVariantCreateHandlers();

	const breadcrumbs = productId
		? [
				{ title: 'Inventory', href: '../' },
				{ title: 'Products', href: '../products' },
				{ title: JsonToString(products.find(p => p.id === productId)?.name), href: `../products/${productId}` },
				{ title: 'Variants', href: '#' },
				{ title: 'Create Variant', href: '#' },
		  ]
		: [
				{ title: 'Inventory', href: '../' },
				{ title: 'Variants', href: '..' },
				{ title: 'Create Variant', href: '#' },
		  ];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoading}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Create', type: 'submit' as const, form: 'variant-create-form' as const },
						{ label: 'Cancel', variant: 'outline', onClick: handleCancel },
					]}
				/>,
			]}
		>
			<Stack gap='md'>
				<VariantCreateForm
					schema={variantSchema as ModelSchema}
					isLoading={isLoading}
					productId={productId}
					products={products}
					onSubmit={handleCreate}
				/>
			</Stack>
		</PageContainer>
	);
};

export const VariantCreatePage = withWindowTitle('Create Variant', VariantCreatePageBody);
