import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantDetailForm } from '../../features/variant/components/VariantDetailForm';
import { useVariantDetailHandlers } from '../../features/variant/hooks/useVariantDetail';
import variantSchema from '../../schemas/variant-schema.json';
import { JsonToString } from '../../utils/serializer';

import type { ModelSchema } from '@nikkierp/ui/model';


export const VariantDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const { 
		isLoadingDetail, 
		handleUpdate, 
		handleDelete, 
		handleGoBack, 
		productDetail, 
		variantDetail 
	} = useVariantDetailHandlers();
	const variant = variantDetail?.data;

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById("variant-detail-form");
		if (el instanceof HTMLFormElement) {
		el.requestSubmit();
		}
	}, []);

	const breadcrumbs = [
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '..' },
		{ title: translate('nikki.inventory.menu.products'), href: '../products' },
		{ title: productDetail?.data?.name ? JsonToString(productDetail.data.name) : translate('nikki.inventory.breadcrumbs.productDetail'), href: `../products/${productDetail?.data?.id}` },
		{ title: translate('nikki.inventory.menu.variants'), href: '../product-variants' },
		{ title: variant?.name ? JsonToString(variant.name) : translate('nikki.inventory.breadcrumbs.variantDetail'), href: '#' },
	];

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				isLoading={isLoadingDetail}
				sections={[
					<ControlPanel
						actions={[
							{
								label: translate('nikki.general.actions.back'),
								leftSection: <IconArrowLeft size={16} />,
								onClick: handleGoBack,
								variant: 'outline' as const,
								type: 'button' as const,
							},
							...(!isEditing ? [{
								label: translate('nikki.general.actions.edit'),
								leftSection: <IconEdit size={16} />,
								onClick: () => setIsEditing(true),
								variant: 'filled' as const,
								type: 'button' as const,
							}] : [{
								label: translate('nikki.general.actions.save'),
								leftSection: <IconDeviceFloppy size={16} />,
								type: 'button' as const,
								variant: 'filled' as const,
								onClick: handleSaveClick,
								form: 'variant-detail-form',
							}, {
								label: translate('nikki.general.actions.cancel'),
								leftSection: <IconX size={16} />,
								onClick: () => setIsEditing(false),
								variant: 'outline' as const,
								type: 'button' as const,
							}]),
							{
								label: translate('nikki.general.actions.delete'),
								leftSection: <IconTrash size={16} />,
								onClick: () => setShowDeleteConfirm(true),
								variant: 'outline' as const,
								color: 'red',
								type: 'button' as const,
							},
						]}
					/>,
				]}
			>
				<VariantDetailForm
					schema={variantSchema as ModelSchema}
					variantDetail={variant}
					isLoading={isLoadingDetail}
					isEditing={isEditing}
					onSubmit={handleUpdate}
				/>
			</PageContainer>
			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={() => { setShowDeleteConfirm(false); void handleDelete(); }}
				title={translate('nikki.inventory.variant.messages.confirmDeleteTitle')}
				message={translate('nikki.inventory.variant.messages.confirmDeleteMessage')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

export const VariantDetailPage: React.FC = withWindowTitle('Variant Detail', VariantDetailPageBody);
