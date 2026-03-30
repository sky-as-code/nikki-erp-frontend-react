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
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { IconClipboard, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '../../types';
import { useProductsGridTab } from './hooks/useProductsGridTab';


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
	kiosk: Kiosk;
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

interface GridCellProps {
	params: {
		data?: ProductPosition | null;
		row: string;
		col: number;
		isEditing: boolean;
	};
	onCopy: (row: string, col: number) => void;
	onPaste: (row: string, col: number) => void;
	onDelete: (row: string, col: number) => void;
	onQuantityChange: (row: string, col: number, value: number | string) => void;
	onMaxQuantityChange: (row: string, col: number, value: number | string) => void;
	onToggleEnabled: (row: string, col: number) => void;
	copiedCell: ProductPosition | null;
	emptyText: string;
}

const GridCellComponent: React.FC<GridCellProps> = ({
	params,
	onCopy,
	onPaste,
	onDelete,
	onQuantityChange,
	onMaxQuantityChange,
	onToggleEnabled,
	copiedCell,
	emptyText,
}) => {
	const [cell, setCell] = useState<ProductPosition | null>(params.data || null);
	const isEditing = params.isEditing;
	const hasProduct = cell?.productId;

	useEffect(() => {
		setCell(params.data || null);
	}, [params.data]);

	return (
		<Box
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
							onClick={() => onCopy(params.row, params.col)}
						>
							<IconCopy size={14} />
						</ActionIcon>
						<ActionIcon
							size='xs'
							variant='subtle'
							onClick={() => onPaste(params.row, params.col)}
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
							onClick={() => onDelete(params.row, params.col)}
							disabled={!hasProduct}
						>
							<IconTrash size={14} />
						</ActionIcon>
						<Switch
							size='xs'
							checked={cell?.enabled ?? true}
							onChange={() => onToggleEnabled(params.row, params.col)}
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
								onChange={(value) => {
									const newValue = typeof value === 'string' ? parseInt(value) || 0 : value;
									setCell({ ...cell!, quantity: newValue });
									onQuantityChange(params.row, params.col, newValue);
								}}
								min={0}
								max={cell?.maxQuantity || 5}
								style={{ width: 60 }}
							/>
							<Text size='xs'>/</Text>
							<NumberInput
								size='xs'
								value={cell?.maxQuantity || 5}
								onChange={(value) => {
									const newValue = typeof value === 'string' ? parseInt(value) || 5 : value;
									setCell({ ...cell!, maxQuantity: newValue });
									onMaxQuantityChange(params.row, params.col, newValue);
								}}
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
				// <Box>
				// 	<Text size='xs' c='dimmed' ta='center'>
				// 		{cell?.productName}
				// 	</Text>
				// 	<Text size='xs' c='dimmed' ta='center'>
				// 		{cell?.productCode}
				// 	</Text>
				// </Box>
			) : (
				<Stack gap='xs' align='center' justify='center' style={{ minHeight: 120 }}>
					{isEditing && (
						<>
							<ActionIcon
								size='xs'
								variant='subtle'
								onClick={() => onCopy(params.row, params.col)}
							>
								<IconCopy size={14} />
							</ActionIcon>
							<ActionIcon
								size='xs'
								variant='subtle'
								onClick={() => onPaste(params.row, params.col)}
								disabled={!copiedCell}
							>
								<IconClipboard size={14} />
							</ActionIcon>
						</>
					)}
					<Text size='xs' c='dimmed' ta='center'>
						{emptyText}
					</Text>
				</Stack>
			)}
		</Box>
	);
};

const GridCell = React.memo(GridCellComponent, (prevProps: GridCellProps, nextProps: GridCellProps) => {
	// Only re-render if relevant props changed
	return (
		prevProps.params.row === nextProps.params.row &&
		prevProps.params.col === nextProps.params.col &&
		prevProps.params.isEditing === nextProps.params.isEditing &&
		prevProps.params.data?.productId === nextProps.params.data?.productId &&
		prevProps.params.data?.quantity === nextProps.params.data?.quantity &&
		prevProps.params.data?.maxQuantity === nextProps.params.data?.maxQuantity &&
		prevProps.params.data?.enabled === nextProps.params.data?.enabled &&
		prevProps.params.data?.productName === nextProps.params.data?.productName &&
		prevProps.params.data?.productCode === nextProps.params.data?.productCode &&
		prevProps.params.data?.productImage === nextProps.params.data?.productImage &&
		prevProps.copiedCell === nextProps.copiedCell &&
		prevProps.emptyText === nextProps.emptyText
	);
});

