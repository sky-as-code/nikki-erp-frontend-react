import { Avatar, Badge, ScrollArea, Table, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '../../types';


interface ProductPosition {
	row: string;
	col: number;
	quantity: number;
	maxQuantity: number;
}

interface Product {
	id: string;
	code: string;
	name: string;
	image?: string;
	price: number;
	positions: ProductPosition[];
	totalQuantity: number;
}

interface ProductListViewProps {
	kiosk: Kiosk;
}

// Mock data - replace with actual API call
const mockProducts: Product[] = [
	{
		id: '1',
		code: 'ttc-revive',
		name: 'Revive',
		image: 'https://via.placeholder.com/50',
		price: 15000,
		totalQuantity: 20,
		positions: [
			{ row: 'A', col: 1, quantity: 4, maxQuantity: 5 },
			{ row: 'A', col: 2, quantity: 5, maxQuantity: 5 },
			{ row: 'A', col: 3, quantity: 4, maxQuantity: 5 },
			{ row: 'A', col: 4, quantity: 3, maxQuantity: 5 },
			{ row: 'A', col: 5, quantity: 2, maxQuantity: 5 },
		],
	},
	{
		id: '2',
		code: 'ttc-xim-coconut-water',
		name: 'Nước dừa Xim Thạch',
		image: 'https://via.placeholder.com/50',
		price: 20000,
		totalQuantity: 15,
		positions: [
			{ row: 'B', col: 1, quantity: 4, maxQuantity: 5 },
			{ row: 'B', col: 2, quantity: 5, maxQuantity: 5 },
			{ row: 'B', col: 3, quantity: 4, maxQuantity: 5 },
			{ row: 'B', col: 4, quantity: 1, maxQuantity: 5 },
			{ row: 'B', col: 5, quantity: 1, maxQuantity: 5 },
		],
	},
];

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
					{mockProducts.map((product) => (
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
