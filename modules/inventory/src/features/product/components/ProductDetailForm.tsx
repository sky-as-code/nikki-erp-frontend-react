/* eslint-disable max-lines-per-function */
import {
	Badge,
	Avatar,
	ActionIcon,
	Button,
	Divider,
	Grid,
	Group,
	Paper,
	Stack,
	Tabs,
	Text,
} from '@mantine/core';
import {
	AutoTable,
	ConfirmModal,
} from '@nikkierp/ui/components';
import {
	FormFieldProvider,
	FormStyleProvider,
	AutoField,
	FormContainer,
} from '@nikkierp/ui/components/form';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ImageGallery } from '../../../components/ImageGallery';
import { JsonToString } from '../../../utils/serializer';
import attributeSchema from '../../../schemas/attribute-schema.json';
import variantSchema from '../../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Product } from '../types';
import type { Attribute } from '../../attribute/types';
import type { AttributeValue } from '../../attributeValue/types';
import type { Variant } from '../../variant/types';
import { useNavigate } from 'react-router';

const ATTRIBUTE_SCHEMA = attributeSchema as ModelSchema;
const VARIANT_SCHEMA = variantSchema as ModelSchema;
const ATTRIBUTE_COLUMNS = ['codeName', 'displayName', 'dataType', 'isRequired', 'sortIndex'];
const VARIANT_COLUMNS = ['sku', 'name', 'barcode', 'proposedPrice', 'status'];
const UPDATE_FORM_FIELDS = ['name', 'status', 'description', 'thumbnailURL'];

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

interface ProductDetailFormProps {
	schema: ModelSchema;
	productDetail: Product | undefined;
	isLoading: boolean;
	isEditing: boolean;
	productImages: string[];
	selectedImageIndex: number;
	onSelectImage: (index: number) => void;
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
	attributes: Attribute[];
	variants: Variant[];
	attributeValuesByAttributeId: Record<string, AttributeValue[]>;
	attributeValuesLoading: boolean;
	onDeleteAttribute: (attributeId: string) => void | Promise<void>;
	onDeleteVariant: (variantId: string) => void | Promise<void>;
}

