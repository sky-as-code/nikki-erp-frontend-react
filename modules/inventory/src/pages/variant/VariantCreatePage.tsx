import { Stack, Title } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { VariantCreateForm } from '../../features/variant/components';
import { useVariantCreateHandlers } from '../../features/variant/hooks/useVariantCreate';
import variantSchema from '../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


export const VariantCreatePageBody: React.FC = () => {
	const schema = variantSchema as ModelSchema;
	const { t } = useTranslation();

	const { isLoading, onSubmit } = useVariantCreateHandlers();

	return (
		<Stack gap='md'>
			<Title order={2}>{t('nikki.inventory.variant.actions.createNew')}</Title>
			<VariantCreateForm
				schema={schema}
				isLoading={isLoading}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

export const VariantCreatePage = withWindowTitle('Create Variant', VariantCreatePageBody);
