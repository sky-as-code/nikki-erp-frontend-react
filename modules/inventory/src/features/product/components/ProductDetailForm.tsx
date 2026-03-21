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
import {
	AutoField,
	EntitySelectField,
} from '@nikkierp/ui/components/form';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { JsonToString } from '../../../utils/serializer';

import type { Attribute } from '../../attribute/types';
import type { AttributeValue } from '../../attributeValue/types';
import type { Unit } from '../../unit/types';
import type { Variant } from '../../variant/types';


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

function getAttributeValueCandidates(value: AttributeValue): Array<string | number | boolean> {
	const candidates: Array<string | number | boolean> = [value.id];

	if (typeof value.valueText === 'string') {
		candidates.push(value.valueText);
	}
	else if (value.valueText && typeof value.valueText === 'object') {
		candidates.push(...Object.values(value.valueText).filter(
			(item): item is string => typeof item === 'string' && item.length > 0,
		));
	}

	if (typeof value.valueNumber === 'number') {
		candidates.push(value.valueNumber, String(value.valueNumber));
	}

	if (typeof value.valueBool === 'boolean') {
		candidates.push(
			value.valueBool,
			value.valueBool ? 'true' : 'false',
			value.valueBool ? 'Yes' : 'No',
		);
	}

	if (typeof value.valueRef === 'string') {
		candidates.push(value.valueRef);
	}

	return Array.from(new Set(candidates));
}

function getVariantAttributeCandidates(value: unknown): Array<string | number | boolean> {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return [value];
	}

	if (!value || typeof value !== 'object') {
		return [];
	}

	const record = value as Record<string, unknown>;
	const candidates: Array<string | number | boolean> = [];

	if (typeof record.value === 'string'
		|| typeof record.value === 'number'
		|| typeof record.value === 'boolean') {
		candidates.push(record.value);
	}

	if (typeof record.valueText === 'string') {
		candidates.push(record.valueText);
	}
	else if (record.valueText && typeof record.valueText === 'object') {
		candidates.push(...Object.values(record.valueText as Record<string, unknown>).filter(
			(item): item is string | number | boolean => (
				typeof item === 'string'
				|| typeof item === 'number'
				|| typeof item === 'boolean'
			),
		));
	}

	if (typeof record.valueNumber === 'number') {
		candidates.push(record.valueNumber, String(record.valueNumber));
	}

	if (typeof record.valueBool === 'boolean') {
		candidates.push(
			record.valueBool,
			record.valueBool ? 'true' : 'false',
			record.valueBool ? 'Yes' : 'No',
		);
	}

	if (typeof record.valueRef === 'string') {
		candidates.push(record.valueRef);
	}

	if (typeof record.id === 'string') {
		candidates.push(record.id);
	}

	return Array.from(new Set(candidates));
}

function getVariantAttributeValue(attributes: unknown, codeName: string): unknown {
	if (!attributes) {
		return undefined;
	}

	if (Array.isArray(attributes)) {
		const variantAttribute = attributes.find((item) => (
			typeof item === 'object'
			&& item !== null
			&& (item as Record<string, unknown>).codeName === codeName
		)) as Record<string, unknown> | undefined;

		return variantAttribute?.value;
	}

	if (typeof attributes !== 'object') {
		return undefined;
	}

	return (attributes as Record<string, unknown>)[codeName];
}

function getAttributeById(attributes: Attribute[]): Record<string, Attribute> {
	return attributes.reduce<Record<string, Attribute>>((acc, attribute) => {
		acc[attribute.id] = attribute;
		return acc;
	}, {});
}

function variantMatchesSelection(
	variant: Variant,
	selectedAttributes: Record<string, string>,
	attributesById: Record<string, Attribute>,
	attributeValuesByAttributeId: Record<string, AttributeValue[]>,
): boolean {
	return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
		const attribute = attributesById[attributeId];
		if (!attribute) return false;

		const selectedValue = attributeValuesByAttributeId[attributeId]?.find(
			(value) => value.id === valueId,
		);
		if (!selectedValue) return false;

		const variantAttributeValue = getVariantAttributeValue(variant.attributes, attribute.codeName);
		const variantCandidates = new Set(getVariantAttributeCandidates(variantAttributeValue));
		return getAttributeValueCandidates(selectedValue).some((candidate) => variantCandidates.has(candidate));
	});
}

