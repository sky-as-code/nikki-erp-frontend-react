import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantCreateForm } from '../../features/variant/components';
import { useVariantCreateHandlers } from '../../features/variant/hooks/useVariantCreate';
import variantSchema from '../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { JsonToString } from '../../utils/serializer';


export const VariantCreatePageBody: React.FC = () => {
	const { t } = useTranslation();
	const { 
		isLoading, 
		handleCancel, 
		handleCreate, 
		products, 
		productId 
	} = useVariantCreateHandlers();

	const breadcrumbs = productId
		? [
				{ title: t('nikki.inventory.breadcrumbs.home'), href: '../' },
				{ title: t('nikki.inventory.menu.products'), href: '../products' },
				{ title: JsonToString(products.find(p => p.id === productId)?.name), href: `../products/${productId}` },
				{ title: t('nikki.inventory.menu.variants'), href: '#' },
				{ title: t('nikki.inventory.breadcrumbs.createVariant'), href: '#' },
		  ]
		: [
				{ title: t('nikki.inventory.breadcrumbs.home'), href: '../' },
				{ title: t('nikki.inventory.menu.variants'), href: '..' },
				{ title: t('nikki.inventory.breadcrumbs.createVariant'), href: '#' },
		  ];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoading}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: t('nikki.general.actions.create'), type: 'submit' as const, form: 'variant-create-form' as const },
						{ label: t('nikki.general.actions.cancel'), variant: 'outline', onClick: handleCancel },
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
