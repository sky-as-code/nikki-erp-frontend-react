import { Text } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';
import { DetailControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { selectVariantDetail } from '../../appState/variant';
import { VariantDetailForm } from '../../features/variant/components/VariantDetailForm';
import { useVariantDetailHandlers } from '../../features/variant/hooks/useVariantDetail';
import variantSchema from '../../schemas/variant-schema.json';
import { JsonToString } from '../../utils/serializer';

import type { ModelSchema } from '@nikkierp/ui/model';
import { selectProductDetail } from '../../appState/product';


export const VariantDetailPageBody: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const variantDetail = useMicroAppSelector(selectVariantDetail);
	const productDetail = useMicroAppSelector(selectProductDetail);
	const { isLoadingDetail, handleUpdate, handleDelete } = useVariantDetailHandlers();

	const formRef = useRef<{ submit: () => void; triggerDelete: () => void } | null>(null);
	const variant = variantDetail?.data;

	const breadcrumbs = [
		{ title: 'Inventory', href: '..' },
		{ title: 'Products', href: '../products' },
		{ title: productDetail?.data?.name ? JsonToString(productDetail.data.name) : 'Product Detail', href: `../products/${productDetail?.data?.id}` },
		{ title: 'Variants', href: '../product-variants' },
		{ title: variant?.name ? JsonToString(variant.name) : 'Variant', href: '#' },
	];

	const handleSave = () => {
		formRef.current?.submit();
	};

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleDeleteClick = () => {
		formRef.current?.triggerDelete();
	};

	if (isLoadingDetail && !variant) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
				isLoading
			/>
		);
	}

	if (!variant) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{t('nikki.general.messages.notFound')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<DetailActionBar
					onSave={handleSave}
					onGoBack={handleGoBack}
					onDelete={handleDeleteClick}
				/>,
			]}
		>
			<VariantDetailForm
				schema={variantSchema as ModelSchema}
				variantDetail={variant}
				isLoading={isLoadingDetail}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
				formRef={formRef}
			/>
		</PageContainer>
	);
};

export const VariantDetailPage: React.FC = withWindowTitle('Variant Detail', VariantDetailPageBody);
