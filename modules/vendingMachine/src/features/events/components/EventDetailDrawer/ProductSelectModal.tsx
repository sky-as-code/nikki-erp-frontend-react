import { ActionIcon, Badge, Box, Button, Card, Group, Image, Modal, NumberInput, ScrollArea, SimpleGrid, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconEdit, IconPhoto, IconSearch, IconTrash } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { mockProducts } from '../../mockProducts';
import { EventProduct } from '../../types';


export interface ProductSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectProducts: (products: EventProduct[]) => void;
	selectedProductIds?: string[];
}

export const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
	opened,
	onClose,
	onSelectProducts,
	selectedProductIds = [],
}) => {
	const { t: translate } = useTranslation();
	const [selectedProducts, setSelectedProducts] = useState<EventProduct[]>([]);
	const [editingProduct, setEditingProduct] = useState<EventProduct | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	// Get available products (not already selected or in event)
	const availableProducts = useMemo(() => {
		const selectedIds = new Set([
			...selectedProducts.map((p) => p.id),
			...(selectedProductIds || []),
		]);
		return mockProducts.filter((p) => !selectedIds.has(p.id));
	}, [selectedProducts, selectedProductIds]);

	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) return availableProducts;
		const query = searchQuery.toLowerCase();
		return availableProducts.filter(
			(p) =>
				p.code.toLowerCase().includes(query) ||
				p.name.toLowerCase().includes(query),
		);
	}, [availableProducts, searchQuery]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	const handleAddProduct = (product: EventProduct) => {
		// Check if product already exists
		const exists = selectedProducts.find((p) => p.id === product.id);
		if (!exists) {
			setSelectedProducts([...selectedProducts, { ...product }]);
		}
	};

	const handleRemoveProduct = (productId: string) => {
		setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
	};

	const handleEditProduct = (product: EventProduct) => {
		setEditingProduct({ ...product });
	};

	const handleSaveEdit = () => {
		if (editingProduct) {
			setSelectedProducts(selectedProducts.map((p) =>
				p.id === editingProduct.id ? editingProduct : p,
			));
			setEditingProduct(null);
		}
	};

	const handleCancelEdit = () => {
		setEditingProduct(null);
	};

	const handleConfirm = () => {
		onSelectProducts(selectedProducts);
		setSelectedProducts([]);
		setSearchQuery('');
		setEditingProduct(null);
		onClose();
	};

	const handleCancel = () => {
		setSelectedProducts([]);
		setSearchQuery('');
		setEditingProduct(null);
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectProducts.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectProducts.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Selected Products */}
				{selectedProducts.length > 0 && (
					<Card withBorder p='sm' radius='md'>
						<Stack gap='xs'>
							<Text size='sm' fw={500}>
								{translate('nikki.vendingMachine.events.selectProducts.selectedProducts')} ({selectedProducts.length})
							</Text>
							<ScrollArea h={200}>
								<Table>
									<Table.Thead>
										<Table.Tr>
											<Table.Th style={{ width: 80 }}>{translate('nikki.vendingMachine.events.fields.productImage')}</Table.Th>
											<Table.Th>{translate('nikki.vendingMachine.events.fields.productCode')}</Table.Th>
											<Table.Th>{translate('nikki.vendingMachine.events.fields.productName')}</Table.Th>
											<Table.Th>{translate('nikki.vendingMachine.events.fields.originalPrice')}</Table.Th>
											<Table.Th>{translate('nikki.vendingMachine.events.fields.eventPrice')}</Table.Th>
											<Table.Th style={{ width: 100 }}></Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{selectedProducts.map((product) => (
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
												<Table.Td>
													<Group gap='xs'>
														<ActionIcon
															variant='subtle'
															color='blue'
															onClick={() => handleEditProduct(product)}
														>
															<IconEdit size={16} />
														</ActionIcon>
														<ActionIcon
															variant='subtle'
															color='red'
															onClick={() => handleRemoveProduct(product.id)}
														>
															<IconTrash size={16} />
														</ActionIcon>
													</Group>
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</ScrollArea>
						</Stack>
					</Card>
				)}

				{/* Edit Product Modal */}
				{editingProduct && (
					<Card withBorder p='sm' radius='md' bg='blue.0'>
						<Stack gap='xs'>
							<Text size='sm' fw={500}>
								{translate('nikki.vendingMachine.events.selectProducts.editProduct')}
							</Text>
							<Group gap='xs' align='flex-end'>
								<TextInput
									label={translate('nikki.vendingMachine.events.selectProducts.imageUrl')}
									value={editingProduct.image}
									onChange={(e) => setEditingProduct({ ...editingProduct, image: e.currentTarget.value })}
									style={{ flex: 1 }}
									leftSection={<IconPhoto size={16} />}
								/>
								<TextInput
									label={translate('nikki.vendingMachine.events.selectProducts.badgeImageUrl')}
									value={editingProduct.badgeImage || ''}
									onChange={(e) => setEditingProduct({ ...editingProduct, badgeImage: e.currentTarget.value || undefined })}
									style={{ flex: 1 }}
									leftSection={<IconPhoto size={16} />}
								/>
							</Group>
							<Group gap='xs' align='flex-end'>
								<NumberInput
									label={translate('nikki.vendingMachine.events.fields.originalPrice')}
									value={editingProduct.originalPrice}
									onChange={(value) => setEditingProduct({ ...editingProduct, originalPrice: Number(value) || 0 })}
									style={{ flex: 1 }}
									min={0}
									thousandSeparator=','
									suffix=' VND'
								/>
								<NumberInput
									label={translate('nikki.vendingMachine.events.fields.eventPrice')}
									value={editingProduct.eventPrice}
									onChange={(value) => setEditingProduct({ ...editingProduct, eventPrice: Number(value) || 0 })}
									style={{ flex: 1 }}
									min={0}
									thousandSeparator=','
									suffix=' VND'
								/>
							</Group>
							<Group justify='flex-end' gap='xs'>
								<Button variant='subtle' size='xs' onClick={handleCancelEdit}>
									{translate('nikki.general.actions.cancel')}
								</Button>
								<Button size='xs' onClick={handleSaveEdit}>
									{translate('nikki.general.actions.save')}
								</Button>
							</Group>
						</Stack>
					</Card>
				)}

				{/* Available Products Grid */}
				<Card withBorder p='sm' radius='md'>
					<Text size='sm' fw={500} mb='xs'>
						{translate('nikki.vendingMachine.events.selectProducts.availableProducts')}
					</Text>
					<ScrollArea h={300}>
						{filteredProducts.length === 0 ? (
							<Text size='sm' c='dimmed' ta='center' py='md'>
								{translate('nikki.vendingMachine.events.selectProducts.noProducts')}
							</Text>
						) : (
							<SimpleGrid cols={3} spacing='md'>
								{filteredProducts.map((product) => (
									<Card key={product.id} withBorder p='xs' radius='sm'>
										<Stack gap={4} align='center'>
											<Box pos='relative' w={80} h={80}>
												<Image
													src={product.image}
													alt={product.name}
													width={80}
													height={80}
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
											<Text size='xs' fw={500} ta='center' lineClamp={1}>
												{product.name}
											</Text>
											<Text size='xs' c='dimmed' ta='center'>
												{product.code}
											</Text>
											<Badge size='sm' variant='light' color='red'>
												{formatCurrency(product.eventPrice)}
											</Badge>
											<Button
												size='xs'
												fullWidth
												onClick={() => handleAddProduct(product)}
											>
												{translate('nikki.general.actions.add')}
											</Button>
										</Stack>
									</Card>
								))}
							</SimpleGrid>
						)}
					</ScrollArea>
				</Card>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedProducts.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
