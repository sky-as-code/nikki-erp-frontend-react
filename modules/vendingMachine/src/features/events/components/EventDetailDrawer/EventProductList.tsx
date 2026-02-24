import { ActionIcon, Badge, Box, Button, Group, Image, Stack, Table, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EventProduct } from '../../types';


export interface EventProductListProps {
	products: EventProduct[];
	onAddProducts?: () => void;
	onRemoveProduct?: (productId: string) => void;
}

export const EventProductList: React.FC<EventProductListProps> = ({
	products,
	onAddProducts,
	onRemoveProduct,
}) => {
	const { t: translate } = useTranslation();

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	return (
		<Stack gap='md'>
			{onAddProducts && (
				<Group justify='flex-end'>
					<Button
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={onAddProducts}
					>
						{translate('nikki.vendingMachine.events.selectProducts.addProducts')}
					</Button>
				</Group>
			)}

			{/* Product List Table */}
			{products.length === 0 ? (
				<Text size='sm' c='dimmed' ta='center' py='md'>
					{translate('nikki.vendingMachine.events.messages.no_products')}
				</Text>
			) : (
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th style={{ width: 80 }}>{translate('nikki.vendingMachine.events.fields.productImage')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.events.fields.productCode')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.events.fields.productName')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.events.fields.originalPrice')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.events.fields.eventPrice')}</Table.Th>
							{onRemoveProduct && <Table.Th style={{ width: 50 }}></Table.Th>}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{products.map((product) => (
							<Table.Tr key={product.id}>
								<Table.Td>
									<Box pos='relative' w={60} h={60}>
										<Image
											src={product.image}
											alt={product.name}
											width={60}
											height={60}
											radius='sm'
											style={{ objectFit: 'cover' }}
										/>
										{product.badgeImage && (
											<Image
												src={product.badgeImage}
												alt='Badge'
												width={30}
												height={30}
												radius='sm'
												style={{
													position: 'absolute',
													top: -5,
													right: -5,
													objectFit: 'cover',
												}}
											/>
										)}
									</Box>
								</Table.Td>
								<Table.Td>
									<Text size='sm' fw={500}>{product.code}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{product.name}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm' td='line-through' c='dimmed'>
										{formatCurrency(product.originalPrice)}
									</Text>
								</Table.Td>
								<Table.Td>
									<Badge color='red' size='lg' variant='light'>
										{formatCurrency(product.eventPrice)}
									</Badge>
								</Table.Td>
								{onRemoveProduct && (
									<Table.Td>
										<ActionIcon
											variant='subtle'
											color='red'
											onClick={() => onRemoveProduct(product.id)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Table.Td>
								)}
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			)}
		</Stack>
	);
};
