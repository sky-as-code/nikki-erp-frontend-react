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
	TextInput,
	Select,
	Image,
} from '@mantine/core';
import {
	AutoTable,
	ConfirmModal,
	NotFound,
	withWindowTitle,
	LoadingState
} from '@nikkierp/ui/components';
import {
	FormFieldProvider,
	FormStyleProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconArrowLeft, IconCheck, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { ControlPanel } from '../../components/ControlPanel';
import { ImageGallery } from '../../components/ImageGallery';
import { PageContainer } from '../../components/PageContainer';
import { useProductDetailHandlers } from '../../features/product/hooks/useProductDetail';
import { listAttributeValues } from '../../features/attributeValue/attributeValueSlice';
import { variantActions } from '../../appState/variant';
import { JsonToString, StringToJson } from '../../utils/serializer';
import attributeSchema from '../../schemas/attribute-schema.json';
import productSchema from '../../schemas/product-schema.json';
import variantSchema from '../../schemas/variant-schema.json';

import type { Attribute } from '../../features/attribute/types';
import type { AttributeValue } from '../../features/attributeValue/types';
import type { Variant } from '../../features/variant/types';
import type { ModelSchema } from '@nikkierp/ui/model';

const ATTRIBUTE_SCHEMA = attributeSchema as ModelSchema;
const PRODUCT_SCHEMA = productSchema as ModelSchema;
const VARIANT_SCHEMA = variantSchema as ModelSchema;
const ATTRIBUTE_COLUMNS = ['codeName', 'displayName', 'dataType', 'isRequired', 'sortIndex'];
const VARIANT_COLUMNS = ['sku', 'name', 'barcode', 'proposedPrice', 'status'];

function toOptionalTrimmedString(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
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

export const ProductDetailPageBody: React.FC = () => {
	const navigate = useNavigate();
	const { productId } = useParams();
	const dispatch = useMicroAppDispatch();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const {
		isLoading,
		product,
		attributes: rawAttributes,
		variants: rawVariants,
		handleDeleteProduct,
		handleUpdateProduct,
		handleDeleteAttribute,
		handleDeleteVariant,
	} = useProductDetailHandlers();

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleCreateAttribute = React.useCallback(() => {
		navigate('attributes/create', { relative: 'path' });
	}, [navigate]);

	const handleCreateVariant = React.useCallback(() => {
		navigate('variants/create', { relative: 'path' });
	}, [navigate]);

	const [deleteTarget, setDeleteTarget] = React.useState<{
		kind: 'attribute' | 'variant';
		id: string;
		label: string;
	} | null>(null);

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
			await handleDeleteAttribute(target.id);
			return;
		}

		await handleDeleteVariant(target.id);
	}, [deleteTarget, handleDeleteAttribute, handleDeleteVariant]);

	const [isEditingProduct, setIsEditingProduct] = React.useState(false);
	const [productFormVersion, setProductFormVersion] = React.useState(0);

	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
	const [activeTab, setActiveTab] = React.useState<string | null>('product-info');
	const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
	const [attributeValuesByAttributeId, setAttributeValuesByAttributeId] = React.useState<Record<string, AttributeValue[]>>({});
	const [attributeValuesLoading, setAttributeValuesLoading] = React.useState(false);
	const [isEditingVariant, setIsEditingVariant] = React.useState(false);
	const [editedVariantData, setEditedVariantData] = React.useState<{
		sku: string;
		barcode: string;
		imageURL: string;
		proposedPrice: number;
		status: string;
	}>({
		sku: '',
		barcode: '',
		imageURL: '',
		proposedPrice: 0,
		status: 'active',
	});
	const [isUpdatingVariant, setIsUpdatingVariant] = React.useState(false);

	const attributes = (rawAttributes ?? []) as Attribute[];
	const variants = (rawVariants ?? []) as Variant[];

	const sortedAttributes = React.useMemo(
		() => [...attributes].sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0)),
		[attributes],
	);

	const productImages = React.useMemo(() => {
		if (!product) return [];
		const legacyImages = ((product as { images?: string[] } | null)?.images ?? []);
		const candidateImages = [
			product?.thumbnailURL,
			...legacyImages,
			...variants.map((variant) => variant.imageURL).filter((url): url is string => Boolean(url)),
		];

		const validImages = candidateImages.filter((image): image is string => Boolean(image));
		return Array.from(new Set(validImages));
	}, [product, variants]);

	// Load attribute values for each attribute
	React.useEffect(() => {
		if (!orgId || !productId || attributes.length === 0) {
			setAttributeValuesByAttributeId({});
			setAttributeValuesLoading(false);
			return;
		}

		const loadAttributeValues = async () => {
			const valuesByAttrId: Record<string, AttributeValue[]> = {};
			setAttributeValuesLoading(true);

			await Promise.all(
				attributes.map(async (attr) => {
					try {
						const result = await dispatch(
							listAttributeValues({
								orgId,
								productId,
								attributeId: attr.id,
							}) as any,
						).unwrap();
						valuesByAttrId[attr.id] = result.items;
					}
					catch (error) {
						console.error(`Failed to load values for attribute ${attr.id}:`, error);
						valuesByAttrId[attr.id] = [];
					}
				}),
			);

			setAttributeValuesByAttributeId(valuesByAttrId);
			setAttributeValuesLoading(false);
		};

		void loadAttributeValues();
	}, [orgId, productId, attributes, dispatch]);

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
			return value.valueBool ? 'Yes' : 'No';
		}

		return value.valueRef ?? value.id;
	}, []);

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

	const selectedVariantFromDefault = React.useMemo(() => {
		if (!product?.defaultVariantId) {
			return null;
		}

		return variants.find((variant) => variant.id === product.defaultVariantId) ?? null;
	}, [product?.defaultVariantId, variants]);

	const selectedVariant = selectedVariantFromAttributes ?? selectedVariantFromDefault;
	const hydratedDefaultImageVariantIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		hydratedDefaultImageVariantIdRef.current = null;
		setSelectedAttributes({});
		setSelectedImageIndex(0);
	}, [productId]);

	const selectedVariantImageIndex = React.useMemo(() => {
		if (!selectedVariant?.imageURL) {
			return -1;
		}

		return productImages.findIndex((image) => image === selectedVariant.imageURL);
	}, [productImages, selectedVariant]);

	React.useEffect(() => {
		if (selectedVariantFromAttributes && selectedVariantImageIndex >= 0 && selectedVariantImageIndex !== selectedImageIndex) {
			setSelectedImageIndex(selectedVariantImageIndex);
		}
	}, [selectedImageIndex, selectedVariantFromAttributes, selectedVariantImageIndex]);

	React.useEffect(() => {
		if (!selectedVariantFromDefault?.imageURL) {
			return;
		}

		if (hydratedDefaultImageVariantIdRef.current === selectedVariantFromDefault.id) {
			return;
		}

		const defaultImageIndex = productImages.findIndex((image) => image === selectedVariantFromDefault.imageURL);
		if (defaultImageIndex < 0) {
			return;
		}

		hydratedDefaultImageVariantIdRef.current = selectedVariantFromDefault.id;
		if (defaultImageIndex !== selectedImageIndex) {
			setSelectedImageIndex(defaultImageIndex);
		}
	}, [productImages, selectedImageIndex, selectedVariantFromDefault]);

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
		setSelectedImageIndex(0);
	}, []);

	const handleSave = React.useCallback((rawValues: Record<string, unknown>) => {
		handleUpdateProduct({
			name: StringToJson(JsonToString(rawValues.name)),
			description: StringToJson(JsonToString(rawValues.description)),
			status: rawValues.status as string | undefined,
			unitId: toOptionalTrimmedString(rawValues.unitId),
			thumbnailURL: toOptionalTrimmedString(rawValues.thumbnailURL),
		});
	}, [handleUpdateProduct]);

	const handleStartEditProduct = React.useCallback(() => {
		setIsEditingProduct(true);
	}, []);

	const handleCancelEditProduct = React.useCallback(() => {
		setIsEditingProduct(false);
		setProductFormVersion((version) => version + 1);
	}, []);

	const handleSelectImage = React.useCallback((index: number) => {
		setSelectedImageIndex(index);
	}, []);

	// Update selected variant data when selectedVariant changes
	React.useEffect(() => {
		if (selectedVariantFromAttributes) {
			setEditedVariantData({
				sku: selectedVariantFromAttributes.sku || '',
				barcode: selectedVariantFromAttributes.barcode || '',
				imageURL: selectedVariantFromAttributes.imageURL || '',
				proposedPrice: selectedVariantFromAttributes.proposedPrice || 0,
				status: selectedVariantFromAttributes.status || 'active',
			});
			setIsEditingVariant(false);
		}
	}, [selectedVariantFromAttributes]);

	// Handle update variant
	const handleUpdateVariant = React.useCallback(async () => {
		if (!selectedVariantFromAttributes || !productId) return;

		setIsUpdatingVariant(true);
		try {
			await dispatch(variantActions.updateVariant({
				orgId,
				productId,
				data: {
					id: selectedVariantFromAttributes.id,
					etag: selectedVariantFromAttributes.etag,
					sku: editedVariantData.sku || undefined,
					barcode: editedVariantData.barcode || undefined,
					imageURL: editedVariantData.imageURL || undefined,
					proposedPrice: editedVariantData.proposedPrice,
					status: editedVariantData.status,
				} as any,
			}) as any).unwrap();
			setIsEditingVariant(false);
		} catch (error) {
			console.error('Failed to update variant:', error);
		} finally {
			setIsUpdatingVariant(false);
		}
	}, [selectedVariantFromAttributes, productId, orgId, dispatch, editedVariantData]);

	if (isLoading) {
		return (
			<PageContainer actionBar={<div />}>
				<LoadingState />
			</PageContainer>
		);
	}

	if (!product) {
		return (
			<PageContainer actionBar={<div />}>
				<NotFound onGoBack={handleGoBack} messageKey='nikki.inventory.product.notFound' />
			</PageContainer>
		);
	}

	const productName = JsonToString(product.name) || product.id;

	const productFormValue = {
		name: JsonToString(product.name),
		description: JsonToString(product.description),
		thumbnailURL: product.thumbnailURL ?? '',
		unitId: product.unitId ?? '',
		status: product.status,
	};

	const displaySku = selectedVariant?.sku || product.sku || '-';
	const displayBarcode = selectedVariant?.barcode || product.barCode || '-';
	const displayProposedPrice = selectedVariant?.proposedPrice ?? product.proposedPrice ?? 0;
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '../products' },
		{ title: productName, href: '#' },
	];

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				key={`${productId ?? 'product'}-${productFormVersion}`}
				formVariant='update'
				modelSchema={PRODUCT_SCHEMA}
				modelLoading={isLoading}
				modelValue={productFormValue}
			>
				{({ handleSubmit }) => {
					const handleSaveClick = () => {
						void handleSubmit(async (values) => {
							handleSave(values);
							setIsEditingProduct(false);
							setProductFormVersion((version) => version + 1);
						})();
					};

					return (
						<>
							<PageContainer
								breadcrumbs={breadcrumbs}
								sections={[
									<ControlPanel
										actions={isEditingProduct
											? [
												{
													label: 'Quay lại',
													variant: 'outline',
													leftSection: <IconArrowLeft size={16} />,
													onClick: handleGoBack,
												},
												{
													label: 'Lưu',
													leftSection: <IconDeviceFloppy size={16} />,
													onClick: handleSaveClick,
												},
												{
													label: 'Hủy',
													variant: 'outline',
													leftSection: <IconX size={16} />,
													onClick: handleCancelEditProduct,
												},
											]
											: [
												{
													label: 'Quay lại',
													variant: 'outline',
													leftSection: <IconArrowLeft size={16} />,
													onClick: handleGoBack,
												},
												{
													label: 'Chỉnh Sửa',
													leftSection: <IconEdit size={16} />,
													onClick: handleStartEditProduct,
												},
												{
													label: 'Xóa',
													variant: 'outline',
													color: 'red',
													leftSection: <IconTrash size={16} />,
													onClick: () => void handleDeleteProduct(),
												},
											]}
									/>,
								]}
							>
						<Stack gap='md'>
							<Group gap='md' align='center' wrap='nowrap'>
								<Avatar size={52} radius='md' src={productImages[0]}>
									{productName.charAt(0).toUpperCase()}
								</Avatar>
								<Stack gap={4}>
									<Group gap='xs' align='center'>
										<Text size='xl' fw={700} style={{ lineHeight: 1.3 }}>{productName}</Text>
										{productFormValue.status && (
											<Badge size='md' color={product.status === 'active' ? 'green' : 'red'} variant='light'>
												{productFormValue.status}
											</Badge>
										)}
									</Group>
								</Stack>
							</Group>

							<Divider />

							{/* Tabs */}
							<Tabs value={activeTab} onChange={setActiveTab}>
								<Tabs.List>
									<Tabs.Tab value='product-info'>Product Info</Tabs.Tab>
									<Tabs.Tab value='attributes'>
										Attributes
									</Tabs.Tab>
									<Tabs.Tab value='variants'>
										Variants
									</Tabs.Tab>
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
															onSelect={handleSelectImage}
															altBase={productName}
															fillHeight
														/>
													) : (
														<Paper p='xl' withBorder bg='gray.0' style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
															<Text c='dimmed' ta='center'>
																No images available.
																<br />
																Add variants with images to see them here.
															</Text>
														</Paper>
													)}
												</Stack>
											</Grid.Col>

											{/* Right Column - Product Form */}
											<Grid.Col span={{ base: 12, md: 7 }}>
												<Stack gap='lg' >
													{/* Combined Product Info, Details & Variants */}
													<Paper p='md' withBorder >
														<Stack gap='md'>
															{/* Basic Information Section */}
															{isEditingProduct ? (
																<Stack gap='md'>
																	<AutoField name='name' autoFocused inputProps={{ disabled: false }} />
																	<AutoField name='status' inputProps={{ disabled: false }} />
																	<AutoField name='description' inputProps={{ disabled: false }} />
																	<AutoField name='thumbnailURL' inputProps={{ disabled: false }} />
																</Stack>
															) : (
																<div>
																	<Grid gutter="md">
																		{/* Row 1: Name */}
																		<Grid.Col span={{ base: 12, sm: 6 }}>
																			<Text size="md" c="dimmed">Name</Text>
																			<Text size="md" fw={500}>{productName}</Text>
																		</Grid.Col>

																		{/* Row 1: Status */}
																		<Grid.Col span={{ base: 12, sm: 6 }}>
																			<Text size="md" c="dimmed">Status</Text>
																			<Badge color={product.status === 'active' ? 'green' : 'red'}>
																				{product.status}
																			</Badge>
																		</Grid.Col>

																		{/* Row 2: Description (full width) */}
																		<Grid.Col span={12}>
																			<Text size="md" c="dimmed">Description</Text>
																			<Text size="md" fw={500}>
																				{JsonToString(product.description) || '-'}
																			</Text>
																		</Grid.Col>

																		<Grid.Col span={{ base: 12, sm: 12 }}>
																			<Text size="md" c="dimmed">Thumbnail</Text>
																			<Text size="md" fw={500}>{product.thumbnailURL || '-'}</Text>
																		</Grid.Col>

																		{/* Row 3: SKU - Barcode - Unit */}
																		<Grid.Col span={{ base: 6, sm: 4 }}>
																			<Text size="md" c="dimmed">SKU</Text>
																			<Text size="md" fw={500}>{displaySku}</Text>
																		</Grid.Col>

																		<Grid.Col span={{ base: 6, sm: 4 }}>
																			<Text size="md" c="dimmed">Barcode</Text>
																			<Text size="md" fw={500}>{displayBarcode}</Text>
																		</Grid.Col>

																		<Grid.Col span={{ base: 6, sm: 4 }}>
																			<Text size="md" c="dimmed">Unit</Text>
																			<Text size="md" fw={500}>{product.unitId || '-'}</Text>
																		</Grid.Col>

																		{/* Row 4: Price */}
																		<Grid.Col span={{ base: 6, sm: 4 }}>
																			<Text size="md" c="dimmed">Proposed Price</Text>
																			<Text size="md" fw={500}>{displayProposedPrice}</Text>
																		</Grid.Col>
																	</Grid>
																</div>
															)}

															{/* Attribute Selection Section */}
															{sortedAttributes.length > 0 && (
																<>
																	<Divider />
																	<div>
											<Group justify='space-between' align='center'>
																		{Object.keys(selectedAttributes).length > 0 && (
																			<Button
																				variant='subtle'
																				size='md'
																				onClick={handleResetAttributes}
																			>
																				Reset
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
																	<Text size='sm' c='dimmed'>Loading attribute values...</Text>
																) : values.length === 0 ? (
																	<Text size='sm' c='dimmed'>No attribute values available.</Text>
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
														<Text size='md' c='dimmed'>Created At</Text>
														<Text size='md'>{product.createdAt ? new Date(product.createdAt).toLocaleString() : '--'}</Text>
													</Grid.Col>
													<Grid.Col span={{ base: 6, sm: 4 }}>
														<Text size='md' c='dimmed'>Updated At</Text>
														<Text size='md'>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '--'}</Text>
													</Grid.Col>
												</Grid>
											</Stack>

											{/* Variant Editor Section */}
											{Object.keys(selectedAttributes).length > 0 && (
												<>
													<Divider />
													{selectedVariantFromAttributes ? (
														// Edit Variant Form
														<Paper p='md' withBorder bg='green.0'>
															<Stack gap='md'>
																<Group justify='space-between' align='center'>
																	<Group gap='xs'>
																		<IconCheck size={20} color='green' />
																		<Text size='md' fw={600}>Variant Found</Text>
																	</Group>
																	{!isEditingVariant && (
																		<Button
																			size='xs'
																			onClick={() => setIsEditingVariant(true)}
																		>
																			Edit
																		</Button>
																	)}
																</Group>

																{selectedVariant?.imageURL && (
																	<Image
																		src={selectedVariant?.imageURL}
																		alt={JsonToString(selectedVariant?.name)}
																		h={150}
																		fit='cover'
																		radius='md'
																	/>
																)}

																{isEditingVariant ? (
																	<Stack gap='md'>
																		<TextInput
																			label='SKU'
																			value={editedVariantData.sku}
																			onChange={(e) => setEditedVariantData({ ...editedVariantData, sku: e.currentTarget.value })}
																			placeholder='Enter SKU'
																		/>

																		<TextInput
																			label='Barcode'
																			value={editedVariantData.barcode}
																			onChange={(e) => setEditedVariantData({ ...editedVariantData, barcode: e.currentTarget.value })}
																			placeholder='Enter barcode'
																		/>

																		<TextInput
																			label='Image URL'
																			value={editedVariantData.imageURL}
																			onChange={(e) => setEditedVariantData({ ...editedVariantData, imageURL: e.currentTarget.value })}
																			placeholder='Enter image URL'
																		/>

																		<TextInput
																			type='number'
																			label='Proposed Price'
																			value={editedVariantData.proposedPrice}
																			onChange={(e) => setEditedVariantData({ ...editedVariantData, proposedPrice: parseFloat(e.currentTarget.value) || 0 })}
																			placeholder='0'
																		/>

																		<Select
																			label='Status'
																			value={editedVariantData.status}
																			onChange={(value) => setEditedVariantData({ ...editedVariantData, status: value || 'active' })}
																			data={[
																				{ value: 'active', label: 'Active' },
																				{ value: 'inactive', label: 'Inactive' },
																			]}
																		/>

																		<Group>
																			<Button
																				onClick={handleUpdateVariant}
																				loading={isUpdatingVariant}
																				disabled={isUpdatingVariant}
																			>
																				Save Changes
																			</Button>
																			<Button
																				variant='subtle'
																				onClick={() => {
																					setIsEditingVariant(false);
																					if (selectedVariantFromAttributes) {
																						setEditedVariantData({
																							sku: selectedVariantFromAttributes.sku || '',
																							barcode: selectedVariantFromAttributes.barcode || '',
																							imageURL: selectedVariantFromAttributes.imageURL || '',
																							proposedPrice: selectedVariantFromAttributes.proposedPrice || 0,
																							status: selectedVariantFromAttributes.status || 'active',
																						});
																					}
																				}}
																			>
																				Cancel
																			</Button>
																		</Group>
																	</Stack>
																) : (
																	<Stack gap='xs'>
																		<Grid gutter='md'>
																			<Grid.Col span={{ base: 6, sm: 3 }}>
																				<Text size='xs' c='dimmed'>SKU</Text>
																				<Text size='sm' fw={500}>{selectedVariantFromAttributes.sku || '-'}</Text>
																			</Grid.Col>
																			<Grid.Col span={{ base: 6, sm: 3 }}>
																				<Text size='xs' c='dimmed'>Barcode</Text>
																				<Text size='sm' fw={500}>{selectedVariantFromAttributes.barcode || '-'}</Text>
																			</Grid.Col>
																			<Grid.Col span={{ base: 6, sm: 3 }}>
																				<Text size='xs' c='dimmed'>Proposed Price</Text>
																				<Text size='sm' fw={500}>{selectedVariantFromAttributes.proposedPrice || 0}</Text>
																			</Grid.Col>
																			<Grid.Col span={{ base: 6, sm: 3 }}>
																				<Text size='xs' c='dimmed'>Status</Text>
																				<Badge color={selectedVariantFromAttributes.status === 'active' ? 'green' : 'red'}>
																					{selectedVariantFromAttributes.status}
																				</Badge>
																			</Grid.Col>
																		</Grid>
																	</Stack>
																)}
															</Stack>
														</Paper>
													) : (
														// Out of Stock / No Variant Found
														<Paper p='md' withBorder bg='yellow.0'>
															<Stack gap='md' align='center'>
																<Text size='md' fw={600} c='orange'>
																	No Variant Available
																</Text>
																<Text size='sm' c='dimmed' ta='center'>
																	This combination of attributes is not available. Please select different attribute values.
																</Text>
															</Stack>
														</Paper>
													)}
												</>
											)}
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
										<Group justify="flex-end">
											<Button
												size="md"
												variant="light"
												onClick={handleCreateAttribute}
											>
												Create Attribute
											</Button>

										</Group>

										{sortedAttributes.length === 0 ? (
											<Paper p='xl' withBorder>
												<Text c='dimmed' ta='center'>
													No attributes found. Click "Manage Attributes" to add attributes to this product.
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
															actions: () => 'Action',
														}}
												/>
											</Paper>
										)}
									</Stack>
								</Tabs.Panel>

								{/* Variants Tab */}
								<Tabs.Panel value='variants' pt='md'>
									<Stack gap='md'>
										<Group justify="flex-end">
											<Group gap='xs'>
												<Button
													size='md'
													variant='light'
													onClick={handleCreateVariant}
												>
													Create Variant
												</Button>
											</Group>
										</Group>

										{variants.length === 0 ? (
											<Paper p='xl' withBorder>
												<Text c='dimmed' ta='center'>
													No variants found. Click "Create Variant" to add a variant to this product.
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
														proposedPrice: (row) => `${(((row as Variant).proposedPrice ))}`,
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
														actions: () => 'Action',
													}}
												/>
											</Paper>
										)}
									</Stack>
								</Tabs.Panel>
							</Tabs>
						</Stack>
							</PageContainer>
							<ConfirmModal
								opened={deleteTarget !== null}
								onClose={() => setDeleteTarget(null)}
								onConfirm={() => void handleConfirmDelete()}
								title={deleteTarget?.kind === 'attribute' ? 'Delete attribute' : 'Delete variant'}
								message={deleteTarget ? `Delete ${deleteTarget.kind} "${deleteTarget.label}"?` : undefined}
								confirmLabel='Delete'
								confirmColor='red'
							/>
						</>
					);
				}}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};

export const ProductDetailPage: React.FC = withWindowTitle('Product Detail', ProductDetailPageBody);
