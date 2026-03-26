import {
	Badge,
	Paper,
	Text,
} from '@mantine/core';
import {AutoTable } from '@nikkierp/ui/components';
import React from 'react';
import { Link } from 'react-router';

import variantSchema from '../../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../types';
import { JsonToString } from '../../../utils/serializer';
import { Product } from '../../product';


const PRODUCT_SCOPE_COLUMNS = ['sku', 'name', 'product', 'barcode', 'proposedPrice', 'status'];

interface VariantTableProps {
	variants: Variant[];
	getVariantDetailLink?: (variant: Variant) => string;
}

export function VariantTable({
	variants,
	getVariantDetailLink,
}: VariantTableProps): React.ReactElement {
	if (variants.length === 0) {
		return (
			<Paper p='md'>
				<Text c='dimmed' ta='center'>No variants found</Text>
			</Paper>
		);
	}

	return (
		<Paper p='md'>
			<AutoTable
				schema={variantSchema as ModelSchema}
				columns={PRODUCT_SCOPE_COLUMNS}
				data={variants as unknown as Record<string, unknown>[]}
				columnAsLink='sku'
				columnRenderers={{
					sku: (row) => {
						const variant = row as Variant;
						const detailLink = getVariantDetailLink?.(variant) ?? `./${variant.id}`;
						return (
							<Text component={Link} to={detailLink} c='blue.4' fw={600}>
								{variant.sku}
							</Text>
						);
					},
					name: (row) => {
						const variant = row as Variant;
						return JsonToString(variant.name) || variant.id;
					},
					product: (row) => {
						const variant = row as Variant;
						return variant.product?.name ? JsonToString(variant.product.name) : variant.productId;
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
