import { Breadcrumbs, Stack, Typography } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { selectVariantDetail } from '../../appState/variant';
import { VariantDetailForm } from '../../features/variant/components';
import { useVariantDetailHandlers } from '../../features/variant/hooks/useVariantDetail';
import variantSchema from '../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


export const VariantDetailPageBody: React.FC = () => {
	const { productId } = useParams();
	const variantDetail = useMicroAppSelector(selectVariantDetail);
	const schema = variantSchema as ModelSchema;
	const { t } = useTranslation();

	const { isLoadingDetail, handleUpdate, handleDelete } = useVariantDetailHandlers();

	const variantData = variantDetail?.data
		? { ...variantDetail.data }
		: undefined;

	return (
		<Stack gap='md'>
			<Breadcrumbs>
				<Typography>
					<Link to='../..'>{t('nikki.inventory.product.title')}</Link>
				</Typography>
				<Typography>
					<Link to='..'>{t('nikki.inventory.variant.title')}</Link>
				</Typography>
			</Breadcrumbs>
			<VariantDetailForm
				schema={schema}
				variantDetail={variantData as Record<string, unknown>}
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
		</Stack>
	);
};

export const VariantDetailPage: React.FC = withWindowTitle('Variant Detail', VariantDetailPageBody);
