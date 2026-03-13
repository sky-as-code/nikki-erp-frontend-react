/* eslint-disable max-lines-per-function */
import { Avatar, Badge, Card, Checkbox, Group, Pagination, ScrollArea, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import React, { useState } from 'react';


interface Product {
	id: string;
	name: string;
	vendors: string[];
	margin: number;
	sold: number;
	stock: 'in_stock' | 'low_stock';
}

interface TopProductsTableProps {
	products: Product[];
}

export function TopProductsTable({ products }: TopProductsTableProps): React.ReactElement {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const itemsPerPage = isMobile ? 6 : 10;

	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const toggleProduct = (productId: string) => {
		setSelectedProducts((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId],
		);
	};

	const toggleAll = () => {
		if (selectedProducts.length === paginatedProducts.length) {
			setSelectedProducts([]);
		}
		else {
			setSelectedProducts(paginatedProducts.map((p) => p.id));
		}
	};


	const startItems = (currentPage - 1) * itemsPerPage + 1;
	const endItems = Math.min(currentPage * itemsPerPage, filteredProducts.length);
	const totalItems = filteredProducts.length;
	const paginationLabel = `Showing ${startItems}-${endItems} out of ${totalItems} items`;


	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Top products
						</Title>
						<Text size='xs' c='dimmed'>
							Detailed information about the products
						</Text>
					</Stack>
				</Group>
				<TextInput
					placeholder='Search'
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					size='sm'
				/>
				<ScrollArea>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th style={{ width: 40 }}>
									<Checkbox
										checked={selectedProducts.length === paginatedProducts.length &&
											paginatedProducts.length > 0}
										indeterminate={selectedProducts.length > 0 &&
											selectedProducts.length < paginatedProducts.length}
										onChange={toggleAll}
									/>
								</Table.Th>
								<Table.Th>Product</Table.Th>
								<Table.Th>Vendors</Table.Th>
								<Table.Th>Margin</Table.Th>
								<Table.Th>Sold</Table.Th>
								<Table.Th>Stock</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{paginatedProducts.map((product) => (
								<Table.Tr key={product.id}>
									<Table.Td>
										<Checkbox
											checked={selectedProducts.includes(product.id)}
											onChange={() => toggleProduct(product.id)}
										/>
									</Table.Td>
									<Table.Td>
										<Group gap='xs'>
											<Avatar size='sm' radius='sm' color='blue' />
											<Text size='sm'>{product.name}</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Group gap={4}>
											{product.vendors.slice(0, 3).map((vendor, idx) => (
												<Avatar key={idx} size='xs' radius='xl' color='gray' />
											))}
											{product.vendors.length > 3 && (
												<Text size='xs' c='dimmed'>
													+{product.vendors.length - 3}
												</Text>
											)}
										</Group>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											${product.margin.toFixed(2)}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm'>{product.sold}</Text>
									</Table.Td>
									<Table.Td>
										<Badge
											color={product.stock === 'in_stock' ? 'green' : 'orange'}
											variant='light'
											size='sm'
										>
											{product.stock === 'in_stock' ? 'In Stock' : 'Low Stock'}
										</Badge>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</ScrollArea>
				<Group justify='space-between' align='center'>
					<Text size='sm' c='dimmed'>
						{paginationLabel}
					</Text>
					<Pagination
						total={Math.ceil(filteredProducts.length / itemsPerPage)}
						value={currentPage}
						onChange={setCurrentPage}
						size='sm'
					/>
				</Group>
			</Stack>
		</Card>
	);
}
