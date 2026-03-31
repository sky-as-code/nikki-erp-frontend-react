/* eslint-disable max-lines-per-function */
import { Box, Button, Center, Flex, Image, NumberInput, Stack, Switch, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import {
	IconCircleCheck, IconDeviceTabletExclamation,
	IconEdit, IconPlus, IconTrash, IconClipboard, IconCopy,
} from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState, FC, memo as reactMemo, useMemo } from 'react';

import { useProductsGridTab } from './hooks';
import { MOCK_PRODUCTS } from './mockProducts';
import { Kiosk } from '../../types';



// Types
type TypeCellItem = {
	idStockModel: string;
	name: string;
	code: string;
	imageUrl: string;
	row: string;
	col: string;
	status: string;
	quantity: number;
	maxQuantity: number;
};

type RowItem = {
	[key: string]: TypeCellItem | string;
	row: string;
};

type InternalShelfItem = {
	idShelf: string;
	row: string;
	type: string;
	slotNumber: number;
};

type CellClipboard = {
	idStockModel: string;
	warningQuantity?: number;
	basePrice: number;
	sellingPrice: number;
	stockModel: {
		_id: string;
		name: string;
		code: string;
		imageUrl: string;
	};
	newPosition: {
		quantity: number;
		maximumQuantity: number;
		status: string;
	};
};

type RetailKioskStockItem = {
	_id: string;
	imageUrl: string;
	code: string;
	name: {
		vn: string;
		eng: string;
	};
	warningQuantity?: number;
	basePrice: number;
	sellingPrice: number;
	positions: {
		row: string;
		col: string;
		quantity: number;
		maximumQuantity: number;
		status: string;
	}[];
	idStockSetting?: string;
};

type StockModel = {
	_id: string;
	name: string;
	code: string;
	image?: string;
};

interface StockGridViewProps {
	kiosk: Kiosk;
}

// Mock function to get image URL - replace with actual implementation
const getUrlImage = (image: string): string => {
	return image.startsWith('http') ? image : '';
};

const generateMockStockGrid = (rowNumber: number = 10): RetailKioskStockItem[] => {
	const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rowNumber);
	const cols = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
	const products: RetailKioskStockItem[] = [];

	rows.forEach((row, rowIdx) => {
		cols.forEach((col) => {
			const cellIndex = rowIdx * cols.length + parseInt(col, 10) - 1;
			const productIdx = cellIndex % MOCK_PRODUCTS.length;
			const product = MOCK_PRODUCTS[productIdx];
			const maxQty = 5;
			const quantity = (cellIndex % maxQty) + 1;

			let existingProduct = products.find((p) => p._id === product.id);
			if (!existingProduct) {
				existingProduct = {
					_id: product.id,
					code: product.code,
					name: { vn: product.name, eng: product.name },
					imageUrl: product.image || '',
					basePrice: 10_000,
					sellingPrice: 15_000,
					positions: [],
				};
				products.push(existingProduct);
			}

			existingProduct.positions.push({
				row,
				col,
				quantity,
				maximumQuantity: maxQty,
				status: 'Enable',
			});
		});
	});

	return products;
};


type CellStockProps = {
	params: {
		data?: TypeCellItem | null;
		row: string;
		col: string;
		isReadOnly: boolean;
	};
	openModalAddStockToKiosk: (row: string, col: string) => void;
	handleCopyCell: (cell: TypeCellItem) => void;
	handlePasteCell: (row: string, col: string) => void;
	removeStock: (row: string, col: string) => void;
	handleEditCell: (cell: TypeCellItem) => void;
	openModalEditStockInKiosk: (row: string, col: string) => void;
};