GridCell.displayName = 'GridCell';

export const ProductGridView: React.FC<ProductGridViewProps> = ({
	kiosk: _Kiosk,
}) => {
	const { t: translate } = useTranslation();
	const [gridData, setGridData] = useState<Record<string, ProductPosition>>(generateMockGridData());
	const [copiedCell, setCopiedCell] = useState<ProductPosition | null>(null);

	const onResetGrid = useCallback(() => setGridData(generateMockGridData()), []);

	const {
		isEditing,
		handleEdit,
		handleCancel,
		handleDiscardChanges,
		handleLoadAll,
	} = useProductsGridTab({ translate, onResetGrid });

	const rows = useMemo(() => {
		return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 7); // A-J for demo
	}, []);

	const cols = useMemo(() => {
		return Array.from({ length: 10 }, (_, i) => i + 1);
	}, []);

	const emptyText = useMemo(() => translate('nikki.vendingMachine.kiosk.products.empty'), [translate]);

	const handleCopy = useCallback((row: string, col: number) => {
		const cell = gridData[`${row}:${col}`];
		if (cell) {
			setCopiedCell(cell);
		}
	}, [gridData]);

	const handlePaste = useCallback((row: string, col: number) => {
		if (copiedCell) {
			const key = `${row}:${col}`;
			setGridData((prev) => ({
				...prev,
				[key]: {
					...copiedCell,
					row,
					col,
				},
			}));
		}
	}, [copiedCell]);

	const handleDelete = useCallback((row: string, col: number) => {
		const key = `${row}:${col}`;
		setGridData((prev) => {
			const cell = prev[key];
			if (!cell) return prev;
			return {
				...prev,
				[key]: {
					...cell,
					productId: undefined,
					productCode: undefined,
					productName: undefined,
					productImage: undefined,
					quantity: 0,
				},
			};
		});
	}, []);

	const handleQuantityChange = useCallback((row: string, col: number, value: number | string) => {
		const key = `${row}:${col}`;
		setGridData((prev) => {
			const cell = prev[key];
			if (!cell) return prev;
			return {
				...prev,
				[key]: {
					...cell,
					quantity: typeof value === 'string' ? parseInt(value) || 0 : value,
				},
			};
		});
	}, []);

	const handleMaxQuantityChange = useCallback((row: string, col: number, value: number | string) => {
		const key = `${row}:${col}`;
		setGridData((prev) => {
			const cell = prev[key];
			if (!cell) return prev;
			return {
				...prev,
				[key]: {
					...cell,
					maxQuantity: typeof value === 'string' ? parseInt(value) || 0 : value,
				},
			};
		});
	}, []);

	const handleToggleEnabled = useCallback((row: string, col: number) => {
		const key = `${row}:${col}`;
		setGridData((prev) => {
			const cell = prev[key];
			if (!cell) return prev;
			return {
				...prev,
				[key]: {
					...cell,
					enabled: !cell.enabled,
				},
			};
		});
	}, []);

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
							<Button size='xs' variant='outline' onClick={handleCancel}>
								{translate('nikki.vendingMachine.kiosk.products.actions.viewOnly')}
							</Button>
						</>
					) : (
						<Button size='xs' onClick={handleEdit}>
							{translate('nikki.general.actions.edit')}
						</Button>
					)}
				</Group>
			</Group>

			<Box
				style={{
					position: 'relative',
					overflow: 'auto',
					maxHeight: 'max-content',
					border: '1px solid var(--mantine-color-gray-3)',
					borderRadius: 'var(--mantine-radius-md)',
				}}
			>
				<Box style={{ position: 'relative' }}>

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


							{cols.map((col) => {
								const cell = gridData[`${row}:${col}`];

								return (
									<GridCell
										key={`${row}:${col}`}
										params={{
											data: cell,
											row,
											col,
											isEditing,
										}}
										onCopy={handleCopy}
										onPaste={handlePaste}
										onDelete={handleDelete}
										onQuantityChange={handleQuantityChange}
										onMaxQuantityChange={handleMaxQuantityChange}
										onToggleEnabled={handleToggleEnabled}
										copiedCell={copiedCell}
										emptyText={emptyText}
									/>
								);
							})}
						</Group>
					))}
				</Box>
			</Box>
		</Stack>
	);
};
