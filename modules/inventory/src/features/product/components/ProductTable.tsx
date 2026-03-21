import {
	Badge,
	Group,
	Image,
	Paper,
	Text,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate } from 'react-router';

import { JsonToString } from '../../../utils/serializer';

import type { Product } from '../types';
import type { Unit } from '../../unit/types';
import type { Variant } from '../../variant/types';


interface ProductTableProps {
	columns: string[];
	products: Product[];
	isLoading: boolean;
	schema: ModelSchema;
	units: Unit[];
	variants: Variant[];
}

export function ProductTable({
	columns,
	products,
	isLoading,
	schema,
	units,
	variants,
}: ProductTableProps): React.ReactElement {
	const navigate = useNavigate();

	const handleViewDetail = React.useCallback((productId: string) => {
		navigate(`./${productId}`);
	}, [navigate]);

	const getUnitName = React.useCallback((unitId?: string) => {
		if (!unitId) return '-';
		const unit = units.find(u => u.id === unitId);
		return unit ? JsonToString(unit.name) : unitId;
	}, [units]);

	const getDefaultVariant = React.useCallback((defaultVariantId?: string) => {
		if (!defaultVariantId) return undefined;
		return variants.find(v => v.id === defaultVariantId);
	}, [variants]);

	const getSku = React.useCallback((product: Product) => {
		const defaultVariant = getDefaultVariant(product.defaultVariantId);
		return defaultVariant?.sku || product.sku || '-';
	}, [getDefaultVariant]);

	const getProposedPrice = React.useCallback((product: Product) => {
		const defaultVariant = getDefaultVariant(product.defaultVariantId);
		const price = defaultVariant?.proposedPrice ?? product.proposedPrice;
		return price;
	}, [getDefaultVariant]);

	return (
			<AutoTable
				columns={columns}
				data={products}
				schema={schema}
				isLoading={isLoading}
				columnAsLink='name'
				columnRenderers={{
					name: (row) => {
						const productId = row.id as string;
						const productName = JsonToString(row.name);
						return (
							<Group gap='md' wrap='nowrap'>
								<Image
									src={String(row.thumbnailURL || '')}
									alt={productName}
									fit='cover'
									radius='sm'
									w={70}
									h={70}
									style={{ border: '1px solid #dee2e6', flexShrink: 0 }}
									fallbackSrc='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect width="70" height="70" fill="%23f1f3f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23868e96"%3ENo Image%3C/text%3E%3C/svg%3E'
								/>
								<Text
									c='blue.7'
									fw={600}
									style={{ cursor: 'pointer', textDecoration: 'underline' }}
									onClick={(event) => {
										event.preventDefault();
										handleViewDetail(productId);
									}}
								>
									{productName}
								</Text>
							</Group>
						);
					},
					description: (row) => (
						<Text size='sm' lineClamp={2} maw={300}>
							{JsonToString(row.description) || '-'}
						</Text>
					),
					sku: (row) => (
						<Text size='sm'>
							{getSku(row as Product)}
						</Text>
					),
					proposedPrice: (row) => (
						<Text size='sm'>
							{getProposedPrice(row as Product)}
						</Text>
					),
					status: (row) => {
						const status = String(row.status || 'simple');
						return (
							<Badge variant='light' color={status === 'active' ? 'green' : 'red'}>
								{status}
							</Badge>
						);
					},
					unitId: (row) => (
						<Text size='sm'>
							{getUnitName(row.unitId as string | undefined)}
						</Text>
					),

				}}
			/>
	);
}