const CellStockComponent: FC<CellStockProps> = (props) => {
	const {
		params,
		openModalAddStockToKiosk,
		handleCopyCell,
		handlePasteCell,
		removeStock,
		handleEditCell,
		openModalEditStockInKiosk,
	} = props;

	const currentRow: string = params.row;
	const currentCol: string = params.col;
	const isShowBtn = !params.isReadOnly;

	const [cell, setCell] = useState<TypeCellItem | null>(params.data || null);
	const isHasQuantity = cell?.quantity || cell?.quantity === 0;
	const isHasMaxQuantity = cell?.maxQuantity || cell?.maxQuantity === 0;

	const quantityStr =
		isHasQuantity || isHasMaxQuantity
			? `${isHasQuantity ? cell.quantity : '_'}/${isHasMaxQuantity ? cell.maxQuantity : '_'}`
			: '';

	const btnAssign = (
		<Button
			size='xs'
			variant='light'
			onClick={() => openModalAddStockToKiosk(currentRow, currentCol)}
		>
			<IconPlus size={19} />
		</Button>
	);
	const btnCopy = (
		<Button
			size='xs'
			variant='light'
			onClick={() => cell && handleCopyCell(cell)}
		>
			<IconCopy size={19} />
		</Button>
	);
	const btnPaste = (
		<Button
			size='xs'
			variant='light'
			onClick={() => handlePasteCell(currentRow, currentCol)}
		>
			<IconClipboard size={19} />
		</Button>
	);

	useEffect(() => {
		setCell(params.data || null);
	}, [params.data]);

	return (
		<Stack
			component='div'
			pos='relative'
			miw={160} w={'100%'} h={200}
			bdrs={'xs'} gap={2} p={6}
			justify='center' align='center'
			bd='1px solid rgba(0, 0, 0, 0.1)'
		>
			{!cell ? (
				isShowBtn
					? <Stack justify='center' align='center' gap={5} w='100%'>
						{btnAssign}
						{btnPaste}
					</Stack>
					: <Stack justify='center' align='center' gap={5} w='100%'>
						<Center w={80} h={80} bdrs='xs' bg='gray.1'>
							<IconDeviceTabletExclamation stroke={1.5} size={52} color='var(--mantine-color-gray-5)'/>
						</Center>
						<Text size='xs' ta='center' c='dimmed' lineClamp={1}>No stock</Text>
					</Stack>
			) : (
				<>
					<Flex justify='space-between' gap={3}>
						<Box w={80} h={80} bdrs='xs' bg='gray.1'>
							<Image
								alt='stock'
								w='100%' h='100%' p={3}
								fit='contain'
								onError={(e: any) => {
									e.target.src = blankPicture;
								}}
								loading='lazy'
								src={cell?.imageUrl ? cell.imageUrl : blankPicture}
							/>
						</Box>
						{isShowBtn && (
							<Stack w={60} gap={5} justify='center' align='center' bg='gray.1'>
								{btnCopy}
								{btnPaste}
							</Stack>
						)}
					</Flex>

					<Text size='sm' ta='center' lineClamp={1}>
						{cell?.name}
					</Text>
					<Text size='xs' ta='center' c='dimmed' lineClamp={1}>
						(code: {cell?.code || '---'})
					</Text>

					{isShowBtn ? (
						<>
							<Flex gap={2}>
								<NumberInput
									size='xs' fz={'sm'} fw={500}
									min={0} max={cell?.maxQuantity || 5}
									value={cell?.quantity || 0}
									onBlur={(_e) => {
										if (!cell?.quantity && cell?.quantity !== 0) {
											setCell({
												...cell,
												quantity: 0,
											});
											handleEditCell({ ...cell, quantity: 0 });
										}
										if (cell && cell.quantity > cell.maxQuantity) {
											setCell({
												...cell,
												quantity: cell.maxQuantity || 0,
											});
											handleEditCell({ ...cell, quantity: cell.maxQuantity || 0 });
										}
									}}
									onChange={(e: any) => {
										const value = e.target?.value;
										setCell({ ...cell, quantity: value });
										if (value && value <= cell.maxQuantity && value >= 0) {
											handleEditCell({
												...cell,
												quantity: Number(value) || 0,
											});
										}
									}}
								/>
								<Center bd='1px solid rgba(0, 0, 0, 0.1)' w={60} fz={'sm'} fw={500}>
									{cell?.maxQuantity}
								</Center>
							</Flex>

							<Flex w='100%' gap={5} justify='space-around' align='center' bg='gray.1'>
								<Button
									size='xs'
									variant='subtle'
									color='red'
									onClick={() => removeStock(params.row, params.col)}
								>
									<IconTrash size={19} />
								</Button>
								<Switch
									size='xs'
									checked={cell.status === 'Enable'}
									onChange={(event) => {
										const isChecked = event.currentTarget.checked;
										setCell({
											...cell,
											status: isChecked ? 'Enable' : 'Disable',
										});
										handleEditCell({
											...cell,
											status: isChecked ? 'Enable' : 'Disable',
										});
									}}
								/>
								<Button
									size='xs'
									variant='subtle'
									onClick={() => openModalEditStockInKiosk(params.row, params.col)}
								>
									<IconEdit size={19} />
								</Button>
							</Flex>
						</>
					) : (
						<Flex justify='center' align='center' gap={5}>
							<IconCircleCheck
								size={19}
								color={cell.status === 'Enable' ? 'limegreen' : 'red'}
							/>
							<span>{quantityStr}</span>
						</Flex>
					)}
				</>
			)}
		</Stack>
	);
};

