import {
	Badge,
	Paper,
	Text,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';
import { Link } from 'react-router';

import { localizedTextToString } from '../../localizedText';
import variantSchema from '../../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../types';


const PRODUCT_SCOPE_COLUMNS = ['sku', 'name', 'product', 'barcode', 'proposedPrice', 'status'];


interface VariantTableProps {
	variants: Variant[];
	productNameById?: Record<string, string>;
	getVariantDetailLink?: (variant: Variant) => string;
	emptyMessage?: string;
}

// const variantCombinationLabel = (variant: Variant) => {
// 	if (!variant.attributes || variant.attributes.length === 0) {
// 		return '';
// 	}

// 	const getValueLabel = (v: typeof variant.attributes[0]) => {
// 		const valueText = localizedTextToString(v as string);
// 		if (valueText) {
// 			return valueText;
// 		}

// 		if (v.valueNumber != null) {
// 			return String(v.valueNumber);
// 		}

// 		if (v.valueBool != null) {
// 			return v.valueBool ? 'true' : 'false';
// 		}

// 		return v.valueRef ?? '';
// 	};
// 	return variant.attributes.map(getValueLabel).join(' / ');
// };

export function VariantTable({
	variants,
	productNameById,
	getVariantDetailLink,
	emptyMessage = 'No variants found',
}: VariantTableProps): React.ReactElement {
	const columns = PRODUCT_SCOPE_COLUMNS ;

	if (variants.length === 0) {
		return (
			<Paper p='md' withBorder>
				<Text c='dimmed' ta='center'>{emptyMessage}</Text>
			</Paper>
		);
	}

	return (
		<Paper p='md'>
			<AutoTable
				schema={variantSchema as ModelSchema}
				columns={columns}
				data={variants as unknown as Record<string, unknown>[]}
				columnAsLink='sku'
				columnRenderers={{
					sku: (row) => {
						const variant = row as Variant;
						const detailLink = getVariantDetailLink?.(variant) ?? `./${variant.id}`;
						return (
							<Text component={Link} to={detailLink} c='blue.7' fw={600}>
								{variant.sku}
							</Text>
						);
					},
					name: (row) => {
						const variant = row as Variant;
						return localizedTextToString(variant.name) || variant.id;
					},
					product: (row) => {
						const variant = row as Variant;
						return productNameById?.[variant.productId] ?? variant.productId;
					},
					status: (row) => {
						const variant = row as Variant;
						return (
							<Badge color={variant.status === 'active' ? 'green' : 'red'}>{variant.status}</Badge>
						);
					},
				}}
			/>
		</Paper>
	);
}
