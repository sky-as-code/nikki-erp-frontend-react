import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductCategoryDetailForm } from '../../features/productCategory/components';
import { useProductCategoryDetail } from '../../features/productCategory/hooks';
import categorySchema from '../../schemas/product-category-schema.json';
import { JsonToString } from '../../utils/serializer';

import type { ModelSchema } from '@nikkierp/ui/model';

export const ProductCategoryDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const { categoryId } = useParams();
	const [isEditing, setIsEditing] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const {
		isLoading,
		isSubmitting,
		category,
		handleGoBack,
		onSave,
		onDelete,
		products,
		onDeleteProduct,
	} = useProductCategoryDetail({ categoryId });

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById('product-category-detail-form');
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const breadcrumbs = [
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: translate('nikki.inventory.menu.productCategories'), href: '../product-categories' },
		{ title: category?.name ? JsonToString(category.name) : translate('nikki.inventory.breadcrumbs.productCategoryDetails'), href: '#' },
	];

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				isLoading={isLoading}
				isNotFound={!category && !isLoading}
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
								type: 'button' as const,
							}] : [{
								label: translate('nikki.general.actions.save'),
								leftSection: <IconDeviceFloppy size={16} />,
								onClick: handleSaveClick,
								type: 'button' as const,
								variant: 'filled' as const,
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
								type: 'button' as const,
								color: 'red',
							},
						]}
					/>,
				]}
			>
				<ProductCategoryDetailForm
					schema={categorySchema as ModelSchema}
					category={category ?? undefined}
					isSubmitting={isSubmitting}
					isEditing={isEditing}
					onSave={onSave}
					products={products}
					onDeleteProduct={onDeleteProduct}
				/>
			</PageContainer>
			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={() => { setShowDeleteConfirm(false); void onDelete(); }}
				title={translate('nikki.inventory.productCategory.messages.confirmDeleteTitle')}
				message={translate('nikki.inventory.productCategory.messages.confirmDeleteMessage')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

export const ProductCategoryDetailPage = withWindowTitle(
	'Product Category Details',
	ProductCategoryDetailPageBody,
);

