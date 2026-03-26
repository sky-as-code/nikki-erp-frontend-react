import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
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

	const handleUpdate = React.useCallback((rawValues: Record<string, unknown>) => {
		handleUpdateProduct({
			name: rawValues.name as Record<string, string> | undefined,
			description: rawValues.description as Record<string, string> | undefined,
			status: rawValues.status as string | undefined,
			unitId: rawValues.unitId as string | undefined,
			thumbnailURL: rawValues.thumbnailURL as string | undefined,
		});
		setIsEditing(false);
	}, [handleUpdateProduct]);

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
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '../products' },
		{ title: product ? (JsonToString(product.name) || product.id) : 'Product Detail', href: '#' },
	];

	return (
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
						},
						...(!isEditing ? [{
							label: translate('nikki.general.actions.edit'),
							leftSection: <IconEdit size={16} />,
							onClick: () => setIsEditing(true),
							variant: 'filled' as const,
						}] : [{
							label: translate('nikki.general.actions.save'),
							leftSection: <IconDeviceFloppy size={16} />,
							onClick: () => handleUpdate,
							variant: 'filled' as const,
						}, {
							label: translate('nikki.general.actions.cancel'),
							leftSection: <IconX size={16} />,
							onClick: () => setIsEditing(false),
							variant: 'outline' as const,
						}]),
						{
							label: translate('nikki.general.actions.delete'),
							leftSection: <IconTrash size={16} />,
							onClick: handleDeleteProduct,
							variant: 'outline',
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
				onSubmit={handleUpdate}
				attributes={attributes}
				variants={variants}
				attributeValuesByAttributeId={attributeValuesByAttributeId}
				attributeValuesLoading={attributeValuesLoading}
				onDeleteAttribute={handleDeleteAttribute}
				onDeleteVariant={handleDeleteVariant}
			/>
		</PageContainer>
	);
};

export const ProductDetailPage: React.FC = withWindowTitle('Product Detail', ProductDetailPageBody);
