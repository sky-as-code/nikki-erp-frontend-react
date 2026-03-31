import { Avatar, Badge, ScrollArea, Table, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MOCK_PRODUCTS, type Product, type ProductPosition } from './mockProducts';
import { Kiosk } from '../../types';


interface ProductListViewProps {
	kiosk: Kiosk;
}

export const ProductListView: React.FC<ProductListViewProps> = ({ kiosk: _kiosk }) => {
	const { t: translate } = useTranslation();

	const formatPositions = (positions: ProductPosition[]): string => {
		return positions.map(p => `${p.row}:${p.col}`).join(', ');
	};

	return (
		<ScrollArea>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.image')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.code')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.name')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.price')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.quantity')}</Table.Th>
						<Table.Th>{translate('nikki.vendingMachine.kiosk.products.fields.positions')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{MOCK_PRODUCTS.map((product: Product) => (
						<Table.Tr key={product.id}>
							<Table.Td>
								<Avatar src={product.image} alt={product.name} size='sm' />
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{product.code}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm' fw={500}>{product.name}</Text>
							</Table.Td>
							<Table.Td>
								<Text size='sm'>{product.price.toLocaleString('vi-VN')} đ</Text>
							</Table.Td>
							<Table.Td>
								<Badge color='green'>{product.totalQuantity}</Badge>
							</Table.Td>
							<Table.Td>
								<Text size='sm' c='dimmed'>{formatPositions(product.positions)}</Text>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
};
