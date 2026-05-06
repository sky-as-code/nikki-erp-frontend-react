import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Grid,
	Group,
	Image,
	Paper,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import {
	AutoField,
	FormStyleProvider,
	FormFieldProvider,
} from '@nikkierp/ui/components/form';
import {
	IconBox,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { attributeService } from '../../attribute/attributeService';
import { JsonToString } from '../../../utils/serializer';

import type { Attribute } from '../../attribute/types';
import type { FieldConstraint, FieldDefinition, ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../types';


/* ===================== UTILS ===================== */

type EnumValueItem = number | Record<string, string>;

type VariantAttributeRow = {
	rowId: string;
	attributeId?: string;
	value?: string | number | Record<string, string>;
};

function createRowId(): string {
	return `row-${Math.random().toString(36).slice(2, 9)}`;
}

function getEnumValueLabel(item: EnumValueItem): string {
	if (typeof item === 'number') return String(item);
	if (typeof item === 'object' && item !== null) return item.vi || item.en || JSON.stringify(item);
	return JSON.stringify(item);
}

function serializeValue(value: string | number | Record<string, string>): string {
	if (typeof value === 'object' && value !== null) {
		const sorted = Object.fromEntries(
			Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
		);
		return JSON.stringify(sorted);
	}
	return String(value);
}

// Find the matching enum value using normalized comparison
function matchEnumValue(
	storedValue: unknown,
	enumValues: unknown[],
): string | number | Record<string, string> | undefined {
	for (const item of enumValues as EnumValueItem[]) {
		const actual = getEnumValueActual(item);

		if (typeof actual === 'number') {
			if (actual === storedValue || String(actual) === String(storedValue)) return actual;
			continue;
		}

		if (typeof actual === 'object' && actual !== null) {
			// Normalize key order before comparing
			if (typeof storedValue === 'object' && storedValue !== null) {
				if (serializeValue(actual) === serializeValue(storedValue as Record<string, string>)) return actual;
			}
			// Stored as a plain string matching one of the locale values
			if (typeof storedValue === 'string' && Object.values(actual).includes(storedValue)) return actual;
		}
	}
	return undefined;
}

function deserializeValue(str: string): string | number | Record<string, string> {
	try {
		const parsed = JSON.parse(str);
		if (typeof parsed === 'number') return parsed;
		if (typeof parsed === 'object' && parsed !== null) return parsed;
		return str;
	} catch {
		return str;
	}
}

function getEnumValueActual(item: EnumValueItem): string | number | Record<string, string> {
	if (typeof item === 'number') return item;
	if (typeof item === 'object' && item !== null) return item;
	return String(item);
}

function buildAttributesPayload(
	rows: VariantAttributeRow[],
	attributes: Attribute[],
): Record<string, string | number | Record<string, string>> {
	return rows.reduce<Record<string, string | number | Record<string, string>>>((acc, row) => {
		const attr = attributes.find(a => a.id === row.attributeId);
		if (!attr || row.value === undefined) return acc;
		acc[attr.codeName] = row.value;
		return acc;
	}, {});
}

function formatDateTime(value: unknown): string {
	if (value === null || value === undefined || value === '') return '-';
	const date = new Date(String(value));
	return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatVariantAttributeValue(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (!value || typeof value !== 'object') return '-';
	const record = value as Record<string, unknown>;
	const localizedText = JsonToString(record.valueText);
	if (localizedText) return localizedText;
	if (typeof record.valueText === 'string') return record.valueText;
	if (typeof record.valueNumber === 'number') return String(record.valueNumber);
	if (typeof record.valueBool === 'boolean') return record.valueBool ? 'Yes' : 'No';
	if (typeof record.valueRef === 'string') return record.valueRef;
	if (typeof record.id === 'string') return record.id;
	return JsonToString(value) || '-';
}

function getVariantAttributes(attributes: unknown): Array<{ codeName: string; value: unknown }> {
	if (Array.isArray(attributes)) {
		return attributes.reduce<Array<{ codeName: string; value: unknown }>>((acc, attribute) => {
			if (!attribute || typeof attribute !== 'object') return acc;
			const record = attribute as Record<string, unknown>;
			if (typeof record.codeName !== 'string') return acc;
			acc.push({ codeName: record.codeName, value: record.value });
			return acc;
		}, []);
	}
	if (!attributes || typeof attributes !== 'object') return [];
	return Object.entries(attributes as Record<string, unknown>).map(([codeName, value]) => ({
		codeName,
		value,
	}));
}


/* ===================== ATTRIBUTE ROW COMPONENT ===================== */

function AttributeRow({
	row,
	attributes,
	onChangeAttribute,
	onChangeValue,
	onRemove,
}: {
	row: VariantAttributeRow;
	attributes: Attribute[];
	onChangeAttribute: (id: string, attrId?: string) => void;
	onChangeValue: (id: string, value?: string | number | Record<string, string>) => void;
	onRemove: (id: string) => void;
}) {
	const selectedAttribute = attributes.find(a => a.id === row.attributeId);
	const enumValues = selectedAttribute?.enumValue ?? [];

	return (
		<Paper withBorder p='sm' radius='sm'>
			<Group justify='space-between' mb='xs'>
				<Text size='sm' fw={500}>Attribute</Text>
				<ActionIcon color='red' variant='subtle' size='sm' onClick={() => onRemove(row.rowId)}>
					<IconTrash size={14} />
				</ActionIcon>
			</Group>
			<Group grow>
				<Select
					label='Code Name'
					placeholder='Select attribute'
					size='sm'
					data={attributes.map(a => ({
						value: a.id,
						label: `${a.codeName} (${JsonToString(a.displayName)})`,
					}))}
					value={row.attributeId ?? null}
					onChange={v => onChangeAttribute(row.rowId, v ?? undefined)}
				/>
				<Select
					label='Value'
					placeholder='Select value'
					size='sm'
					data={enumValues.map(enumItem => {
						const actualValue = getEnumValueActual(enumItem as EnumValueItem);
						return {
							value: serializeValue(actualValue),
							label: getEnumValueLabel(enumItem as EnumValueItem),
						};
					})}
					value={row.value !== undefined ? serializeValue(row.value) : null}
					onChange={v => {
						if (v === null) {
							onChangeValue(row.rowId, undefined);
							return;
						}
						onChangeValue(row.rowId, deserializeValue(v));
					}}
					disabled={!row.attributeId || enumValues.length === 0}
				/>
			</Group>
		</Paper>
	);
}


/* ===================== TYPES ===================== */

type VariantSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface VariantDetailFormProps {
	schema: ModelSchema | VariantSchema;
	variantDetail: Variant | undefined;
	isLoading: boolean;
	isEditing: boolean;
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
}

const UPDATE_FORM_FIELDS = ['sku', 'barcode', 'imageURL', 'proposedPrice', 'status'];

/* ===================== MAIN COMPONENT ===================== */

export const VariantDetailForm: React.FC<VariantDetailFormProps> = ({
	schema,
	variantDetail,
	isLoading,
	isEditing,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const orgId = useActiveOrgWithDetails()?.id ?? 'org-1';

	// Attribute editing state
	const [availableAttributes, setAvailableAttributes] = React.useState<Attribute[]>([]);
	const [attributeRows, setAttributeRows] = React.useState<VariantAttributeRow[]>([]);

	// Re-initialize rows when the user clicks Edit (reset any cancelled modifications)
	const prevIsEditingRef = React.useRef(false);
	React.useEffect(() => {
		const prevIsEditing = prevIsEditingRef.current;
		prevIsEditingRef.current = isEditing;

		// Only act when transitioning false → true (Edit button clicked)
		if (!isEditing || prevIsEditing || availableAttributes.length === 0) return;

		const existing = getVariantAttributes(variantDetail?.attributes);
		const resetRows = existing
			.map(ea => {
				const attr = availableAttributes.find(a => a.codeName === ea.codeName);
				if (!attr) return null;
				return {
					rowId: createRowId(),
					attributeId: attr.id,
					value: matchEnumValue(ea.value, attr.enumValue ?? []) ?? ea.value as string | number | Record<string, string>,
				};
			})
			.filter((r): r is NonNullable<typeof r> => r !== null);
		setAttributeRows(resetRows);
	}, [isEditing, availableAttributes, variantDetail?.attributes]);

	// Load product attributes and initialize rows from existing variant attributes
	React.useEffect(() => {
		const productId = variantDetail?.productId;
		if (!productId) {
			setAvailableAttributes([]);
			setAttributeRows([]);
			return;
		}

		let cancelled = false;
		void attributeService.listAttributes(orgId, productId).then(res => {
			if (cancelled) return;
			const enumAttributes = (res.items ?? []).filter(attr => attr.isEnum);
			setAvailableAttributes(enumAttributes);

			const existing = getVariantAttributes(variantDetail?.attributes);
			const initialRows = existing
				.map(ea => {
					const attr = enumAttributes.find(a => a.codeName === ea.codeName);
					if (!attr) return null;
					return {
						rowId: createRowId(),
						attributeId: attr.id,
						value: matchEnumValue(ea.value, attr.enumValue ?? []) ?? ea.value as string | number | Record<string, string>,
					};
				})
				.filter((r): r is NonNullable<typeof r> => r !== null);

			setAttributeRows(initialRows);
		});

		return () => { cancelled = true; };
	}, [orgId, variantDetail?.productId, variantDetail?.id]);

	const handleFormSubmit = (data: Record<string, unknown>) => {
		const attributesPayload = buildAttributesPayload(attributeRows, availableAttributes);
		void onSubmit({ ...data, attributes: attributesPayload });
	};

	const variantName = variantDetail ? (JsonToString(variantDetail.name) || variantDetail.id || '-') : '-';
	const displayAttributes = variantDetail ? getVariantAttributes(variantDetail.attributes) : [];
	const isFormReadOnly = isLoading || !variantDetail || !isEditing;

	// Only allow editing specific fields; mark the rest as frontendOnly so FormFieldProvider
	// does not register/validate them (mirrors the pattern in ProductDetailForm).
	const updateSchema = React.useMemo((): ModelSchema => ({
		...(schema as ModelSchema),
		fields: Object.fromEntries(
			Object.entries((schema as ModelSchema).fields).map(([key, field]) => [
				key,
				UPDATE_FORM_FIELDS.includes(key) ? field : { ...(field as FieldDefinition), frontendOnly: true },
			]),
		),
	}), [schema]);

	const modelValue = {
		...variantDetail,
		name: JsonToString(variantDetail?.name) || '',
	};

	const getStatusBadge = (status: string | undefined) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: t('nikki.general.status.active') },
			inactive: { color: 'gray', label: t('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status ?? ''] ?? { color: 'gray', label: status ?? '-' };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	return (
		<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={updateSchema}
					modelValue={modelValue}
					modelLoading={isLoading}
				>
					{({ handleSubmit }) => (
						<form id='variant-detail-form' onSubmit={handleSubmit(handleFormSubmit)} noValidate>
							<Stack gap='md'>
								{/* Header */}
								<Group gap='xs'>
									<IconBox size={20} />
									<Text fw={600} size='lg'>{variantName}</Text>
								</Group>

								{/* Status */}
								{isEditing ? (
									<AutoField name='status' />
								) : (
									<div>
										<Text size='sm' c='dimmed' mb='xs'>
											{t('nikki.inventory.variant.fields.status')}
										</Text>
										{getStatusBadge(variantDetail?.status)}
									</div>
								)}

								<AutoField name='sku' htmlProps={{ readOnly: isFormReadOnly }} />
								<AutoField name='barcode' htmlProps={{ readOnly: isFormReadOnly }} />
								<AutoField name='proposedPrice' htmlProps={{ readOnly: isFormReadOnly }} />

								{/* Image URL */}
								<div>
									<AutoField name='imageURL' htmlProps={{ readOnly: isFormReadOnly }} />
									{variantDetail?.imageURL && (
										<Image
											src={variantDetail.imageURL}
											alt={variantName}
											h={140}
											w='auto'
											fit='contain'
											radius='md'
											mt='sm'
											fallbackSrc='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23f1f3f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23868e96"%3ENo Image%3C/text%3E%3C/svg%3E'
										/>
									)}
								</div>

								{/* Attributes Section */}
								<div>
									<Divider
										label={t('nikki.inventory.variant.sections.attributes')}
										labelPosition='left'
										mb='sm'
									/>
									{isEditing ? (
										<Stack gap='sm'>
											{attributeRows.map(row => (
												<AttributeRow
													key={row.rowId}
													row={row}
													attributes={availableAttributes}
													onChangeAttribute={(id, attrId) =>
														setAttributeRows(r =>
															r.map(x =>
																x.rowId === id ? { ...x, attributeId: attrId, value: undefined } : x
															)
														)
													}
													onChangeValue={(id, value) =>
														setAttributeRows(r =>
															r.map(x => x.rowId === id ? { ...x, value } : x)
														)
													}
													onRemove={id =>
														setAttributeRows(r => r.filter(x => x.rowId !== id))
													}
												/>
											))}
											<Button
												type='button'
												variant='light'
												size='sm'
												leftSection={<IconPlus size={14} />}
												onClick={() =>
													setAttributeRows(r => [...r, { rowId: createRowId() }])
												}
											>
												{t('nikki.inventory.variant.actions.addAttribute')}
											</Button>
										</Stack>
									) : (
										displayAttributes.length > 0 ? (
											<Grid gutter='sm'>
												{displayAttributes.map(attribute => (
													<Grid.Col key={attribute.codeName} span={{ base: 12, sm: 6 }}>
														<Group gap='xs' wrap='nowrap'>
															<Badge size='sm' variant='light' radius='sm'>
																{attribute.codeName}
															</Badge>
															<Text size='sm' fw={500}>
																{formatVariantAttributeValue(attribute.value)}
															</Text>
														</Group>
													</Grid.Col>
												))}
											</Grid>
										) : (
											<Text size='sm' c='dimmed'>
												{t('nikki.inventory.variant.messages.noAttributes')}
											</Text>
										)
									)}
								</div>

								{/* Timestamps */}
								<div>
									<Text size='sm' c='dimmed' mb='xs'>
										{t('nikki.inventory.variant.fields.createdAt')}
									</Text>
									<Text size='sm'>{formatDateTime(variantDetail?.createdAt)}</Text>
								</div>

								<div>
									<Text size='sm' c='dimmed' mb='xs'>
										{t('nikki.inventory.variant.fields.updatedAt')}
									</Text>
									<Text size='sm'>{formatDateTime(variantDetail?.updatedAt)}</Text>
								</div>

								<Box h={50} />
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
	);
};
