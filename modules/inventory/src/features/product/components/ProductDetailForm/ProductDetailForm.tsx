import {
	Box,
	Button,
	Divider,
	Grid,
	Group,
	Image,
	NumberInput,
	Paper,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	FormStyleProvider,
	FormFieldProvider,
} from '@nikkierp/ui/components/form';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../../../components/ActionBar/DetailActionBar';

import type { Attribute } from '../../../../features/attribute/types';
import type { AttributeValue } from '../../../../features/attributeValue/types';
import type { Variant } from '../../../../features/variant/types';
import type { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';


interface ImageGalleryProps {
	currentImages: string[];
	selectedImageIndex: number;
	setSelectedImageIndex: (idx: number) => void;
	productName: string;
}

function ImageGallery({
	currentImages,
	selectedImageIndex,
	setSelectedImageIndex,
	productName,
}: ImageGalleryProps) {
	return (
		<Stack gap='md'>
			<Box pos='relative'>
				<Image
					src={currentImages[selectedImageIndex] || currentImages[0]}
					alt={productName}
					h={500}
					fit='cover'
					radius='md'
				/>
			</Box>

			{currentImages.length > 1 && (
				<Group gap='xs' justify='center'>
					{currentImages.map((img: string, idx: number) => (
						<UnstyledButton
							key={idx}
							onClick={() => setSelectedImageIndex(idx)}
							style={{
								border: selectedImageIndex === idx
									? '2px solid #228be6'
									: '1px solid #dee2e6',
								borderRadius: '4px',
								overflow: 'hidden',
							}}
						>
							<Image
								src={img}
								alt={`${productName} ${idx + 1}`}
								w={80}
								h={80}
								fit='cover'
							/>
						</UnstyledButton>
					))}
				</Group>
			)}
		</Stack>
	);
}

function getAttributeValueLabel(value: AttributeValue): string {
	if (typeof value.valueText === 'string') return value.valueText;
	if (value.valueText && typeof value.valueText === 'object') {
		const localized = value.valueText as Record<string, string>;
		return localized.en || Object.values(localized)[0] || '';
	}
	if (typeof value.valueNumber === 'number') return String(value.valueNumber);
	if (typeof value.valueBool === 'boolean') return value.valueBool ? 'Yes' : 'No';
	return value.valueRef || '';
}

function variantMatchesSelection(
	variant: Variant,
	selectedAttributes: Record<string, string>,
): boolean {
	if (!variant.attributeValues || variant.attributeValues.length === 0) return false;
	return Object.entries(selectedAttributes).every(([attributeId, valueId]) => (
		variant.attributeValues?.some(
			(value) => value.attributeId === attributeId && value.id === valueId,
		)
	));
}

export function useVariantResolution(
	selectedAttributes: Record<string, string>,
	variants: Variant[],
	productData: any,
	requiredAttributeIds: string[],
) {
	const isSelectionComplete = useMemo(() => (
		requiredAttributeIds.length === 0
			|| requiredAttributeIds.every((id) => Boolean(selectedAttributes[id]))
	), [requiredAttributeIds, selectedAttributes]);

	const selectedVariant = useMemo(() => {
		if (!isSelectionComplete) return null;

		return variants.find((variant: Variant) => (
			variantMatchesSelection(variant, selectedAttributes)
		));
	}, [isSelectionComplete, selectedAttributes, variants]);

	const currentPrice = selectedVariant?.proposedPrice || productData?.proposedPrice || 0;

	return {
		selectedVariant,
		currentPrice,
	};
}

interface ProductDetailContentProps {
	productName: string;
	productDescription?: string;
	productImages: string[];
	selectedImageIndex: number;
	setSelectedImageIndex: (idx: number) => void;
	productData: any;
	attributes: Attribute[];
	attributeValuesByAttributeId: Record<string, AttributeValue[]>;
	selectedAttributes: Record<string, string>;
	currentPrice: number;
	selectedVariant: Variant | null | undefined;
	quantity: number;
	setQuantity: (val: number) => void;
	handleAttributeSelect: (attributeId: string, valueId: string) => void;
	isAttributeValueValid: (attributeId: string, valueId: string) => boolean;
	onResetAttributes: () => void;
	header?: React.ReactNode;
}

export function ProductDetailContent({
	productName,
	productImages,
	selectedImageIndex,
	setSelectedImageIndex,
	productData,
	productDescription,
	attributes,
	attributeValuesByAttributeId,
	selectedAttributes,
	currentPrice,
	selectedVariant,
	quantity,
	setQuantity,
	handleAttributeSelect,
	isAttributeValueValid,
	onResetAttributes,
	header,
}: ProductDetailContentProps) {
	return (
		<Paper p='md' shadow='xs'>
			<Stack gap='lg'>
				{header}
				<Grid gutter='xl'>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<ImageGallery
							currentImages={productImages}
							selectedImageIndex={selectedImageIndex}
							setSelectedImageIndex={setSelectedImageIndex}
							productName={productName}
						/>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 6 }}>
						<ProductInfoPanel
							productData={productData}
							productName={productName}
							productDescription={productDescription}
							attributes={attributes}
							attributeValuesByAttributeId={attributeValuesByAttributeId}
							selectedAttributes={selectedAttributes}
							currentPrice={currentPrice}
							selectedVariant={selectedVariant}
							quantity={quantity}
							setQuantity={setQuantity}
							handleAttributeSelect={handleAttributeSelect}
							isAttributeValueValid={isAttributeValueValid}
							onResetAttributes={onResetAttributes}
						/>
					</Grid.Col>
				</Grid>
			</Stack>
		</Paper>
	);
}

