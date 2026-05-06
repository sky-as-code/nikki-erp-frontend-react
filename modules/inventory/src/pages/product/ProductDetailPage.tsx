import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { ProductDetailForm } from '../../features/product/components/ProductDetailForm';
import { useProductDetailHandlers } from '../../features/product/hooks/useProductDetail';
import productSchema from '../../schemas/product-schema.json';
import { JsonToString } from '../../utils/serializer';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../../features/variant/types';

export const ProductDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = React.useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const {
		isLoading,
		product,
		attributes,
		variants,
		attributeValuesByAttributeId,
		attributeValuesLoading,
		handleDeleteProduct,
		handleUpdateProduct,
		handleDeleteAttribute,
		handleDeleteVariant,
		handleGoBack,
	} = useProductDetailHandlers();

	const handleSelectImage = React.useCallback((index: number) => {
		setSelectedImageIndex(index);
	}, []);

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById("product-detail-form");
		if (el instanceof HTMLFormElement) {
		el.requestSubmit();
		}
	}, []);

	const productImages = React.useMemo(() => {
		if (!product) return [];
		const legacyImages = ((product as { images?: string[] } | null)?.images ?? []);
		const variantsList = (variants ?? []) as Variant[];
		const candidateImages = [
			product?.thumbnailURL,
			...legacyImages,
			...variantsList.map((variant) => variant.imageURL).filter((url): url is string => Boolean(url)),
		];

		const validImages = candidateImages.filter((image): image is string => Boolean(image));
		return Array.from(new Set(validImages));
	}, [product, variants]);

	const breadcrumbs = [
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: translate('nikki.inventory.menu.products'), href: '../products' },
		{ title: product ? (JsonToString(product.name) || product.id) : translate('nikki.inventory.breadcrumbs.productDetail'), href: '#' },
	];

	return (
		<>
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoading}
			isNotFound={!product}
			sections={[
				<ControlPanel
					actions={[
						{
							label: translate('nikki.general.actions.back'),
							leftSection: <IconArrowLeft size={16} />,
							onClick: handleGoBack,
							variant: 'outline',
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
							form: "product-detail-form",
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
			<ProductDetailForm
				schema={productSchema as ModelSchema}
				productDetail={product}
				isLoading={isLoading}
				isEditing={isEditing}
				productImages={productImages}
				selectedImageIndex={selectedImageIndex}
				onSelectImage={handleSelectImage}
				onSubmit={handleUpdateProduct}
				attributes={attributes}
				variants={variants}
				attributeValuesByAttributeId={attributeValuesByAttributeId}
				attributeValuesLoading={attributeValuesLoading}
				onDeleteAttribute={handleDeleteAttribute}
				onDeleteVariant={handleDeleteVariant}
			/>
		</PageContainer>
		<ConfirmModal
			opened={showDeleteConfirm}
			onClose={() => setShowDeleteConfirm(false)}
			onConfirm={() => { setShowDeleteConfirm(false); handleDeleteProduct(); }}
			title={translate('nikki.inventory.product.messages.confirmDeleteTitle')}
			message={translate('nikki.inventory.product.messages.confirmDeleteMessage')}
			confirmLabel={translate('nikki.general.actions.delete')}
			confirmColor='red'
		/>
		</>
	);
};

export const ProductDetailPage: React.FC = withWindowTitle('Product Detail', ProductDetailPageBody);