export const ProductDetailForm = ({
	schema,
	productDetail,
	isLoading,
	isEditing,
	productImages,
	selectedImageIndex,
	onSelectImage,
	onSubmit,
	attributes,
	variants,
	attributeValuesByAttributeId,
	attributeValuesLoading,
	onDeleteAttribute,
	onDeleteVariant,
}: ProductDetailFormProps): React.ReactElement => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = React.useState<string | null>('product-info');
	const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
	const [deleteTarget, setDeleteTarget] = React.useState<{
		kind: 'attribute' | 'variant';
		id: string;
		label: string;
	} | null>(null);

	const sortedAttributes = React.useMemo(
		() => [...attributes].sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0)),
		[attributes],
	);

	// Helper function to get attribute value label
	const getAttributeValueLabel = React.useCallback((value: AttributeValue): string => {
		const localizedText = JsonToString(value.valueText);
		if (localizedText) {
			return localizedText;
		}

		if (typeof value.valueNumber === 'number') {
			return String(value.valueNumber);
		}

		if (typeof value.valueBool === 'boolean') {
			return value.valueBool ? t('nikki.general.boolean.yes') : t('nikki.general.boolean.no');
		}

		return value.valueRef ?? value.id;
	}, [t]);

	// Helper to get candidates from AttributeValue
	const getAttributeValueCandidates = React.useCallback((value: AttributeValue): Array<string | number | boolean> => {
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
			candidates.push(value.valueBool, value.valueBool ? 'true' : 'false');
		}

		if (typeof value.valueRef === 'string') {
			candidates.push(value.valueRef);
		}

		return Array.from(new Set(candidates));
	}, []);

	// Helper to get candidates from variant attribute value
	const getVariantAttributeCandidates = React.useCallback((value: unknown): Array<string | number | boolean> => {
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			return [value];
		}

		if (!value || typeof value !== 'object') {
			return [];
		}

		const record = value as Record<string, unknown>;
		const candidates: Array<string | number | boolean> = [];

		if (typeof record.value === 'string' || typeof record.value === 'number' || typeof record.value === 'boolean') {
			candidates.push(record.value);
		}

		if (typeof record.valueText === 'string') {
			candidates.push(record.valueText);
		}
		else if (record.valueText && typeof record.valueText === 'object') {
			candidates.push(...Object.values(record.valueText as Record<string, unknown>).filter(
				(item): item is string | number | boolean => (
					typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
				),
			));
		}

		if (typeof record.valueNumber === 'number') {
			candidates.push(record.valueNumber);
		}

		if (typeof record.valueBool === 'boolean') {
			candidates.push(record.valueBool);
		}

		if (typeof record.valueRef === 'string') {
			candidates.push(record.valueRef);
		}

		if (typeof record.id === 'string') {
			candidates.push(record.id);
		}

		return Array.from(new Set(candidates));
	}, []);

	const selectedVariantFromAttributes = React.useMemo(() => {
		if (Object.keys(selectedAttributes).length === 0) return null;

		const requiredAttributes = sortedAttributes.filter((attr) => attr.isRequired);
		const allRequiredSelected = requiredAttributes.every((attr) => Boolean(selectedAttributes[attr.id]));

		if (!allRequiredSelected) return null;

		return variants.find((variant: Variant) => {
			return Object.entries(selectedAttributes).every(([attributeId, valueId]) => {
				const attribute = attributes.find((attr) => attr.id === attributeId);
				if (!attribute) return false;

				const selectedValue = attributeValuesByAttributeId[attributeId]?.find((v) => v.id === valueId);
				if (!selectedValue) return false;

				const variantAttributeValue = getVariantAttributeValue(variant.attributes, attribute.codeName);
				const variantCandidates = new Set(getVariantAttributeCandidates(variantAttributeValue));
				return getAttributeValueCandidates(selectedValue).some((candidate) => variantCandidates.has(candidate));
			});
		});
	}, [selectedAttributes, variants, sortedAttributes, attributes, attributeValuesByAttributeId, getAttributeValueCandidates, getVariantAttributeCandidates]);

	const defaultVariant = variants.find((variant) => variant.id === productDetail?.defaultVariantId) || null;
	const selectedVariant = selectedVariantFromAttributes || defaultVariant;

	React.useEffect(() => {
		setSelectedAttributes({});
	}, [productDetail]);

	const selectedVariantImageIndex = React.useMemo(() => {
		if (!selectedVariant?.imageURL) {
			return -1;
		}

		return productImages.findIndex((image) => image === selectedVariant.imageURL);
	}, [productImages, selectedVariant]);

	React.useEffect(() => {
		if (selectedVariantFromAttributes && selectedVariantImageIndex >= 0 && selectedVariantImageIndex !== selectedImageIndex) {
			onSelectImage(selectedVariantImageIndex);
		}
	}, [selectedImageIndex, selectedVariantFromAttributes, selectedVariantImageIndex, onSelectImage]);

	// Handle attribute selection
	const handleAttributeSelect = React.useCallback((attributeId: string, valueId: string | null) => {
		setSelectedAttributes((prev) => {
			if (!valueId) {
				const newState = { ...prev };
				delete newState[attributeId];
				return newState;
			}
			return { ...prev, [attributeId]: valueId };
		});
	}, []);

	// Reset all selections
	const handleResetAttributes = React.useCallback(() => {
		setSelectedAttributes({});
	}, []);

	const handleOpenAttributeDelete = React.useCallback((attribute: Attribute) => {
		setDeleteTarget({
			kind: 'attribute',
			id: attribute.id,
			label: JsonToString(attribute.displayName) || attribute.codeName || attribute.id,
		});
	}, []);

	const handleOpenVariantDelete = React.useCallback((variant: Variant) => {
		setDeleteTarget({
			kind: 'variant',
			id: variant.id,
			label: variant.sku || JsonToString(variant.name) || variant.id,
		});
	}, []);

	const handleConfirmDelete = React.useCallback(async () => {
		if (!deleteTarget) {
			return;
		}

		const target = deleteTarget;
		setDeleteTarget(null);

		if (target.kind === 'attribute') {
			await onDeleteAttribute(target.id);
			return;
		}

		await onDeleteVariant(target.id);
	}, [deleteTarget, onDeleteAttribute, onDeleteVariant]);

	const productName = productDetail ? JsonToString(productDetail.name) : 'Product Detail';
	const updateSchema = React.useMemo((): ModelSchema => ({
		...schema,
		fields: Object.fromEntries(
			Object.entries(schema.fields).map(([key, field]) => [
				key,
				UPDATE_FORM_FIELDS.includes(key) ? field : { ...field, frontendOnly: true },
			]),
		),
	}), [schema]);

	const getStatusLabel = (status: string | undefined) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: t('nikki.general.status.active') },
			inactive: { color: 'gray', label: t('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status || ''] || { color: 'gray', label: status || '-' };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const modelValue ={
		...productDetail,
		name: JsonToString(productDetail?.name) || '',
		description: JsonToString(productDetail?.description) || '',
	};

	return (
		<>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={updateSchema}
					modelValue={modelValue}
					modelLoading={isLoading}
				>
					{({ handleSubmit: formHandleSubmit}) => {
						return (
							<Stack gap='md'>
								{/* Header */}
								<Group gap='md' align='center' wrap='nowrap'>
										<Avatar size={52} radius='md' src={productImages[0]}>
											{productName.charAt(0).toUpperCase()}
										</Avatar>
										<Stack gap={4}>
											<Group gap='xs' align='center'>
												<Text size='xl' fw={700} style={{ lineHeight: 1.3 }}>{productName}</Text>
												{getStatusLabel(productDetail?.status)}
											</Group>
										</Stack>
									</Group>

									<Divider />

									{/* Tabs */}
									<Tabs value={activeTab} onChange={setActiveTab}>
										<Tabs.List>
										<Tabs.Tab value='product-info'>{t('nikki.inventory.product.tabs.info')}</Tabs.Tab>
										<Tabs.Tab value='attributes'>{t('nikki.inventory.attribute.title')}</Tabs.Tab>
										<Tabs.Tab value='variants'>{t('nikki.inventory.variant.title')}</Tabs.Tab>
										</Tabs.List>

										{/* Product Info Tab */}
										<Tabs.Panel value='product-info' pt='md'>
											<Paper p='md' withBorder>
												<Grid gutter='xl'>
													{/* Left Column - Image Gallery */}
													<Grid.Col span={{ base: 12, md: 5 }}>
														<Stack gap='md' h='100%'>
															{productImages.length > 0 ? (
																<ImageGallery
																	images={productImages}
																	selectedIndex={selectedImageIndex}
																	onSelect={onSelectImage}
																	altBase={productName}
																	fillHeight
																/>
															) : (
																<Paper p='xl' withBorder bg='gray.0' style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
																	<Text c='dimmed' ta='center'>
																	{t('nikki.inventory.product.detail.noImages')}
																	<br />
																	{t('nikki.inventory.product.detail.noImagesHint')}
																	</Text>
																</Paper>
															)}
														</Stack>
													</Grid.Col>

													{/* Right Column - Product Form */}
													<Grid.Col span={{ base: 12, md: 7 }}>
														<Stack gap='lg'>
															<Paper p='md' withBorder>
																<Stack gap='md'>
{/* Basic Information Section - always rendered, readOnly when not editing */}
												<form id='product-detail-form' onSubmit={formHandleSubmit(onSubmit)} noValidate>
													<Stack gap='md'>
														<AutoField name='name' htmlProps={{ readOnly: !isEditing }} />
														<AutoField name='description' htmlProps={{ readOnly: !isEditing }} />
														<AutoField name='status' htmlProps={{ readOnly: !isEditing }} />
														<AutoField name='thumbnailURL' htmlProps={{ readOnly: !isEditing }} />
													</Stack>
												</form>

												{/* Variant read-only data */}
												<Grid gutter='md'>
													<Grid.Col span={{ base: 6, sm: 4 }}>
															<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.sku')}</Text>
															<Text size='md' fw={500}>{selectedVariant?.sku || '-'}</Text>
														</Grid.Col>
														<Grid.Col span={{ base: 6, sm: 4 }}>
															<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.barCode')}</Text>
															<Text size='md' fw={500}>{selectedVariant?.barcode || '-'}</Text>
														</Grid.Col>
														<Grid.Col span={{ base: 6, sm: 4 }}>
															<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.unitId')}</Text>
															<Text size='md' fw={500}>{productDetail?.unitId || '-'}</Text>
														</Grid.Col>
														<Grid.Col span={{ base: 6, sm: 4 }}>
															<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.proposedPrice')}</Text>
														<Text size='md' fw={500}>{selectedVariant?.proposedPrice}</Text>
													</Grid.Col>
												</Grid>

																	{/* Attribute Selection Section */}
																	{sortedAttributes.length > 0 && (
																		<>
																			<Divider />
																			<div>
																				<Group justify='space-between' align='center'>
																					{Object.keys(selectedAttributes).length > 0 && (
																						<Button
																							type='button'
																							variant='subtle'
																							size='md'
																							onClick={handleResetAttributes}
																						>
																							{t('nikki.inventory.product.detail.resetAttributes')}
																						</Button>
																					)}
																				</Group>

																				{/* Attribute Selection Grid */}
																				<Grid gutter='md' p='md'>
																					{sortedAttributes.map((attr) => {
																						const displayName = typeof attr.displayName === 'string'
																							? attr.displayName
																							: (attr.displayName as Record<string, string>)?.en;
																						const attributeLabel = displayName || attr.codeName || attr.id;
																						const values = attributeValuesByAttributeId[attr.id] || [];

																						return (
																							<Grid.Col key={attr.id} span={{ base: 12, sm: 6 }}>
																								<Stack gap='xs'>
																									<Group justify='space-between'>
																										<Text size='md' fw={500}>{attributeLabel}</Text>
																									</Group>

																									{attributeValuesLoading ? (
																										<Text size='sm' c='dimmed'>{t('nikki.inventory.attribute.messages.loadingValues')}</Text>
																									) : values.length === 0 ? (
																										<Text size='sm' c='dimmed'>{t('nikki.inventory.attribute.messages.noAttributeValues')}</Text>
																									) : (
																										<Group gap='xs' wrap='wrap'>
																											{values.map((value) => {
																												const isSelected = selectedAttributes[attr.id] === value.id;
																												return (
																													<Badge
																														key={value.id}
																														onClick={() => handleAttributeSelect(attr.id, isSelected ? null : value.id)}
																														variant={isSelected ? 'filled' : 'light'}
																														color={isSelected ? 'blue' : 'gray'}
																														style={{ cursor: 'pointer', transition: 'all 0.2s' }}
																														size='md'
																														p='xs'
																													>
																														{getAttributeValueLabel(value)}
																													</Badge>
																												);
																											})}
																										</Group>
																									)}
																								</Stack>
																							</Grid.Col>
																						);
																					})}
																				</Grid>

																				<Divider />

																				<Stack gap='xs' p='md'>
																					<Grid gutter='md'>
																						<Grid.Col span={{ base: 6, sm: 4 }}>
																							<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.createdAt')}</Text>
																							<Text size='md'>{productDetail?.createdAt || '--'}</Text>
																						</Grid.Col>
																						<Grid.Col span={{ base: 6, sm: 4 }}>
																							<Text size='md' c='dimmed'>{t('nikki.inventory.product.fields.updatedAt')}</Text>
																							<Text size='md'>{productDetail?.updatedAt || '--'}</Text>
																						</Grid.Col>
																					</Grid>
																				</Stack>

																				
																			</div>
																		</>
																	)}
																</Stack>
															</Paper>
														</Stack>
													</Grid.Col>
												</Grid>
											</Paper>
										</Tabs.Panel>

										{/* Attributes Tab */}
										<Tabs.Panel value='attributes' pt='md'>
											<Stack gap='md'>
												<Group justify='flex-end'>
													<Button
														type='button'
														size='md'
														variant='light'
														onClick={() => {
															navigate('attributes/create', { relative: 'path' });
														}}
													>
														{t('nikki.inventory.attribute.actions.createNew')}
													</Button>
												</Group>

												{sortedAttributes.length === 0 ? (
													<Paper p='xl' withBorder>
														<Text c='dimmed' ta='center'>
															{t('nikki.inventory.attribute.messages.emptyProductDetail')}
														</Text>
													</Paper>
												) : (
													<Paper p='md' withBorder>
														<AutoTable
															schema={ATTRIBUTE_SCHEMA}
															data={sortedAttributes as unknown as Record<string, unknown>[]}
															columns={[...ATTRIBUTE_COLUMNS, 'actions']}
															columnAsLink='codeName'
															columnAsLinkHref={(row) => `./attributes/${String((row as Attribute).id)}`}
															columnRenderers={{
																displayName: (row) => JsonToString((row as Attribute).displayName) || (row as Attribute).id,
																actions: (row) => (
																	<ActionIcon
																		aria-label='Delete attribute'
																		color='red'
																		variant='light'
																		onClick={() => handleOpenAttributeDelete(row as Attribute)}
																	>
																		<IconTrash size={16} />
																	</ActionIcon>
																),
															}}
															headerRenderers={{
																actions: () => t('nikki.general.actions.title'),
															}}
														/>
													</Paper>
												)}
											</Stack>
										</Tabs.Panel>

										{/* Variants Tab */}
										<Tabs.Panel value='variants' pt='md'>
											<Stack gap='md'>
												<Group justify='flex-end'>
													<Group gap='xs'>
														<Button
															type='button'
															size='md'
															variant='light'
															onClick={() => {
																navigate('variants/create', { relative: 'path' });
															}}
														>
															{t('nikki.inventory.variant.actions.createNew')}
														</Button>
													</Group>
												</Group>

												{variants.length === 0 ? (
													<Paper p='xl' withBorder>
														<Text c='dimmed' ta='center'>
															{t('nikki.inventory.variant.messages.emptyProductDetail')}
														</Text>
													</Paper>
												) : (
													<Paper p='md' withBorder>
														<AutoTable
															schema={VARIANT_SCHEMA}
															columns={[...VARIANT_COLUMNS, 'actions']}
															data={variants as unknown as Record<string, unknown>[]}
															columnAsLink='sku'
															columnAsLinkHref={(row) => `./variants/${String((row as Variant).id)}`}
															columnRenderers={{
																name: (row) => JsonToString((row as Variant).name) || (row as Variant).id,
																proposedPrice: (row) => `${(((row as Variant).proposedPrice || 0))}`,
																status: (row) => {
																	const variant = row as Variant;
																	return (
																		<Badge color={variant.status === 'active' ? 'green' : 'red'}>
																			{variant.status}
																		</Badge>
																	);
																},
																actions: (row) => (
																	<ActionIcon
																		aria-label='Delete variant'
																		color='red'
																		variant='light'
																		onClick={() => handleOpenVariantDelete(row as Variant)}
																	>
																		<IconTrash size={16} />
																	</ActionIcon>
																),
															}}
															headerRenderers={{
																actions: () => t('nikki.general.actions.title'),
															}}
														/>
													</Paper>
												)}
											</Stack>
										</Tabs.Panel>
									</Tabs>
							</Stack>
						);
					}}
				</FormFieldProvider>
			</FormStyleProvider>

			<ConfirmModal
				opened={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => void handleConfirmDelete()}
				title={deleteTarget?.kind === 'attribute'
					? t('nikki.inventory.attribute.messages.confirmDeleteItemTitle')
					: t('nikki.inventory.variant.messages.confirmDeleteItemTitle')}
				message={deleteTarget
					? t(
						deleteTarget.kind === 'attribute'
							? 'nikki.inventory.attribute.messages.confirmDeleteItemMessage'
							: 'nikki.inventory.variant.messages.confirmDeleteItemMessage',
						{ label: deleteTarget.label },
					)
					: undefined}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

ProductDetailForm.displayName = 'ProductDetailForm';
