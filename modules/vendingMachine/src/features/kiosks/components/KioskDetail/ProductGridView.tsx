/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Button,
	Center,
	Group,
	NumberInput,
	ScrollArea,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { IconClipboard, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';


interface ProductPosition {
	row: string;
	col: number;
	productId?: string;
	productCode?: string;
	productName?: string;
	productImage?: string;
	quantity: number;
	maxQuantity: number;
	enabled: boolean;
}

interface ProductGridViewProps {
	kioskId: string;
}

// Mock data - replace with actual API call
const generateMockGridData = (): Record<string, ProductPosition> => {
	const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	const cols = Array.from({ length: 10 }, (_, i) => i + 1);
	const data: Record<string, ProductPosition> = {};

	// Sample products
	const products = [
		{ id: '1', code: 'ttc-revive', name: 'Revive', image: 'https://via.placeholder.com/50' },
		{ id: '2', code: 'ttc-xim-coconut-water', name: 'Nước dừa Xim Thạch', image: 'https://via.placeholder.com/50' },
		{ id: '3', code: 'ttc-dakai-water', name: 'Nước Khoáng kiềm thiên nhiên', image: 'https://via.placeholder.com/50' },
	];

	rows.forEach((row, rowIdx) => {
		cols.forEach((col) => {
			const key = `${row}:${col}`;
			const productIdx = (rowIdx * cols.length + col - 1) % products.length;
			const product = products[productIdx];
			data[key] = {
				row,
				col,
				productId: product.id,
				productCode: product.code,
				productName: product.name,
				productImage: product.image,
				quantity: Math.floor(Math.random() * 5) + 1,
				maxQuantity: 5,
				enabled: true,
			};
		});
	});

	return data;
};

export const ProductGridView: React.FC<ProductGridViewProps> = ({ kioskId: _kioskId }) => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [gridData, setGridData] = useState<Record<string, ProductPosition>>(generateMockGridData());
	const [copiedCell, setCopiedCell] = useState<ProductPosition | null>(null);

	const rows = useMemo(() => {
		return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 10); // A-J for demo
	}, []);

	const cols = useMemo(() => {
		return Array.from({ length: 10 }, (_, i) => i + 1);
	}, []);

	const getCellData = (row: string, col: number): ProductPosition | undefined => {
		return gridData[`${row}:${col}`];
	};

	const handleCopy = (row: string, col: number) => {
		const cell = getCellData(row, col);
		if (cell) {
			setCopiedCell(cell);
		}
	};

	const handlePaste = (row: string, col: number) => {
		if (copiedCell) {
			const key = `${row}:${col}`;
			setGridData({
				...gridData,
				[key]: {
					...copiedCell,
					row,
					col,
				},
			});
		}
	};

	const handleDelete = (row: string, col: number) => {
		const key = `${row}:${col}`;
		const cell = getCellData(row, col);
		if (cell) {
			setGridData({
				...gridData,
				[key]: {
					...cell,
					productId: undefined,
					productCode: undefined,
					productName: undefined,
					productImage: undefined,
					quantity: 0,
				},
			});
		}
	};

	const handleQuantityChange = (row: string, col: number, value: number | string) => {
		const key = `${row}:${col}`;
		const cell = getCellData(row, col);
		if (cell) {
			setGridData({
				...gridData,
				[key]: {
					...cell,
					quantity: typeof value === 'string' ? parseInt(value) || 0 : value,
				},
			});
		}
	};

	const handleMaxQuantityChange = (row: string, col: number, value: number | string) => {
		const key = `${row}:${col}`;
		const cell = getCellData(row, col);
		if (cell) {
			setGridData({
				...gridData,
				[key]: {
					...cell,
					maxQuantity: typeof value === 'string' ? parseInt(value) || 0 : value,
				},
			});
		}
	};

	const handleToggleEnabled = (row: string, col: number) => {
		const key = `${row}:${col}`;
		const cell = getCellData(row, col);
		if (cell) {
			setGridData({
				...gridData,
				[key]: {
					...cell,
					enabled: !cell.enabled,
				},
			});
		}
	};

	const handleDiscardChanges = () => {
		setGridData(generateMockGridData());
		setIsEditing(false);
	};

	const handleLoadAll = () => {
		// TODO: Implement load all from API
	};

	return (
		<Stack gap='sm'>
			<Group justify='space-between'>
				<div></div>
				<Group gap='xs'>
					{isEditing ? (
						<>
							<Button size='xs' variant='outline' onClick={handleDiscardChanges}>
								{translate('nikki.vendingMachine.kiosk.products.actions.discardChanges')}
							</Button>
							<Button size='xs' variant='outline' onClick={handleLoadAll}>
								{translate('nikki.vendingMachine.kiosk.products.actions.loadAll')}
							</Button>
							<Button size='xs' variant='outline' onClick={() => setIsEditing(false)}>
								{translate('nikki.vendingMachine.kiosk.products.actions.viewOnly')}
							</Button>
						</>
					) : (
						<Button size='xs' onClick={() => setIsEditing(true)}>
							{translate('nikki.general.actions.edit')}
						</Button>
					)}
				</Group>
			</Group>

			<Box
				style={{
					position: 'relative',
					overflow: 'auto',
					maxHeight: '70vh',
					border: '1px solid var(--mantine-color-gray-3)',
					borderRadius: 'var(--mantine-radius-md)',
				}}
			>
				<ScrollArea>
					<Box style={{ position: 'relative' }}>
						{/* Sticky Column Headers */}
						<Box
							style={{
								position: 'sticky',
								top: 0,
								zIndex: 10,
								backgroundColor: 'var(--mantine-color-white)',
								borderBottom: '2px solid var(--mantine-color-gray-4)',
							}}
						>
							<Group gap={0} style={{ paddingLeft: 60 }} wrap='nowrap'>
								{cols.map((col) => (
									<Box
										key={col}
										style={{
											width: 200,
											padding: '8px',
											textAlign: 'center',
											borderRight: '1px solid var(--mantine-color-gray-3)',
											fontWeight: 600,
										}}
									>
										{col}
									</Box>
								))}
							</Group>
						</Box>

						{/* Grid Content */}
						{rows.map((row) => (
							<Group key={row} gap={0} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }} wrap='nowrap'>
								{/* Sticky Row Header */}
								<Center
									style={{
										position: 'sticky',
										left: 0,
										zIndex: 9,
										width: 60,
										padding: '8px',
										textAlign: 'center',
										backgroundColor: 'var(--mantine-color-white)',
										borderRight: '2px solid var(--mantine-color-gray-4)',
										fontWeight: 600,
										height: '100%',
										minHeight: 180,
									}}
								>
									{row}
								</Center>

								{/* Grid Cells */}
								{cols.map((col) => {
									const cell = getCellData(row, col);
									const hasProduct = cell?.productId;

									return (
										<Box
											key={`${row}:${col}`}
											style={{
												width: 200,
												minHeight: 180,
												padding: '8px',
												borderRight: '1px solid var(--mantine-color-gray-3)',
												backgroundColor: cell?.enabled === false ? 'var(--mantine-color-gray-1)' : undefined,
											}}
										>
											{isEditing && (
												<Group gap='xs' mb='xs' justify='space-between'>
													<Group gap='xs'>
														<ActionIcon
															size='xs'
															variant='subtle'
															onClick={() => handleCopy(row, col)}
														>
															<IconCopy size={14} />
														</ActionIcon>
														<ActionIcon
															size='xs'
															variant='subtle'
															onClick={() => handlePaste(row, col)}
															disabled={!copiedCell}
														>
															<IconClipboard size={14} />
														</ActionIcon>
													</Group>
													<Group gap='xs'>
														<ActionIcon
															size='xs'
															variant='subtle'
															color='red'
															onClick={() => handleDelete(row, col)}
															disabled={!hasProduct}
														>
															<IconTrash size={14} />
														</ActionIcon>
														<Switch
															size='xs'
															checked={cell?.enabled ?? true}
															onChange={() => handleToggleEnabled(row, col)}
														/>
														<ActionIcon size='xs' variant='subtle' color='blue'>
															<IconEdit size={14} />
														</ActionIcon>
													</Group>
												</Group>
											)}

											{hasProduct ? (
												<Stack gap='xs' align='center'>
													<Avatar src={cell?.productImage} alt={cell?.productName} size='md' />
													<Text size='xs' fw={500} ta='center' lineClamp={1}>
														{cell?.productName}
													</Text>
													<Text size='xs' c='dimmed' ta='center'>
														(code: {cell?.productCode})
													</Text>
													{isEditing ? (
														<Group gap='xs' align='center'>
															<NumberInput
																size='xs'
																value={cell?.quantity || 0}
																onChange={(value) =>
																	handleQuantityChange(row, col, value || 0)}
																min={0}
																max={cell?.maxQuantity || 5}
																style={{ width: 60 }}
															/>
															<Text size='xs'>/</Text>
															<NumberInput
																size='xs'
																value={cell?.maxQuantity || 5}
																onChange={(value) =>
																	handleMaxQuantityChange(row, col, value || 5)}
																min={1}
																style={{ width: 60 }}
															/>
														</Group>
													) : (
														<Badge color='green' size='sm'>
															{cell?.quantity || 0}/{cell?.maxQuantity || 5}
														</Badge>
													)}
												</Stack>
											) : (
												<Stack gap='xs' align='center' justify='center' style={{ minHeight: 120 }}>
													{isEditing && (
														<>
															<ActionIcon
																size='xs'
																variant='subtle'
																onClick={() => handleCopy(row, col)}
															>
																<IconCopy size={14} />
															</ActionIcon>
															<ActionIcon
																size='xs'
																variant='subtle'
																onClick={() => handlePaste(row, col)}
																disabled={!copiedCell}
															>
																<IconClipboard size={14} />
															</ActionIcon>
														</>
													)}
													<Text size='xs' c='dimmed' ta='center'>
														{translate('nikki.vendingMachine.kiosk.products.empty')}
													</Text>
												</Stack>
											)}
										</Box>
									);
								})}
							</Group>
						))}
					</Box>
				</ScrollArea>
			</Box>
		</Stack>
	);
};
