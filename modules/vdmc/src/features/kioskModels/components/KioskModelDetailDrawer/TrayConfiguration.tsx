/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Card, Select, Stack, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KIOSK_SHELF_TYPES, type KioskShelfType, type TrayConfiguration as TrayConfigurationType } from '../../types';


export interface TrayConfigurationProps {
	numberOfTrays?: number;
	trayConfigurations?: TrayConfigurationType[];
	onNumberOfTraysChange?: (value: number) => void;
	onTrayConfigurationsChange?: (configurations: TrayConfigurationType[]) => void;
}

const SHELF_TYPE_OPTIONS: { value: KioskShelfType; labelKey: string }[] = [
	{ value: KIOSK_SHELF_TYPES.spring, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.spring' },
	{ value: KIOSK_SHELF_TYPES.conveyor, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.conveyor' },
	{ value: KIOSK_SHELF_TYPES.hangingConveyor, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.hangingConveyor' },
	{ value: KIOSK_SHELF_TYPES.pushTape, labelKey: 'nikki.vendingMachine.kioskModels.shelfType.pushTape' },
];

export const TrayConfiguration: React.FC<TrayConfigurationProps> = ({
	numberOfTrays = 0,
	trayConfigurations = [],
	onNumberOfTraysChange,
	onTrayConfigurationsChange,
}) => {
	const { t: translate } = useTranslation();
	const [configurations, setConfigurations] = useState<TrayConfigurationType[]>(trayConfigurations);

	const rows = useMemo(() => {
		const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		return Array.from({ length: numberOfTrays }, (_, i) => rowLetters[i] || String(i + 1));
	}, [numberOfTrays]);

	useEffect(() => {
		if (numberOfTrays > 0) {
			setConfigurations((prev) => {
				const newConfigurations: TrayConfigurationType[] = rows.map((row) => {
					const existing = prev.find((c) => c.row === row);
					return existing || { row };
				});
				if (onTrayConfigurationsChange) {
					onTrayConfigurationsChange(newConfigurations);
				}
				return newConfigurations;
			});
		}
		else {
			setConfigurations([]);
			if (onTrayConfigurationsChange) {
				onTrayConfigurationsChange([]);
			}
		}
	}, [numberOfTrays, rows]);

	useEffect(() => {
		setConfigurations(trayConfigurations);
	}, [trayConfigurations]);

	const handleShelfTypeChange = (row: string, shelfType: KioskShelfType | null) => {
		const existingIndex = configurations.findIndex((c) => c.row === row);
		const newConfigurations = [...configurations];
		if (existingIndex >= 0) {
			const updated = { ...newConfigurations[existingIndex], shelfType: shelfType ?? undefined };
			newConfigurations[existingIndex] = updated;
		}
		else {
			newConfigurations.push({ row, shelfType: shelfType ?? undefined });
		}
		setConfigurations(newConfigurations);
		if (onTrayConfigurationsChange) {
			onTrayConfigurationsChange(newConfigurations);
		}
	};

	const handleRemoveShelfType = (row: string) => {
		const newConfigurations = configurations.map((c) => {
			if (c.row === row) {
				const { shelfType: _, ...rest } = c;
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
								{rows.map((row) => {
									const config = getConfigurationForRow(row);
									const shelfType = config?.shelfType;
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
