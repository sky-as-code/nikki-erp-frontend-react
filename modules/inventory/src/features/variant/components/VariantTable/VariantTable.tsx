import {
	Badge,
	Paper,
	Text,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';
import { Link } from 'react-router';

import { localizedTextToString } from '../../../localizedText';
import variantSchema from '../../../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../../types';


const VARIANT_SCHEMA = variantSchema as ModelSchema;
const BASE_COLUMNS = ['name', 'sku', 'attributeValues', 'proposedPrice', 'status'];
const PRODUCT_SCOPE_COLUMNS = ['name', 'sku', 'productId', 'attributeValues', 'proposedPrice', 'status'];


interface VariantTableProps {
	variants: Variant[];
	productNameById?: Record<string, string>;
	getVariantDetailLink?: (variant: Variant) => string;
	emptyMessage?: string;
}

const variantCombinationLabel = (variant: Variant) => {
	const getValueLabel = (v: typeof variant.attributeValues[0]) => {
		const valueText = localizedTextToString(v.valueText);
		if (valueText) {
			return valueText;
		}

		if (v.valueNumber != null) {
			return String(v.valueNumber);
		}

		if (v.valueBool != null) {
			return v.valueBool ? 'true' : 'false';
		}

		return v.valueRef ?? '';
	};
	return variant.attributeValues.map(getValueLabel).join(' / ');
};

export function VariantTable({
	variants,
	productNameById,
	getVariantDetailLink,
	emptyMessage = 'No variants found',
}: VariantTableProps): React.ReactElement {
	const showProductColumn = Boolean(productNameById);
	const columns = showProductColumn ? PRODUCT_SCOPE_COLUMNS : BASE_COLUMNS;

	if (variants.length === 0) {
		return (
			<Paper p='md' withBorder>
				<Text c='dimmed' ta='center'>{emptyMessage}</Text>
			</Paper>
		);
	}

	return (
		<Paper p='md' withBorder>
			<AutoTable
				schema={VARIANT_SCHEMA}
				columns={columns}
				data={variants as unknown as Record<string, unknown>[]}
				columnRenderers={{
					name: (row) => {
						const variant = row as Variant;
						return localizedTextToString(variant.name) || variant.id;
					},
					sku: (row) => {
						const variant = row as Variant;
						const detailLink = getVariantDetailLink?.(variant) ?? `./${variant.id}`;
						return (
							<Text component={Link} to={detailLink} c='blue.7' fw={600}>
								{variant.sku}
							</Text>
						);
					},
					productId: (row) => {
						const variant = row as Variant;
						return productNameById?.[variant.productId] ?? variant.productId;
					},
					attributeValues: (row) => {
						const variant = row as Variant;
						return variantCombinationLabel(variant);
					},
					status: (row) => {
						const variant = row as Variant;
						return (
							<Badge color={variant.status === 'active' ? 'green' : 'red'}>{variant.status}</Badge>
						);
					},
				}}
				headerRenderers={{
					productId: () => <>Product</>,
					attributeValues: () => <>Attribute Combination</>,
				}}
			/>
		</Paper>
	);
}