export function useAttributeValidation(
	selectedAttributes: Record<string, string>,
	variants: Variant[],
) {
	const isAttributeValueValid = (attributeId: string, valueId: string) => {
		const testSelection = { ...selectedAttributes, [attributeId]: valueId };
		return variants.some((variant: Variant) => (
			variantMatchesSelection(variant, testSelection)
		));
	};

	return { isAttributeValueValid };
}


interface ProductInfoPanelProps {
	productData: any;
	productName: string;
	productDescription?: string;
	attributes: Attribute[];
	attributeValuesByAttributeId: Record<string, AttributeValue[]>;
	selectedAttributes: Record<string, string>;
	currentPrice: number;
	selectedVariant: Variant | null | undefined;
	quantity: number;
	setQuantity: (val: number) => void;
	handleAttributeSelect: (attributeId: string, valueId: string) => void;
	isAttributeValueValid: (attributeId: string, valueId: string) => boolean;
	onResetAttributes: () => void;
}

interface AttributeSelectorProps {
	productId?: string;
	attributes: Attribute[];
	attributeValuesByAttributeId: Record<string, AttributeValue[]>;
	selectedAttributes: Record<string, string>;
	handleAttributeSelect: (attributeId: string, valueId: string) => void;
	isAttributeValueValid: (attributeId: string, valueId: string) => boolean;
	onResetAttributes: () => void;
}

interface ColorSwatchesProps {
	values: AttributeValue[];
	attributeId: string;
	selectedAttributes: Record<string, string>;
	handleAttributeSelect: (attributeId: string, valueId: string) => void;
	isAttributeValueValid: (attributeId: string, valueId: string) => boolean;
}

function ColorSwatches({
	values,
	attributeId,
	selectedAttributes,
	handleAttributeSelect,
	isAttributeValueValid,
}: ColorSwatchesProps) {
	return (
		<Group gap='xs'>
			{values.map((value) => {
				const isSelected = selectedAttributes[attributeId] === value.id;
				const isValid = isAttributeValueValid(attributeId, value.id);
				const colorHex = value.valueRef || '#dee2e6';

				return (
					<UnstyledButton
						key={value.id}
						onClick={() => handleAttributeSelect(attributeId, value.id)}
						disabled={!isValid}
						style={{
							width: 50,
							height: 50,
							borderRadius: '50%',
							backgroundColor: colorHex,
							border: isSelected ? '3px solid #228be6' : '2px solid #dee2e6',
							opacity: isValid ? 1 : 0.3,
							cursor: isValid ? 'pointer' : 'not-allowed',
							boxShadow: isSelected
								? '0 0 0 3px rgba(34, 139, 230, 0.2)'
								: 'none',
						}}
						title={getAttributeValueLabel(value)}
					/>
				);
			})}
		</Group>
	);
}

interface MaterialButtonsProps {
	values: AttributeValue[];
	attributeId: string;
	selectedAttributes: Record<string, string>;
	handleAttributeSelect: (attributeId: string, valueId: string) => void;
	isAttributeValueValid: (attributeId: string, valueId: string) => boolean;
}

function MaterialButtons({
	values,
	attributeId,
	selectedAttributes,
	handleAttributeSelect,
	isAttributeValueValid,
}: MaterialButtonsProps) {
	return (
		<Group gap='xs'>
			{values.map((value) => {
				const isSelected = selectedAttributes[attributeId] === value.id;
				const isValid = isAttributeValueValid(attributeId, value.id);

				return (
					<Button
						key={value.id}
						onClick={() => handleAttributeSelect(attributeId, value.id)}
						variant={isSelected ? 'filled' : 'light'}
						disabled={!isValid}
						size='md'
					>
						{getAttributeValueLabel(value)}
					</Button>
				);
			})}
		</Group>
	);
}

