import {
	Badge,
	Group,
	Image,
	Paper,
	Text,
} from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import React from 'react';

import { localizedTextToString } from '../../../localizedText';

import type { Product } from '../../types';


export type ProductTableRow = Product;

export interface ProductTableProps extends AutoTableProps {
	onViewDetail: (productId: string) => void;
}

export function ProductTable({
	columns,
	data,
	isLoading,
	schema,
	onViewDetail,
}: ProductTableProps): React.ReactElement {
	return (
		<Paper p='md' withBorder>
			<AutoTable
				columns={columns}
				data={data}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={{
					name: (row) => {
						const productId = row.id as string;
						const productName = localizedTextToString(row.name as Product['name']);
						return (
							<Group gap='md' wrap='nowrap'>
								<Image
									src={String(row.thumbnailUrl || '')}
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
										onViewDetail(productId);
									}}
								>
									{productName}
								</Text>
							</Group>
						);
					},
					description: (row) => (
						<Text size='sm' lineClamp={2} maw={300}>
							{localizedTextToString(row.description as Product['description']) || '-'}
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
				}}
			/>
			{!isLoading && data.length === 0 && (
				<Text c='dimmed' ta='center' py='sm'>No products found</Text>
			)}
		</Paper>
	);
}
