import { Group, Stack, Text, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantCreateForm } from '../../features/variant/components';
import { useVariantCreateHandlers } from '../../features/variant/hooks/useVariantCreate';
import variantSchema from '../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


export const VariantCreatePageBody: React.FC = () => {
	const schema = variantSchema as ModelSchema;
	const { t } = useTranslation();
	const navigate = useNavigate();

	const { isLoading, onSubmit } = useVariantCreateHandlers();
	const breadcrumbs = [
		{ title: t('nikki.inventory.product.title'), href: '../products' },
		{ title: t('nikki.inventory.variant.title'), href: '../variants' },
		{ title: t('nikki.inventory.variant.actions.createNew'), href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Create', type: 'submit'},
						{ label: 'Cancel', variant: 'outline', onClick: () => navigate(-1) },
					]}
				/>,
			]}
		>
			<VariantCreateForm
				schema={schema}
				isLoading={isLoading}
				onSubmit={onSubmit}
			/>
		</PageContainer>
	);
};

export const VariantCreatePage = withWindowTitle('Create Variant', VariantCreatePageBody);