function AttributeSelector({
	productId,
	attributes,
	attributeValuesByAttributeId,
	selectedAttributes,
	handleAttributeSelect,
	isAttributeValueValid,
	onResetAttributes,
}: AttributeSelectorProps) {
	const navigate = useNavigate();
	const sortedAttributes = [...attributes].sort(
		(a: Attribute, b: Attribute) => (a.sortIndex || 0) - (b.sortIndex || 0),
	);

	const hasSelections = Object.keys(selectedAttributes).length > 0;

	const handleEditAttributes = () => {
		if (productId) {
			navigate(`../${productId}/attributes`, { relative: 'path' });
		}
	};

	const handleEditVariants = () => {
		if (productId) {
			navigate(`../${productId}/variants`, { relative: 'path' });
		}
	};

	return (
		<Stack gap='md'>
			<Group justify='space-between' align='center'>
				<Text size='sm' fw={500}>Select Options</Text>
				<Group gap='xs'>
					{hasSelections && (
						<Button variant='subtle' size='xs' onClick={onResetAttributes} c='dimmed'>
							Reset
						</Button>
					)}
					<Button variant='subtle' size='xs' onClick={handleEditAttributes}>
						Edit Attributes
					</Button>
					<Button variant='subtle' size='xs' onClick={handleEditVariants}>
						Edit Variants
					</Button>
				</Group>
			</Group>

			{sortedAttributes.map((attr: Attribute) => {
				const displayName = typeof attr.displayName === 'string'
					? attr.displayName
					: (attr.displayName as Record<string, string>)?.en;
				const values = attributeValuesByAttributeId[attr.id] || [];

				return (
					<Stack key={attr.id} gap='xs'>
						<Text size='sm' fw={500}>
							{attr.codeName === 'color' && 'Available in '}
							{displayName}
						</Text>

						{attr.codeName === 'color' && values.length > 0 && (
							<ColorSwatches
								values={values}
								attributeId={attr.id}
								selectedAttributes={selectedAttributes}
								handleAttributeSelect={handleAttributeSelect}
								isAttributeValueValid={isAttributeValueValid}
							/>
						)}

						{(attr.codeName === 'coverMaterial' || attr.codeName === 'frameMaterial')
							&& values.length > 0 && (
							<MaterialButtons
								values={values}
								attributeId={attr.id}
								selectedAttributes={selectedAttributes}
								handleAttributeSelect={handleAttributeSelect}
								isAttributeValueValid={isAttributeValueValid}
							/>
						)}
					</Stack>
				);
			})}
		</Stack>
	);
}

interface PriceDisplayProps {
	currentPrice: number;
}

function PriceDisplay({ currentPrice }: PriceDisplayProps) {
	return (
		<Stack gap='xs'>
			<Group gap='md' align='baseline'>
				<Title order={2} c='blue'>
					${(currentPrice / 1000).toFixed(3)}
				</Title>
			</Group>
		</Stack>
	);
}

interface PurchasePanelProps {
	selectedVariant: Variant | null | undefined;
	quantity: number;
	setQuantity: (val: number) => void;
}

function PurchasePanel({ selectedVariant, quantity, setQuantity }: PurchasePanelProps) {
	return (
		<>
			<Stack gap='md'>
				<Group gap='md'>
					<Box style={{ width: 120 }}>
						<NumberInput
							value={quantity}
							onChange={(val) => setQuantity(Number(val) || 1)}
							min={1}
							max={99}
							disabled={!selectedVariant}
							size='md'
						/>
					</Box>
				</Group>
			</Stack>

			<Button
				size='lg'
				fullWidth
				disabled={!selectedVariant}
			>
				Add to Cart
			</Button>

			{selectedVariant && (
				<Stack gap='xs'>
					<Text size='sm' c='dimmed'>SKU: {selectedVariant.sku}</Text>
					{selectedVariant.barcode && (
						<Text size='sm' c='dimmed'>Barcode: {selectedVariant.barcode}</Text>
					)}
				</Stack>
			)}
		</>
	);
}

function ProductInfoPanel({
	productData,
	productName,
	productDescription,
	attributes,
	attributeValuesByAttributeId,
	selectedAttributes,
	currentPrice,
	selectedVariant,
	quantity,
	setQuantity,
	handleAttributeSelect,
	isAttributeValueValid,
	onResetAttributes,
}: ProductInfoPanelProps) {
	return (
		<Stack gap='md'>
			<Title order={1} size='h2'>{productName}</Title>

			{productDescription && (
				<Text size='sm' c='dimmed'>{productDescription}</Text>
			)}

			<Divider />

			<PriceDisplay currentPrice={currentPrice} />

			<Divider />

			<AttributeSelector
				productId={productData?.id}
				attributes={attributes}
				attributeValuesByAttributeId={attributeValuesByAttributeId}
				selectedAttributes={selectedAttributes}
				handleAttributeSelect={handleAttributeSelect}
				isAttributeValueValid={isAttributeValueValid}
				onResetAttributes={onResetAttributes}
			/>
			<Divider />

			<PurchasePanel
				selectedVariant={selectedVariant}
				quantity={quantity}
				setQuantity={setQuantity}
			/>
		</Stack>
	);
}
