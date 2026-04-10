/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Box, Card, Select, Stack, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { KIOSK_SHELF_TYPES, type KioskShelfType, type ShelvesConfigRow } from '../../types';


export interface ShelvesConfigProps {
	isEditing: boolean;
	shelvesNumber: number;
	shelvesConfigRows: ShelvesConfigRow[];
	onShelvesNumberChange?: (value: number) => void;
	onShelvesConfigRowsChange?: (rows: ShelvesConfigRow[]) => void;
}

const SHELF_TYPE_OPTIONS: { value: KioskShelfType; labelKey: string }[] = [
	{ value: KIOSK_SHELF_TYPES.spring, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.spring' },
	{ value: KIOSK_SHELF_TYPES.conveyor, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.conveyor' },
	{ value: KIOSK_SHELF_TYPES.hangingConveyor, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.hangingConveyor' },
	{ value: KIOSK_SHELF_TYPES.pushTape, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.pushTape' },
];

function shelfTypeLabel(
	shelfType: KioskShelfType | undefined,
	translate: (key: string) => string,
): string {
	if (!shelfType) return '-';
	const keyMap: Record<string, string> = {
		[KIOSK_SHELF_TYPES.spring]: translate('nikki.vendingMachine.kioskModels.shelfType.spring'),
		[KIOSK_SHELF_TYPES.conveyor]: translate('nikki.vendingMachine.kioskModels.shelfType.conveyor'),
		[KIOSK_SHELF_TYPES.hangingConveyor]: translate('nikki.vendingMachine.kioskModels.shelfType.hangingConveyor'),
		[KIOSK_SHELF_TYPES.pushTape]: translate('nikki.vendingMachine.kioskModels.shelfType.pushTape'),
	};
	return keyMap[shelfType] || shelfType;
}

function rowIdsForShelvesCount(shelvesNumber: number): string[] {
	const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	return Array.from({ length: shelvesNumber }, (_, i) => rowLetters[i] || String(i + 1));
}

function mergeRowsForRowIds(rowIds: string[], rows: ShelvesConfigRow[]): ShelvesConfigRow[] {
	return rowIds.map((row) => {
		const existing = rows.find((c) => c.row === row);
		return existing || { row };
	});
}

const ShelvesConfigReadOnlyView: React.FC<{
	shelvesNumber: number;
	shelvesConfigRows: ShelvesConfigRow[];
}> = ({ shelvesNumber, shelvesConfigRows }) => {
	const { t: translate } = useTranslation();
	const rows = useMemo(() => rowIdsForShelvesCount(shelvesNumber), [shelvesNumber]);

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.shelvesNumber')}
				</Text>
				<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
					<Text size='sm'>{shelvesNumber || '-'}</Text>
				</Box>
			</div>

			{shelvesNumber > 0 && (
				<div>
					<Text size='sm' c='dimmed' mb={2} fw={500}>
						{translate('nikki.vendingMachine.kioskModels.fields.shelvesConfig')}
					</Text>
					<Table withTableBorder withColumnBorders>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.trayRow')}</Table.Th>
								<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.shelfType')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{rows.map((row) => {
								const rowCfg = shelvesConfigRows.find((c) => c.row === row);
								const st = rowCfg?.shelfType;
								return (
									<Table.Tr key={row}>
										<Table.Td>{row}</Table.Td>
										<Table.Td>
											<Text size='sm'>{shelfTypeLabel(st, translate)}</Text>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</div>
			)}
		</Stack>
	);
};

const ShelvesConfigEditorView: React.FC<{
	shelvesNumber: number;
	shelvesConfigRows: ShelvesConfigRow[];
	onShelvesNumberChange?: (value: number) => void;
	onShelvesConfigRowsChange?: (rows: ShelvesConfigRow[]) => void;
}> = ({
	shelvesNumber = 0,
	shelvesConfigRows = [],
	onShelvesNumberChange,
	onShelvesConfigRowsChange,
}) => {
	const { t: translate } = useTranslation();

	const rowIds = useMemo(() => rowIdsForShelvesCount(shelvesNumber), [shelvesNumber]);

	const displayRows = useMemo(
		() => mergeRowsForRowIds(rowIds, shelvesConfigRows),
		[rowIds, shelvesConfigRows],
	);

	const handleTraysCountChange = (value: string | null) => {
		const numValue = value ? parseInt(value, 10) : 0;
		onShelvesNumberChange?.(numValue);
		if (numValue === 0) {
			onShelvesConfigRowsChange?.([]);
			return;
		}
		const ids = rowIdsForShelvesCount(numValue);
		onShelvesConfigRowsChange?.(mergeRowsForRowIds(ids, shelvesConfigRows));
	};

	const handleShelfTypeChange = (row: string, shelfType: KioskShelfType | null) => {
		const idx = displayRows.findIndex((c) => c.row === row);
		const next = [...displayRows];
		if (idx >= 0) {
			next[idx] = { ...next[idx], shelfType: shelfType ?? undefined };
		}
		else {
			next.push({ row, shelfType: shelfType ?? undefined });
		}
		onShelvesConfigRowsChange?.(next);
	};

	const handleRemoveShelfType = (row: string) => {
		const next = displayRows.map((c) => {
			if (c.row === row) {
				const { shelfType: _, ...rest } = c;
				return rest;
			}
			return c;
		});
		onShelvesConfigRowsChange?.(next);
	};

	const rowFor = (row: string): ShelvesConfigRow | undefined => displayRows.find((c) => c.row === row);

	const trayOptions = Array.from({ length: 10 }, (_, i) => ({
		value: String(i + 1),
		label: String(i + 1),
	}));

	const shelfTypeSelectData = SHELF_TYPE_OPTIONS.map((opt) => ({
		value: opt.value,
		label: translate(opt.labelKey),
	}));

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.numberOfTrays')}
				</Text>
				<Select
					value={shelvesNumber > 0 ? String(shelvesNumber) : null}
					onChange={handleTraysCountChange}
					data={trayOptions}
					placeholder={translate('nikki.vendingMachine.kioskModels.fields.numberOfTrays')}
					clearable
				/>
			</div>

			{shelvesNumber > 0 && (
				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('nikki.vendingMachine.kioskModels.fields.trayConfigurations')}
					</Text>
					<Card withBorder p='md' radius='md'>
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.trayRow')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.shelfType')}</Table.Th>
									<Table.Th>{translate('nikki.general.actions.title')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rowIds.map((row) => {
									const cfg = rowFor(row);
									const shelfType = cfg?.shelfType;
									return (
										<Table.Tr key={row}>
											<Table.Td>
												<Badge size='lg' variant='light' color='blue'>
													{row}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Select
													value={shelfType || null}
													onChange={(value) =>
														handleShelfTypeChange(row, value as KioskShelfType | null)
													}
													data={shelfTypeSelectData}
													placeholder={translate('nikki.vendingMachine.kioskModels.fields.shelfType')}
													clearable
												/>
											</Table.Td>
											<Table.Td>
												{shelfType && (
													<ActionIcon
														variant='subtle'
														color='red'
														size='sm'
														onClick={() => handleRemoveShelfType(row)}
													>
														<IconTrash size={16} />
													</ActionIcon>
												)}
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</Card>
				</div>
			)}
		</Stack>
	);
};

export const ShelvesConfig: React.FC<ShelvesConfigProps> = ({
	isEditing,
	shelvesNumber,
	shelvesConfigRows,
	onShelvesNumberChange,
	onShelvesConfigRowsChange,
}) => {
	if (isEditing) {
		return (
			<ShelvesConfigEditorView
				shelvesNumber={shelvesNumber}
				shelvesConfigRows={shelvesConfigRows}
				onShelvesNumberChange={onShelvesNumberChange}
				onShelvesConfigRowsChange={onShelvesConfigRowsChange}
			/>
		);
	}
	return (
		<ShelvesConfigReadOnlyView
			shelvesNumber={shelvesNumber}
			shelvesConfigRows={shelvesConfigRows}
		/>
	);
};
