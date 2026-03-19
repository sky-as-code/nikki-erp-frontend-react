/* eslint-disable max-lines-per-function */
import {
	Badge,
	Button,
	Divider,
	Grid,
	Group,
	Stack,
	Tabs,
	Text,
	Title,
} from '@mantine/core';
import {
	AutoTable,
	LoadingState,
	NotFound,
	withWindowTitle,
} from '@nikkierp/ui/components';
import {
	AutoField,
	EntitySelectField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import React from 'react';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';
import { ImageGallery } from '../../components/ImageGallery';
import { PageContainer } from '../../components/PageContainer';
import { useProductDetailHandlers } from '../../features/product/hooks/useProductDetail';
import { VariantTable } from '../../features/variant/components';
import { JsonToString } from '../../utils/serializer';
import attributeSchema from '../../schemas/attribute-schema.json';
import productSchema from '../../schemas/product-schema.json';

import type { Attribute } from '../../features/attribute/types';
import type { AttributeValue } from '../../features/attributeValue/types';
import type { Unit } from '../../features/unit/types';
import type { Variant } from '../../features/variant/types';
import type { ModelSchema } from '@nikkierp/ui/model';

const ATTRIBUTE_SCHEMA = attributeSchema as ModelSchema;
const PRODUCT_SCHEMA = productSchema as ModelSchema;
const ATTRIBUTE_COLUMNS = ['codeName', 'displayName', 'dataType', 'isRequired', 'values'];


function toAttributeValueLabel(value: AttributeValue): string {
	const localizedText = JsonToString(value.valueText);
	if (localizedText) {
		return localizedText;
	}

	if (typeof value.valueNumber === 'number') {
		return String(value.valueNumber);
	}

	if (typeof value.valueBool === 'boolean') {
		return value.valueBool ? 'Yes' : 'No';
	}

	return value.valueRef ?? '';
}

function toOptionalTrimmedString(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}


type ProductInfoTabProps = {
	productName: string;
	units: Unit[];
	isSubmitting: boolean;
	productSummaryData: Record<string, unknown>;
	productImages: string[];
	selectedImageIndex: number;
	onSelectImage: (index: number) => void;
};

const ProductInfoTab: React.FC<ProductInfoTabProps> = ({
	productName,
	units,
	isSubmitting,
	productSummaryData,
	productImages,
	selectedImageIndex,
	onSelectImage,
}) => (
	<Grid gutter='xl' align='stretch'>
		<Grid.Col span={{ base: 12, md: 5 }} style={{ display: 'flex' }}>
			<Stack style={{ flex: 1 }}>
				<ImageGallery
					images={productImages}
					selectedIndex={selectedImageIndex}
					onSelect={onSelectImage}
					altBase={productName}
					emptyText='No image available'
					fillHeight
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
				
			</Stack>
		</Grid.Col>
	</Grid>
);

type AttributesTabProps = {
	attributes: Attribute[];
	attributeValuesByAttributeId: Record<string, AttributeValue[]>;
};

const AttributesTab: React.FC<AttributesTabProps> = ({
	attributes,
	attributeValuesByAttributeId,
}) => {
	if (attributes.length === 0) {
		return <Text c='dimmed'>No attributes configured for this product.</Text>;
	}

	return (
		<AutoTable
			schema={ATTRIBUTE_SCHEMA}
			columns={ATTRIBUTE_COLUMNS}
			data={attributes as unknown as Record<string, unknown>[]}
			columnRenderers={{
				displayName: (row) => JsonToString((row as Attribute).displayName) || '-',
				isRequired: (row) => {
					const attr = row as Attribute;
					return (
						<Badge color={attr.isRequired ? 'red' : 'gray'}>
							{attr.isRequired ? 'Required' : 'Optional'}
						</Badge>
					);
				},
				values: (row) => {
					const attr = row as Attribute;
					const values = attributeValuesByAttributeId[attr.id] ?? [];
					return (
						<Group gap='xs' wrap='wrap'>
							{values.length > 0
								? values.map((value) => (
									<Badge key={value.id} variant='light' color='blue'>
										{toAttributeValueLabel(value)}
									</Badge>
								))
								: <Text size='sm' c='dimmed'>-</Text>}
						</Group>
					);
				},
			}}
			headerRenderers={{
				values: () => <>Values</>,
			}}
		/>
	);
};

type VariantsTabProps = {
	variants: Variant[];
	onManageVariants: () => void;
	onCreateVariant: () => void;
};

const VariantsTab: React.FC<VariantsTabProps> = ({
	variants,
	onManageVariants,
	onCreateVariant,
}) => (
	<Stack gap='md'>
		<Group justify='space-between' align='left' wrap='wrap'>
			<Group gap='xs'>
				<Button size='xs' variant='outline' onClick={onManageVariants}>Manage Variants</Button>
				<Button size='xs' onClick={onCreateVariant}>Create Variant</Button>
			</Group>
		</Group>

		<Divider />

		<VariantTable
			variants={variants}
			getVariantDetailLink={(variant) => `./variants/${variant.id}`}
			emptyMessage='No variants available.'
		/>
	</Stack>
);

export const ProductDetailPageBody: React.FC = () => {
	const navigate = useNavigate();
	const {
		isLoading,
		product,
		attributes: rawAttributes,
		variants: rawVariants,
		units,
		handleDeleteProduct,
		handleUpdateProduct,
	} = useProductDetailHandlers();

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

	const attributes = (rawAttributes ?? []) as Attribute[];
	const variants = (rawVariants ?? []) as Variant[];

	const sortedAttributes = React.useMemo(
		() => [...attributes].sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0)),
		[attributes],
	);

	const attributeValuesByAttributeId = React.useMemo(() => {
		const grouped: Record<string, AttributeValue[]> = {};
		variants.forEach((variant) => {
			if (!variant.attributeValues || variant.attributeValues.length === 0) return;
			variant.attributeValues.forEach((value) => {
				const list = grouped[value.attributeId] ?? [];
				if (!list.some((existing) => existing.id === value.id)) {
					list.push(value);
					grouped[value.attributeId] = list;
				}
			});
		});

		return grouped;
	}, [variants]);

	const productImages = React.useMemo(() => {
		if (!product) return [];
		const legacyImages = ((product as { images?: string[] } | null)?.images ?? []);
		const candidateImages = [
			product?.thumbnailURL,
			...legacyImages,
			...variants.map((variant) => variant.imageUrl),
		];

		const validImages = candidateImages.filter((image): image is string => Boolean(image));
		return Array.from(new Set(validImages));
	}, [product, variants]);

	React.useEffect(() => {
		if (productImages.length === 0 && selectedImageIndex !== 0) {
			setSelectedImageIndex(0);
			return;
		}

		if (selectedImageIndex > productImages.length - 1) {
			setSelectedImageIndex(0);
		}
	}, [productImages, selectedImageIndex]);

	const handleSave = React.useCallback((rawValues: Record<string, unknown>) => {
		handleUpdateProduct({
			status: rawValues.status as string | undefined,
			unitId: toOptionalTrimmedString(rawValues.unitId),
			thumbnailURL: toOptionalTrimmedString(rawValues.thumbnailURL),
		});
	}, [handleUpdateProduct]);

	const handleManageVariants = React.useCallback(() => {
		navigate('variants', { relative: 'path' });
	}, [navigate]);

	const handleCreateVariant = React.useCallback(() => {
		navigate('variants/create', { relative: 'path' });
	}, [navigate]);

	const handleSelectImage = React.useCallback((index: number) => {
		setSelectedImageIndex(index);
	}, []);

	if (isLoading) {
		return <LoadingState />;
	}

	if (!product) {
		return <NotFound onGoBack={handleGoBack} messageKey='nikki.inventory.product.notFound' />;
	}

	const productName = JsonToString(product.name) || product.id;

	const productFormValue = {
		name: JsonToString(product.name),
		description: JsonToString(product.description),
		thumbnailURL: product.thumbnailURL ?? '',
		unitId: product.unitId ?? '',
		status: product.status,
	};

	const productSummaryData: Record<string, unknown> = {
		sku: product.sku,
		barCode: product.barCode,
		proposedPrice: product.proposedPrice,
		defaultVariantId: product.defaultVariantId,
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={PRODUCT_SCHEMA}
				modelLoading={isLoading}
				modelValue={productFormValue}
			>
				{({ handleSubmit }) => (
					<PageContainer
						actionBar={(
							<DetailActionBar
								onSave={() => void handleSubmit(handleSave)()}
								onGoBack={handleGoBack}
								onDelete={() => void handleDeleteProduct()}
							/>
						)}
					>
						<Stack gap='md'>
							<Group justify='space-between' align='center' wrap='wrap'>
								<Group gap='xs' align='center'>
									<Title order={2}>{productName}</Title>
								</Group>
								<Text size='sm' c='dimmed'>SKU: {product.sku || '-'}</Text>
							</Group>

							<Tabs defaultValue='product-info'>
								<Tabs.List>
									<Tabs.Tab value='product-info'>Product Info</Tabs.Tab>
									<Tabs.Tab value='attributes'>Attributes</Tabs.Tab>
									<Tabs.Tab value='variants'>Variants</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value='product-info' pt='md'>
									<ProductInfoTab
										productName={productName}
										units={units}
										isSubmitting={isLoading}
										productSummaryData={productSummaryData}
										productImages={productImages}
										selectedImageIndex={selectedImageIndex}
										onSelectImage={handleSelectImage}
									/>
								</Tabs.Panel>

								<Tabs.Panel value='attributes' pt='md'>
									<AttributesTab
										attributes={sortedAttributes}
										attributeValuesByAttributeId={attributeValuesByAttributeId}
									/>
								</Tabs.Panel>

								<Tabs.Panel value='variants' pt='md'>
									<VariantsTab
										variants={variants}
										onManageVariants={handleManageVariants}
										onCreateVariant={handleCreateVariant}
									/>
								</Tabs.Panel>
							</Tabs>
						</Stack>
					</PageContainer>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};

export const ProductDetailPage: React.FC = withWindowTitle('Product Detail', ProductDetailPageBody);
