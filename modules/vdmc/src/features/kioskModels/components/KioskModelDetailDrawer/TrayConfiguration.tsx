/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Button, Card, Checkbox, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeviceSelectModal } from './DeviceSelectModal';
import { KioskDevice } from '../../../kioskDevices/types';
import { TrayConfiguration as TrayConfigurationType } from '../../types';


export interface TrayConfigurationProps {
	numberOfTrays?: number;
	trayConfigurations?: TrayConfigurationType[];
	onNumberOfTraysChange?: (value: number) => void;
	onTrayConfigurationsChange?: (configurations: TrayConfigurationType[]) => void;
}

export const TrayConfiguration: React.FC<TrayConfigurationProps> = ({
	numberOfTrays = 0,
	trayConfigurations = [],
	onNumberOfTraysChange,
	onTrayConfigurationsChange,
}) => {
	const { t: translate } = useTranslation();
	const [deviceSelectModalOpened, setDeviceSelectModalOpened] = useState(false);
	const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
	const [configurations, setConfigurations] = useState<TrayConfigurationType[]>(trayConfigurations);
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

	// Generate rows based on numberOfTrays
	const rows = useMemo(() => {
		const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		return Array.from({ length: numberOfTrays }, (_, i) => rowLetters[i] || String(i + 1));
	}, [numberOfTrays]);

	// Update configurations when numberOfTrays changes
	useEffect(() => {
		if (numberOfTrays > 0) {
			const newConfigurations: TrayConfigurationType[] = rows.map((row) => {
				const existing = configurations.find((c) => c.row === row);
				return existing || { row };
			});
			setConfigurations(newConfigurations);
			if (onTrayConfigurationsChange) {
				onTrayConfigurationsChange(newConfigurations);
			}
		}
		else {
			setConfigurations([]);
			if (onTrayConfigurationsChange) {
				onTrayConfigurationsChange([]);
			}
		}
	}, [numberOfTrays, rows]);

	// Sync with external changes
	useEffect(() => {
		setConfigurations(trayConfigurations);
	}, [trayConfigurations]);

	const handleOpenDeviceSelect = (rowIndex: number) => {
		setSelectedRowIndex(rowIndex);
		setDeviceSelectModalOpened(true);
	};

	const handleOpenDeviceSelectForSelectedRows = () => {
		if (selectedRows.size > 0) {
			setDeviceSelectModalOpened(true);
		}
	};

	const handleSelectDevice = (device: KioskDevice) => {
		const newConfigurations = [...configurations];

		// If there are selected rows, update all of them
		if (selectedRows.size > 0) {
			selectedRows.forEach((row) => {
				const index = newConfigurations.findIndex((c) => c.row === row);
				if (index >= 0) {
					newConfigurations[index] = {
						...newConfigurations[index],
						device,
						deviceId: device.id,
					};
				}
				else {
					newConfigurations.push({
						row,
						device,
						deviceId: device.id,
					});
				}
			});
			// Clear selection after updating
			setSelectedRows(new Set());
		}
		// If a specific row index was selected, update that row
		else if (selectedRowIndex !== null) {
			const row = rows[selectedRowIndex];
			const index = newConfigurations.findIndex((c) => c.row === row);

			if (index >= 0) {
				newConfigurations[index] = {
					...newConfigurations[index],
					device,
					deviceId: device.id,
				};
			}
			else {
				newConfigurations.push({
					row,
					device,
					deviceId: device.id,
				});
			}
		}

		setConfigurations(newConfigurations);
		if (onTrayConfigurationsChange) {
			onTrayConfigurationsChange(newConfigurations);
		}
		setDeviceSelectModalOpened(false);
		setSelectedRowIndex(null);
	};

	const handleToggleRowSelection = (row: string) => {
		const newSelectedRows = new Set(selectedRows);
		if (newSelectedRows.has(row)) {
			newSelectedRows.delete(row);
		}
		else {
			newSelectedRows.add(row);
		}
		setSelectedRows(newSelectedRows);
	};

	const handleToggleSelectAll = () => {
		if (selectedRows.size === rows.length) {
			setSelectedRows(new Set());
		}
		else {
			setSelectedRows(new Set(rows));
		}
	};

	const isAllSelected = rows.length > 0 && selectedRows.size === rows.length;
	const isIndeterminate = selectedRows.size > 0 && selectedRows.size < rows.length;

	const handleRemoveDevice = (row: string) => {
		const newConfigurations = configurations.map((c) => {
			if (c.row === row) {
				const { device, deviceId, ...rest } = c;
				return rest;
			}
			return c;
		});
		setConfigurations(newConfigurations);
		if (onTrayConfigurationsChange) {
			onTrayConfigurationsChange(newConfigurations);
		}
	};

	const getConfigurationForRow = (row: string): TrayConfigurationType | undefined => {
		return configurations.find((c) => c.row === row);
	};

	// Generate select options from 1 to 10
	const trayOptions = Array.from({ length: 10 }, (_, i) => ({
		value: String(i + 1),
		label: String(i + 1),
	}));

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.numberOfTrays')}
				</Text>
				<Select
					value={numberOfTrays > 0 ? String(numberOfTrays) : null}
					onChange={(value) => {
						const numValue = value ? parseInt(value, 10) : 0;
						if (onNumberOfTraysChange) {
							onNumberOfTraysChange(numValue);
						}
					}}
					data={trayOptions}
					placeholder={translate('nikki.vendingMachine.kioskModels.fields.numberOfTrays')}
					clearable
				/>
			</div>

			{numberOfTrays > 0 && (
				<div>
					<Group justify='space-between' mb='xs'>
						<Text size='sm' c='dimmed' fw={500}>
							{translate('nikki.vendingMachine.kioskModels.fields.trayConfigurations')}
						</Text>
						{selectedRows.size > 0 && (
							<Button
								size='xs'
								variant='light'
								leftSection={<IconPlus size={14} />}
								onClick={handleOpenDeviceSelectForSelectedRows}
							>
								{translate('nikki.vendingMachine.kioskModels.actions.selectDeviceForSelected', { count: selectedRows.size })}
							</Button>
						)}
					</Group>
					<Card withBorder p='md' radius='md'>
						<Table>
							<Table.Thead>
								<Table.Tr>
									<Table.Th style={{ width: 50 }}>
										<Checkbox
											checked={isAllSelected}
											indeterminate={isIndeterminate}
											onChange={handleToggleSelectAll}
										/>
									</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.trayRow')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.trayDevice')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kioskModels.fields.deviceSpecifications')}</Table.Th>
									<Table.Th>{translate('nikki.general.actions.title')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row, index) => {
									const config = getConfigurationForRow(row);
									const device = config?.device;
									const isRowSelected = selectedRows.has(row);
									return (
										<Table.Tr key={row} style={{ backgroundColor: isRowSelected ? 'var(--mantine-color-blue-0)' : undefined }}>
											<Table.Td>
												<Checkbox
													checked={isRowSelected}
													onChange={() => handleToggleRowSelection(row)}
												/>
											</Table.Td>
											<Table.Td>
												<Badge size='lg' variant='light' color='blue'>
													{row}
												</Badge>
											</Table.Td>
											<Table.Td>
												{device ? (
													<Stack gap={4}>
														<Text size='sm' fw={500}>{device.name}</Text>
														<Badge size='sm' variant='light'>{device.code}</Badge>
													</Stack>
												) : (
													<Button
														size='xs'
														variant='light'
														leftSection={<IconPlus size={14} />}
														onClick={() => handleOpenDeviceSelect(index)}
													>
														{translate('nikki.vendingMachine.kioskModels.selectDevice.selectDevice')}
													</Button>
												)}
											</Table.Td>
											<Table.Td>
												{device && device.specifications && device.specifications.length > 0 ? (
													<Stack gap={4}>
														{device.specifications.map((spec, idx) => (
															<Text key={idx} size='xs' c='dimmed'>
																{spec.key}: {spec.value}
															</Text>
														))}
													</Stack>
												) : (
													<Text size='xs' c='dimmed'>-</Text>
												)}
											</Table.Td>
											<Table.Td>
												{device && (
													<ActionIcon
														variant='subtle'
														color='red'
														size='sm'
														onClick={() => handleRemoveDevice(row)}
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

			<DeviceSelectModal
				opened={deviceSelectModalOpened}
				onClose={() => {
					setDeviceSelectModalOpened(false);
					setSelectedRowIndex(null);
				}}
				onSelectDevice={handleSelectDevice}
			/>
		</Stack>
	);
};