export function useVariantResolution(
	selectedAttributes: Record<string, string>,
	variants: Variant[],
	productData: any,
	requiredAttributeIds: string[],
	attributes: Attribute[] = [],
	attributeValuesByAttributeId: Record<string, AttributeValue[]> = {} as Record<string, AttributeValue[]>,
) {
	const attributesById = useMemo(() => getAttributeById(attributes), [attributes]);

	const isSelectionComplete = useMemo(() => (
		requiredAttributeIds.length === 0
			|| requiredAttributeIds.every((id) => Boolean(selectedAttributes[id]))
	), [requiredAttributeIds, selectedAttributes]);

	const selectedVariant = useMemo(() => {
		if (!isSelectionComplete) return null;

		return variants.find((variant: Variant) => (
			variantMatchesSelection(
				variant,
				selectedAttributes,
				attributesById,
				attributeValuesByAttributeId,
			)
		));
	}, [attributeValuesByAttributeId, attributesById, isSelectionComplete, selectedAttributes, variants]);

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
	attributes: Attribute[] = [],
	attributeValuesByAttributeId: Record<string, AttributeValue[]> = {} as Record<string, AttributeValue[]>,
) {
	const attributesById = useMemo(() => getAttributeById(attributes), [attributes]);

	const isAttributeValueValid = (attributeId: string, valueId: string) => {
		const testSelection = { ...selectedAttributes, [attributeId]: valueId };
		return variants.some((variant: Variant) => (
			variantMatchesSelection(
				variant,
				testSelection,
				attributesById,
				attributeValuesByAttributeId,
			)
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
	const requiredAttributes = sortedAttributes.filter((attr) => attr.isRequired);
	const missingRequiredAttributes = requiredAttributes.filter((attr) => !selectedAttributes[attr.id]);

	const getAttributeLabel = (attr: Attribute): string => {
		if (typeof attr.displayName === 'string') return attr.displayName || attr.codeName || attr.id;
		return (attr.displayName as Record<string, string>)?.en || attr.codeName || attr.id;
	};

	const missingRequiredLabel = missingRequiredAttributes
		.map((attr) => getAttributeLabel(attr))
		.filter(Boolean)
		.join(', ');

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

			{requiredAttributes.length > 0 && hasSelections && missingRequiredAttributes.length > 0 && (
				<Text size='xs' c='dimmed'>
					Select {missingRequiredLabel} to find the matching Variant.
				</Text>
			)}

			{requiredAttributes.length > 0 && missingRequiredAttributes.length === 0 && (
				<Text size='xs' c='dimmed'>
					All required options selected. System will match the correct Variant.
				</Text>
			)}

			{sortedAttributes.map((attr: Attribute) => {
				const attributeLabel = getAttributeLabel(attr);
				const values = attributeValuesByAttributeId[attr.id] || [];
				const isColorAttr = attr.displayType === 'color' || attr.codeName === 'color';

				return (
					<Stack key={attr.id} gap='xs'>
						<Text size='sm' fw={500}>
							{isColorAttr && 'Available in '}
							{attributeLabel}
							{attr.isRequired ? ' *' : ''}
						</Text>

						{isColorAttr && values.length > 0 && (
							<ColorSwatches
								values={values}
								attributeId={attr.id}
								selectedAttributes={selectedAttributes}
								handleAttributeSelect={handleAttributeSelect}
								isAttributeValueValid={isAttributeValueValid}
							/>
						)}

						{!isColorAttr && values.length > 0 && (
							<MaterialButtons
								values={values}
								attributeId={attr.id}
								selectedAttributes={selectedAttributes}
								handleAttributeSelect={handleAttributeSelect}
								isAttributeValueValid={isAttributeValueValid}
							/>
						)}

						{values.length === 0 && (
							<Text size='xs' c='dimmed'>
								No options available.
							</Text>
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
	const requiredAttributes = attributes.filter((attr) => attr.isRequired);
	const missingRequiredAttributes = requiredAttributes.filter((attr) => !selectedAttributes[attr.id]);
	const hasSelections = Object.keys(selectedAttributes).length > 0;
	const isSelectionComplete = requiredAttributes.length === 0 || missingRequiredAttributes.length === 0;

	const getAttributeLabel = (attr: Attribute): string => {
		if (typeof attr.displayName === 'string') return attr.displayName || attr.codeName || attr.id;
		return (attr.displayName as Record<string, string>)?.en || attr.codeName || attr.id;
	};

	const missingRequiredLabel = missingRequiredAttributes
		.map((attr) => getAttributeLabel(attr))
		.filter(Boolean)
		.join(', ');

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

			{hasSelections && !isSelectionComplete && (
				<Text size='sm' c='dimmed'>
					Select more options ({missingRequiredLabel}) to find the matching Variant.
				</Text>
			)}

			{hasSelections && isSelectionComplete && !selectedVariant && (
				<Text size='sm' c='red'>
					No matching Variant found for the selected AttributeValue combination.
				</Text>
			)}

			{hasSelections && isSelectionComplete && selectedVariant && (
				<Text size='sm' c='dimmed'>
					Matched Variant: {selectedVariant.sku}
				</Text>
			)}

			<Divider />

			<PurchasePanel
				selectedVariant={selectedVariant}
				quantity={quantity}
				setQuantity={setQuantity}
			/>
		</Stack>
	);
}

// Admin Product Detail Content - for admin product management page
interface AdminProductDetailContentProps {
	productName: string;
	units: Unit[];
	isSubmitting: boolean;
	productImages: string[];
	selectedImageIndex: number;
	onSelectImage: (index: number) => void;
}

export function AdminProductDetailContent({
	productName,
	units,
	isSubmitting,
	productImages,
	selectedImageIndex,
	onSelectImage,
}: AdminProductDetailContentProps) {
	return (
		<Grid gutter='xl' align='stretch'>
			<Grid.Col span={{ base: 12, md: 5 }} style={{ display: 'flex' }}>
				<Stack style={{ flex: 1 }}>
					<ImageGallery
						currentImages={productImages}
						selectedImageIndex={selectedImageIndex}
						setSelectedImageIndex={onSelectImage}
						productName={productName}
					/>
				</Stack>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 7 }}>
				<Stack gap='md'>
					<AutoField name='name' inputProps={{ disabled: isSubmitting }} />
					<AutoField name='description' inputProps={{ disabled: isSubmitting }} />
					<EntitySelectField
						fieldName='unitId'
						entities={units}
						getEntityId={(unit) => unit.id}
						getEntityName={(unit) => `${JsonToString(unit.name)} (${unit.symbol ?? ''})`}
						shouldDisable={isSubmitting}
						selectProps={{ clearable: true }}
					/>
					<AutoField name='status' inputProps={{ disabled: isSubmitting }} />
					<AutoField name='thumbnailURL' inputProps={{ disabled: isSubmitting }} />
				</Stack>
			</Grid.Col>
		</Grid>
	);
}
