import {
	ActionIcon,
	Button,
	Divider,
	Group,
	Paper,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import {
	AutoField,
	EntitySelectField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';

import type { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';

import { attributeService } from '../../attribute/attributeService';
import type { Attribute } from '../../attribute/types';
import type { Product } from '../../product/types';
import { JsonToString, StringToJson } from '../../../utils/serializer';

/* ===================== TYPES ===================== */

type EnumValueItem = number | Record<string, string>;

type VariantSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

type VariantAttributeRow = {
	rowId: string;
	attributeId?: string;
	value?: string | number | Record<string, string>; // ✅ Match với EnumValueItem
};

type VariantFormValues = {
	productId?: string;
	name?: string;
	sku?: string;
	barcode?: string;
	imageURL?: string;
	proposedPrice?: number;
	status?: string;
};

interface VariantCreateFormProps {
	schema: VariantSchema;
	isLoading: boolean;
	products: Product[];
	productId?: string;
	onSubmit: (data: any) => void;
}

/* ===================== UTILS ===================== */

function createRowId() {
	return `row-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Lấy label hiển thị từ enumValue item
 */
function getEnumValueLabel(item: EnumValueItem): string {
	// Nếu item là number
	if (typeof item === 'number') {
		return String(item);
	}

	// Nếu item là LangJson object
	if (typeof item === 'object' && item !== null) {
		// Ưu tiên hiển thị tiếng Việt, fallback sang English
		return item.vi || item.en || JSON.stringify(item);
	}

	return JSON.stringify(item);
}

/**
 * Serialize giá trị thành string để dùng làm key trong Select
 */
function serializeValue(value: string | number | Record<string, string>): string {
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}
	return String(value);
}

/**
 * Deserialize string về giá trị gốc
 */
function deserializeValue(str: string): string | number | Record<string, string> {
	try {
		// Thử parse JSON
		const parsed = JSON.parse(str);
		// Nếu parse thành number, return number
		if (typeof parsed === 'number') {
			return parsed;
		}
		// Nếu parse thành object, return object
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed;
		}
		// Fallback
		return str;
	} catch {
		// Không phải JSON, trả về string gốc
		return str;
	}
}
/**
 * Lấy giá trị thực từ enumValue item
 */
function getEnumValueActual(item: EnumValueItem): string | number | Record<string, string> {
	// Nếu item là number, trả về trực tiếp
	if (typeof item === 'number') {
		return item;
	}

	// Nếu item là LangJson object (Record<string, string>), trả về object
	if (typeof item === 'object' && item !== null) {
		return item;
	}

	// Fallback (should not happen with correct types)
	return String(item);
}

function buildAttributesPayload(
	rows: VariantAttributeRow[],
	attributes: Attribute[]
) {
	return rows.reduce<Record<string, string | number | Record<string, string>>>((acc, row) => {
		const attr = attributes.find(a => a.id === row.attributeId);

		if (!attr || row.value === undefined) return acc;

		acc[attr.codeName] = row.value;
		return acc;
	}, {});
}

/* ===================== HOOK ===================== */

function useVariantAttributes(orgId: string, productId?: string) {
	const [attributes, setAttributes] = React.useState<Attribute[]>([]);
	const [rows, setRows] = React.useState<VariantAttributeRow[]>([
		{ rowId: createRowId() },
	]);

	// Load attributes với enumValue
	React.useEffect(() => {
		if (!productId) return;

		attributeService.listAttributes(orgId, productId).then(res => {
			// Lọc chỉ lấy attributes có isEnum = true
			const enumAttributes = (res.items ?? []).filter(attr => attr.isEnum);
			setAttributes(enumAttributes);
			setRows([{ rowId: createRowId() }]);
		});
	}, [orgId, productId]);

	return { attributes, rows, setRows };
}

/* ===================== UI ROW ===================== */

function RowField({
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
		<Paper withBorder p="md">
			<Group justify="space-between">
				<Text fw={600}>Attribute</Text>
				<ActionIcon color="red" onClick={() => onRemove(row.rowId)}>
					<IconTrash size={16} />
				</ActionIcon>
			</Group>

			<Group grow>
				<Select
					label="Code Name"
					placeholder="Chọn thuộc tính"
					data={attributes.map(a => ({
						value: a.id,
						label: `${a.codeName} (${JsonToString(a.displayName)})`,
					}))}
					value={row.attributeId ?? null}
					onChange={v => onChangeAttribute(row.rowId, v ?? undefined)}
				/>

				<Select
					label="Value"
					placeholder="Chọn giá trị"
					data={enumValues.map((enumItem, idx) => {
						const actualValue = getEnumValueActual(enumItem as EnumValueItem);
						return {
							value: serializeValue(actualValue), // ✅ Stringify để làm key
							label: getEnumValueLabel(enumItem as EnumValueItem),
						};
					})}
					value={row.value !== undefined ? serializeValue(row.value) : null}
					onChange={v => {
						if (v === null) {
							onChangeValue(row.rowId, undefined);
							return;
						}

						// ✅ Parse lại thành object gốc
						const deserializedValue = deserializeValue(v);
						onChangeValue(row.rowId, deserializedValue);
					}}
					disabled={!row.attributeId || enumValues.length === 0}
				/>
			</Group>
		</Paper>
	);
}

/* ===================== MAIN FORM ===================== */

function FormContent({
	form,
	onSubmit,
	products,
	productId,
}: {
	form: (
		onValid: (data: any) => void | Promise<void>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	onSubmit: (data: any) => void;
	products: Product[];
	productId?: string;
}) {
	const orgId = useActiveOrgWithDetails()?.id ?? 'org-1';
	const [selectedProductId, setSelectedProductId] = React.useState(productId);

	const { attributes, rows, setRows } = useVariantAttributes(orgId, selectedProductId);

	const submit = (data: VariantFormValues) => {
		onSubmit({
			...data,
			productId: data.productId || selectedProductId,
			name: StringToJson(data.name ?? ''),
			attributes: buildAttributesPayload(rows, attributes),
		});
	};

	return (
		<form id="variant-create-form" onSubmit={form((data) => submit(data))}>
			<Stack>
				<EntitySelectField
					fieldName="productId"
					entities={products}
					getEntityId={p => p.id}
					getEntityName={p => JsonToString(p.name)}
					onChange={(value) => setSelectedProductId(value)}
				/>

				<AutoField name="name" />
				<AutoField name="sku" />
				<AutoField name="barcode" />
				<AutoField name="imageURL" />
				<AutoField name="proposedPrice" />
				<AutoField name="status" />

				<Divider label="Attributes" />

				{rows.map(row => (
					<RowField
						key={row.rowId}
						row={row}
						attributes={attributes}
						onChangeAttribute={(id, attrId) =>
							setRows(r =>
								r.map(x =>
									x.rowId === id ? { ...x, attributeId: attrId, value: undefined } : x
								)
							)
						}
						onChangeValue={(id, value) =>
							setRows(r =>
								r.map(x =>
									x.rowId === id ? { ...x, value } : x
								)
							)
						}
						onRemove={id =>
							setRows(r => r.filter(x => x.rowId !== id))
						}
					/>
				))}

				<Button
					type="button"
					onClick={() =>
						setRows(r => [...r, { rowId: createRowId() }])
					}
					leftSection={<IconPlus size={16} />}
				>
					Add attribute
				</Button>
			</Stack>
		</form>
	);
}

/* ===================== EXPORT ===================== */

export function VariantCreateForm({ 
	schema, 
	isLoading, 
	products, 
	productId, 
	onSubmit 
}: VariantCreateFormProps): React.ReactElement {
	return (
		<Paper p="md">
			<FormStyleProvider layout="onecol">
				<FormFieldProvider
					formVariant="create"
					modelSchema={schema}
					modelLoading={isLoading}
				>
					{({ handleSubmit: form }) => (
						<FormContent
							form={form}
							onSubmit={onSubmit}
							products={products}
							productId={productId}
						/>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}