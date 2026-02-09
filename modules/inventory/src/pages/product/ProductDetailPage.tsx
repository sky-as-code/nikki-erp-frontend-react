import { LoadingState, NotFound, withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';
import {
	ProductDetailContent,
	useAttributeValidation,
	useVariantResolution,
} from '../../features/product/components/ProductDetailForm/ProductDetailForm';
import { useProductDetail } from '../../features/product/hooks/useProductDetail';

import type { Attribute } from '../../features/attribute/types';
import type { AttributeValue } from '../../features/attributeValue/types';
import type { Variant } from '../../features/variant/types';


function toDisplayText(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (value && typeof value === 'object') {
		const localized = value as Record<string, string>;
		return localized.en ?? Object.values(localized)[0] ?? '';
	}

	return '';
}


export const ProductDetailPageBody: React.FC = () => {
	const { productId } = useParams<{ productId?: string }>();
	const navigate = useNavigate();
	const {
		isLoading,
		product,
		attributes: rawAttributes,
		variants: rawVariants,
		handleDeleteProduct,
	} = useProductDetail({ productId });
	const attributes = (rawAttributes ?? []) as Attribute[];
	const variants = (rawVariants ?? []) as Variant[];

	const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
	const [quantity, setQuantity] = React.useState(1);

	const requiredAttributeIds = React.useMemo(
		() => attributes.filter((attr) => attr.isRequired).map((attr) => attr.id),
		[attributes],
	);

	const attributeValuesByAttributeId = React.useMemo(() => {
		const grouped: Record<string, AttributeValue[]> = {};
		variants.forEach((variant) => {
			variant.attributeValues.forEach((value) => {
				const list = grouped[value.attributeId] || [];
				if (!list.some((existing) => existing.id === value.id)) {
					list.push(value);
					grouped[value.attributeId] = list;
				}
			});
		});
		return grouped;
	}, [variants]);

	const {
		selectedVariant,
		currentPrice,
	} = useVariantResolution(selectedAttributes, variants, product, requiredAttributeIds);

	const productImages = React.useMemo(() => {
		const legacyImages = ((product as { images?: string[] } | null)?.images ?? []);
		const imageCandidates = [
			selectedVariant?.imageUrl,
			...legacyImages,
			product?.thumbnailUrl,
		];

		const validImages = imageCandidates.filter((image): image is string => Boolean(image));
		return Array.from(new Set(validImages));
	}, [product, selectedVariant?.imageUrl]);

	const handleAttributeSelect = React.useCallback((attributeId: string, valueId: string) => {
		setSelectedAttributes((prev) => ({
			...prev,
			[attributeId]: valueId,
		}));
	}, []);

	const handleResetAttributes = React.useCallback(() => {
		setSelectedAttributes({});
	}, []);

	const { isAttributeValueValid } = useAttributeValidation(selectedAttributes, variants);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback(() => {
		// Product detail view currently does not expose editable product fields.
	}, []);

	if (isLoading) {
		return <LoadingState messageKey='nikki.general.messages.loading' minHeight={400} />;
	}

	if (!product) {
		return <NotFound onGoBack={handleGoBack} messageKey='nikki.inventory.messages.productNotFound' />;
	}

	const productName = toDisplayText(product.name) || product.id;
	const productDescription = toDisplayText(product.description);

	return (
		<ProductDetailContent
			productName={productName}
			productDescription={productDescription}
			productImages={productImages}
			selectedImageIndex={selectedImageIndex}
			header={(
				<DetailActionBar
					onSave={handleSave}
					onGoBack={handleGoBack}
					onDelete={() => void handleDeleteProduct()}
				/>
			)}
			setSelectedImageIndex={setSelectedImageIndex}
			productData={product}
			attributes={attributes}
			attributeValuesByAttributeId={attributeValuesByAttributeId}
			selectedAttributes={selectedAttributes}
			currentPrice={currentPrice}
			selectedVariant={selectedVariant}
			quantity={quantity}
			setQuantity={setQuantity}
			handleAttributeSelect={handleAttributeSelect}
			isAttributeValueValid={isAttributeValueValid}
			onResetAttributes={handleResetAttributes}
		/>
	);
};

export const ProductDetailPage: React.FC = withWindowTitle('Product Detail', ProductDetailPageBody);