const CellStock = reactMemo(CellStockComponent, (prevProps: CellStockProps, nextProps: CellStockProps) => {
	// Only re-render if relevant props changed
	return (
		prevProps.params.row === nextProps.params.row &&
		prevProps.params.col === nextProps.params.col &&
		prevProps.params.isReadOnly === nextProps.params.isReadOnly &&
		prevProps.params.data?.idStockModel === nextProps.params.data?.idStockModel &&
		prevProps.params.data?.name === nextProps.params.data?.name &&
		prevProps.params.data?.code === nextProps.params.data?.code &&
		prevProps.params.data?.imageUrl === nextProps.params.data?.imageUrl &&
		prevProps.params.data?.status === nextProps.params.data?.status &&
		prevProps.params.data?.quantity === nextProps.params.data?.quantity &&
		prevProps.params.data?.maxQuantity === nextProps.params.data?.maxQuantity
	);
});


export const ProductGridView: FC<StockGridViewProps> = (props: StockGridViewProps) => {
	const { kiosk } = props;
	const rowNumber = 10;
	const shelves: InternalShelfItem[] = [];

	const handleReset = async () => {
		const res = await callGetKioskDetail({ id: kiosk.id });
		const kioskInfo = res?.data?.getEquipmentDetailsById;
		if (!kioskInfo) {
			notifications.show({
				title: 'Error',
				message: 'Get kiosk detail failed',
				color: 'red',
			});
			return;
		}

		internalStockGridNew.current = kioskInfo.stockGrid || [];
		const newRowData = computeRowDataFromStockGrid(
			internalStockGridNew.current,
			rowNumber,
		);
		setRowData(newRowData);
		setInternalIsEditing(false);
	};

	const { isEditing: externalIsEditing, isPending } = useProductsGridTab({ onResetGrid: handleReset});
	const [internalIsEditing, setInternalIsEditing] = useState(false);
	const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
	const readOnly = !isEditing;

	const internalStockGridNew = useRef<RetailKioskStockItem[]>([]);
	const internalKioskShelves = useRef<InternalShelfItem[]>(shelves);
	const cellClipboard = useRef<CellClipboard | null>(null);
	const refSelectedStockModel = useRef<StockModel[]>([]);

	const [rowData, setRowData] = useState<RowItem[]>([]);

	// Mock API calls - replace with actual GraphQL queries
	const getDropdownStockModel = (_variables: { limit: number; keyword: string; idsDefault: string[] }) => {
		// Mock implementation
		setTimeout(() => {
			refSelectedStockModel.current = [];
			const newRowData = computeRowDataFromStockGrid(
				internalStockGridNew.current,
				rowNumber,
			);
			setRowData(newRowData);
		}, 100);
	};

	const callGetKioskDetail = async (_variables: { id: string }) => {
		// Mock implementation
		return {
			data: {
				getEquipmentDetailsById: {
					_id: _variables.id,
					stockGrid: generateMockStockGrid(rowNumber),
					rowNumber,
				},
			},
		};
	};

	const callUpdateStockGrid = (_variables: { id: string; stockGrid: RetailKioskStockItem[] }) => {
		// Mock implementation
		setTimeout(() => {
			notifications.show({
				title: 'Success',
				message: 'Update successfully',
				color: 'green',
			});
			setInternalIsEditing(false);
		}, 500);
	};

	const openModalAddStockToKiosk = useCallback((row: string, col: string) => {
		// Mock implementation - replace with actual modal
		notifications.show({
			title: 'Info',
			message: `Add stock to ${row}${col}`,
			color: 'blue',
		});
	}, []);

	const openModalEditStockInKiosk = useCallback((row: string, col: string) => {
		// Mock implementation - replace with actual modal
		notifications.show({
			title: 'Info',
			message: `Edit stock at ${row}${col}`,
			color: 'blue',
		});
	}, []);

	const removeStock = useCallback((removeAtRow: string, removeAtCol: string) => {
		let currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);
		const stockAtCurrentPosition = currentStockGrid.find((stock) =>
			stock.positions.some(
				(position) => position.row == removeAtRow && position.col == removeAtCol,
			),
		);
		if (!stockAtCurrentPosition) return;

		// remove position from stock
		stockAtCurrentPosition.positions = stockAtCurrentPosition.positions.filter(
			(position) => position.row != removeAtRow || position.col != removeAtCol,
		);
		// remove stock if no position left
		if (!stockAtCurrentPosition.positions.length) {
			currentStockGrid = currentStockGrid.filter(
				(stock) => stock.positions.length > 0,
			);
		}

		// update ref and form field
		internalStockGridNew.current = currentStockGrid;
		const newRowData = computeRowDataFromStockGrid(
			internalStockGridNew.current,
			rowNumber,
		);
		setRowData(newRowData);
		// enable save button
		setInternalIsEditing(true);
	}, [rowNumber]);

	const handleRefillAll = () => {
		const currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);
		currentStockGrid.forEach((stock) => {
			stock.positions.forEach((position) => {
				position.quantity = position.maximumQuantity;
			});
		});

		internalStockGridNew.current = currentStockGrid;
		const newRowData = computeRowDataFromStockGrid(
			internalStockGridNew.current,
			rowNumber,
		);
		setRowData(newRowData);

		// auto save stock grid
		callUpdateStockGrid({
			id: kiosk.id,
			stockGrid: currentStockGrid,
		});
	};

	const handleSave = () => {
		if (!isEditing) return;
		const currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);

		// auto save stock grid
		callUpdateStockGrid({
			id: kiosk.id,
			stockGrid: currentStockGrid,
		});

		// search stock model
		const stockIds = internalStockGridNew.current.map((stock: any) => stock._id);
		getDropdownStockModel({
			limit: 1000,
			keyword: 'randomkeywordnotfound',
			idsDefault: stockIds,
		});
	};



	const handleCopyCell = useCallback((cell: TypeCellItem) => {
		const { idStockModel, name, code, imageUrl, status, quantity, maxQuantity } = cell;

		const stockExisted = internalStockGridNew.current.find(
			(stock) => stock._id === idStockModel,
		);

		if (!stockExisted) return;

		const cellClone: CellClipboard = {
			idStockModel,
			warningQuantity: stockExisted.warningQuantity,
			basePrice: stockExisted.basePrice,
			sellingPrice: stockExisted.sellingPrice,
			stockModel: {
				_id: idStockModel,
				name,
				code,
				imageUrl,
			},
			newPosition: {
				quantity,
				maximumQuantity: maxQuantity,
				status,
			},
		};
		cellClipboard.current = cellClone;
		notifications.show({
			title: 'Success',
			message: 'Cell copied',
			color: 'green',
		});
	}, []);

	const handlePasteCell = useCallback((row: string, col: string) => {
		if (!cellClipboard.current) {
			notifications.show({
				title: 'Error',
				message: 'No cell copied',
				color: 'red',
			});
			return;
		}
		const {
			idStockModel,
			stockModel,
			newPosition,
			basePrice,
			sellingPrice,
			warningQuantity,
		} = cellClipboard.current;

		let currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);

		const stockAtCurrentPosition = currentStockGrid.find((stock) =>
			stock.positions.some((position) => position.row == row && position.col == col),
		);
			// if current place has diff stock, remove old stock
		if (stockAtCurrentPosition?._id && stockAtCurrentPosition?._id != idStockModel) {
			// remove position from stock
			stockAtCurrentPosition.positions = stockAtCurrentPosition.positions.filter(
				(position) => position.row != row || position.col != col,
			);
			// remove stock if no position left
			if (!stockAtCurrentPosition.positions.length) {
				currentStockGrid = currentStockGrid.filter(
					(stock) => stock.positions.length > 0,
				);
			}
			// update ref and form field
			internalStockGridNew.current = currentStockGrid;
		}

		// compute new list position
		const stockExisted = internalStockGridNew.current.find(
			(stock) => stock._id === idStockModel,
		);
		let newPositionList: RetailKioskStockItem['positions'] = JSON.parse(
			JSON.stringify(stockExisted?.positions || []),
		);
		newPositionList = newPositionList.filter(
			(position) => position.row != row || position.col != col,
		);
		newPositionList.push({
			row,
			col,
			quantity: newPosition.quantity,
			maximumQuantity: newPosition.maximumQuantity,
			status: newPosition.status,
		});
		handleEditStock({
			idStockModel,
			warningQuantity,
			basePrice,
			sellingPrice,
			row,
			col,
			stockModel,
			positions: newPositionList as any[],
		});
	}, [rowNumber]);

	const _handleAddStock = (newStockData: {
		idStockModel: string;
		warningQuantity?: number;
		basePrice: number;
		sellingPrice: number;
		row: string;
		col: string;
		stockModel: {
			_id: string;
			code: string;
			name: string;
			imageUrl: string;
		};
		positions: {
			col: string;
			row: string;
			quantity: number;
			maximumQuantity: number;
			status: string;
		}[];
		idStockSetting?: string;
	}) => {
		const currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);
		const stockExisted = currentStockGrid.find(
			(stock) => stock._id === newStockData.idStockModel,
		);
		const newStock: RetailKioskStockItem = {
			_id: newStockData.idStockModel,
			imageUrl: newStockData.stockModel.imageUrl,
			code: newStockData.stockModel?.code || '',
			name: {
				vn: newStockData.stockModel.name,
				eng: newStockData.stockModel.name,
			},
			warningQuantity: newStockData.warningQuantity,
			basePrice: newStockData.basePrice,
			sellingPrice: newStockData.sellingPrice,
			positions: newStockData.positions,
			idStockSetting: newStockData.idStockSetting,
		};
			// if not found, push new stock
		if (!stockExisted) {
			currentStockGrid.push(newStock);
		}
		else {
			// if found, replace some content in stockFound
			Object.assign(stockExisted, newStock);
		}
		// update ref and form field
		internalStockGridNew.current = currentStockGrid;

		// search stock model
		const stockIds = internalStockGridNew.current.map((stock: any) => stock._id);
		getDropdownStockModel({
			limit: 1000,
			keyword: 'randomkeywordnotfound',
			idsDefault: stockIds,
		});
		setInternalIsEditing(true);
	};

	const handleEditCell = useCallback((cell: TypeCellItem) => {
		const { row, col, idStockModel, quantity, status, maxQuantity } = cell;

		// compute new list position
		const stockExisted = internalStockGridNew.current.find(
			(stock) => stock._id === idStockModel,
		);
		const stockPositions: RetailKioskStockItem['positions'] = JSON.parse(
			JSON.stringify(stockExisted?.positions || []),
		);
		stockPositions.forEach((position) => {
			if (position.row == row && position.col == col) {
				position.status = status;
				position.quantity = Number(quantity) || 0;
				position.maximumQuantity = Number(maxQuantity) || 3;
			}
		});
		if (stockExisted) {
			handleEditStock({
				idStockModel,
				warningQuantity: stockExisted.warningQuantity ?? undefined,
				basePrice: stockExisted.basePrice ?? 0,
				sellingPrice: stockExisted.sellingPrice ?? 0,
				row,
				col,
				stockModel: {
					_id: idStockModel,
					name: stockExisted.name?.vn ?? '',
					code: stockExisted.code ?? '',
					imageUrl: stockExisted.imageUrl ?? '',
				},
				positions: stockPositions as any[],
			});
		}
	}, [rowNumber]);

	const handleEditStock = useCallback((newStockData: {
		idStockModel: string;
		warningQuantity?: number;
		basePrice: number;
		sellingPrice: number;
		row: string;
		col: string;
		stockModel: {
			_id: string;
			name: string;
			code: string;
			imageUrl: string;
		};
		positions: {
			col: string;
			row: string;
			quantity: number;
			maximumQuantity: number;
			status: string;
		}[];
		idStockSetting?: string;
	}) => {
		const currentStockGrid: RetailKioskStockItem[] = JSON.parse(
			JSON.stringify(internalStockGridNew.current),
		);
		const stockExisted = currentStockGrid.find(
			(stock) => stock._id === newStockData.idStockModel,
		);
		const newStock: RetailKioskStockItem = {
			_id: newStockData.idStockModel,
			imageUrl: newStockData.stockModel.imageUrl,
			code: newStockData.stockModel?.code || '',
			name: {
				vn: newStockData.stockModel.name,
				eng: newStockData.stockModel.name,
			},
			warningQuantity: newStockData.warningQuantity,
			basePrice: newStockData.basePrice,
			sellingPrice: newStockData.sellingPrice,
			positions: newStockData.positions,
			idStockSetting: newStockData.idStockSetting,
		};
			// if not found, push new stock
		if (!stockExisted) {
			currentStockGrid.push(newStock);
		}
		else {
			// if found, replace some content in stockFound
			Object.assign(stockExisted, newStock);
		}
		// update ref and form field
		internalStockGridNew.current = currentStockGrid;

		// set rowData
		const newRowData = computeRowDataFromStockGrid(
			currentStockGrid,
			rowNumber,
		);
		setRowData(newRowData);
		setInternalIsEditing(true);
	}, [rowNumber]);

	const computeRowDataFromStockGrid = (
		stockGridInput: RetailKioskStockItem[],
		rowNum: number = 10,
	) => {
		const baseRowData: RowItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			.split('')
			.slice(0, rowNum)
			.map((rowKey) => ({ row: rowKey }));

		// base on rowNumber, remove row from baseRowData
		if (!stockGridInput || !stockGridInput.length) return baseRowData;

		// setup rowData
		stockGridInput.forEach((stock) => {
			const stockModelFound: StockModel | undefined = (refSelectedStockModel.current || []).find(
				(stockModel: any) => stockModel._id === stock._id,
			);

			stock.positions.forEach((position) => {
				const needUpdateRow = baseRowData.find((row) => row.row == position.row);
				if (!needUpdateRow) return;
				needUpdateRow[position.col] = {
					idStockModel: stock._id,
					name: stockModelFound?.name || stock.name.vn,
					code: stockModelFound?.code || stock?.code || '',
					imageUrl: stockModelFound?.image
						? getUrlImage(stockModelFound?.image)
						: stock.imageUrl,
					row: position.row,
					col: position.col,
					status: position.status,
					quantity: Number(position.quantity),
					maxQuantity: Number(position.maximumQuantity),
				};
			});
		});
		return baseRowData;
	};

	useEffect(() => {
		// `[]` là truthy — trước đây luôn gán ref = [] nên grid trống (toàn bộ ô null).
		// Khi có API thật, thay bằng: kiosk.stockGrid?.length ? kiosk.stockGrid : generateMockStockGrid(...)
		internalStockGridNew.current = generateMockStockGrid(rowNumber);

		const initialRowData = computeRowDataFromStockGrid(
			internalStockGridNew.current,
			rowNumber,
		);
		setRowData(initialRowData);

		const stockIds = internalStockGridNew.current.map((stock: { _id: string }) => stock._id);
		if (stockIds.length > 0) {
			getDropdownStockModel({
				limit: 1000,
				keyword: 'randomkeywordnotfound',
				idsDefault: stockIds,
			});
		}
	}, [kiosk.id, rowNumber]);

	useEffect(() => {
		if (shelves) {
			internalKioskShelves.current = shelves;
		}
	}, [shelves]);




	const BASE_COLS = useMemo(() => new Array(10).fill('_'), []);

	return (
		<Box h='calc(100vh - 200px)' mih={500} pos='relative' style={{ overflow: 'auto' }}>
			{isPending && (
				<Box
					pos='absolute' top={0} left={0} right={0} bottom={0}
					bg='rgba(255,255,255,0.5)' style={{ zIndex: 20, pointerEvents: 'none' }}
				/>
			)}
			<Box w='100%'>
				<Flex pos='sticky' top={0} h={30}
					miw='100%' w='fit-content' gap='xs' align='center' mb='xs' style={{ zIndex: 10 }}>
					<Box pos='sticky' left={0} w={30} miw={30} h='100%' bg='gray.1'/>
					<Flex
						justify='center' align='center'
						gap={'xs'} w='100%'
					>
						{BASE_COLS.map((_, index) => (
							<Center
								key={index}
								flex={1} w='100%' miw={160} h={30} fz='sm' bd='1px solid rgba(0, 0, 0, 0.1)'
								p={5} ta='center' bg='white'
							>
								{index + 1}
							</Center>
						))}
					</Flex>
				</Flex>
				<Flex
					justify='center' align='start' gap={'xs'}
					miw='100%' w='fit-content'
				>
					<Stack pos='sticky' left={0} w={30} miw={30} h='100%' gap='xs' style={{ zIndex: 10 }}>
						{rowData.map((rowItem, index) => (
							<Center key={index} w={30} h={200} bg='gray.1'>
								{rowItem?.row}
							</Center>
						))}
					</Stack>
					{rowData.length > 0 && (
						<Stack w='100%' h='100%' gap='xs'>
							{rowData.map((rowItem, index) => (
								<Flex key={index} w='100%' gap='xs'>
									{BASE_COLS.map((_, colIndex) => (
										<CellStock
											key={colIndex}
											params={{
												data:
														typeof rowItem[colIndex + 1] === 'object'
															? (rowItem[colIndex + 1] as TypeCellItem)
															: null,
												row: String(rowItem.row),
												col: String(colIndex + 1),
												isReadOnly: readOnly,
											}}
											openModalAddStockToKiosk={openModalAddStockToKiosk}
											handleCopyCell={handleCopyCell}
											handlePasteCell={handlePasteCell}
											removeStock={removeStock}
											handleEditCell={handleEditCell}
											openModalEditStockInKiosk={openModalEditStockInKiosk}
										/>
									))}
								</Flex>
							))}
						</Stack>
					)}
				</Flex>
			</Box>
		</Box>
	);
};
