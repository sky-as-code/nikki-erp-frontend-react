import { Box, Select, Stack, Table, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	KIOSK_SHELF_TYPES,
	type KioskModel,
	type KioskShelfType,
	type KioskType,
	type TrayConfiguration as TrayConfigurationType,
} from '../../types';
import { TrayConfiguration } from '../KioskModelDetailDrawer/TrayConfiguration';
import { useModelSettingsTab } from './hooks/useModelSettingsTab';


export interface KioskModelSettingsProps {
	model: KioskModel;
}

function shelvesConfigToTrayConfigurations(config?: Record<string, any>): TrayConfigurationType[] {
	if (!config) return [];
	if (Array.isArray(config.trays)) return config.trays;
	return [];
}

const getKioskTypeLabel = (type: KioskType | undefined, translate: (key: string) => string) => {
	if (!type) return '-';
	const labelMap: Record<KioskType, string> = {
		'elevator': translate('nikki.vendingMachine.kioskModels.kioskType.elevator'),
		'non-elevator': translate('nikki.vendingMachine.kioskModels.kioskType.nonElevator'),
	};
	return labelMap[type] || type;
};

export const KioskModelSettings: React.FC<KioskModelSettingsProps> = ({ model }) => {
	const { t: translate } = useTranslation();
	const { isEditing } = useModelSettingsTab({ model });

	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(model?.kioskType);
	const [shelvesNumber, setShelvesNumber] = useState<number>(model?.shelvesNumber || 0);
	const [trayConfigurations, setTrayConfigurations] =
		useState<TrayConfigurationType[]>(shelvesConfigToTrayConfigurations(model?.shelvesConfig));

	useEffect(() => {
		if (model) {
			setSelectedKioskType(model.kioskType);
			setShelvesNumber(model.shelvesNumber || 0);
			setTrayConfigurations(shelvesConfigToTrayConfigurations(model.shelvesConfig));
		}
	}, [model]);

	return (
		<Stack gap='lg'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
				</Text>
				{isEditing ? (
					<Select
						value={selectedKioskType || null}
						onChange={(value) => setSelectedKioskType(value as KioskType | undefined)}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.kioskType')}
						data={[
							{ value: 'non-elevator', label: translate('nikki.vendingMachine.kioskModels.kioskType.nonElevator') },
							{ value: 'elevator', label: translate('nikki.vendingMachine.kioskModels.kioskType.elevator') },
						]}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getKioskTypeLabel(selectedKioskType, translate)}</Text>
					</Box>
				)}
			</div>

			{isEditing ? (
				<TrayConfiguration
					numberOfTrays={shelvesNumber}
					trayConfigurations={trayConfigurations}
					onNumberOfTraysChange={setShelvesNumber}
					onTrayConfigurationsChange={setTrayConfigurations}
				/>
			) : (
				<TrayConfigurationReadOnly
					shelvesNumber={shelvesNumber}
					trayConfigurations={trayConfigurations}
					translate={translate}
				/>
			)}
		</Stack>
	);
};

const getShelfTypeLabel = (shelfType: KioskShelfType | undefined, translate: (key: string) => string) => {
	if (!shelfType) return '-';
	const keyMap: Record<string, string> = {
		[KIOSK_SHELF_TYPES.spring]: translate('nikki.vendingMachine.kioskModels.shelfType.spring'),
		[KIOSK_SHELF_TYPES.conveyor]: translate('nikki.vendingMachine.kioskModels.shelfType.conveyor'),
		[KIOSK_SHELF_TYPES.hangingConveyor]: translate('nikki.vendingMachine.kioskModels.shelfType.hangingConveyor'),
		[KIOSK_SHELF_TYPES.pushTape]: translate('nikki.vendingMachine.kioskModels.shelfType.pushTape'),
	};
	return keyMap[shelfType] || shelfType;
};

const TrayConfigurationReadOnly: React.FC<{
	shelvesNumber: number;
	trayConfigurations: TrayConfigurationType[];
	translate: (key: string) => string;
}> = ({ shelvesNumber, trayConfigurations, translate }) => {
	const rows = React.useMemo(() => {
		const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		return Array.from({ length: shelvesNumber }, (_, i) => rowLetters[i] || String(i + 1));
	}, [shelvesNumber]);

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('nikki.vendingMachine.kioskModels.fields.shelvesNumber')}
				</Text>
				<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
					<Text size='sm'>{shelvesNumber || '-'}</Text>
				</Box>
			</div>

			{shelvesNumber > 0 && (
				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
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
								const config = trayConfigurations.find((c) => c.row === row);
								const shelfType = config?.shelfType;
								return (
									<Table.Tr key={row}>
										<Table.Td>{row}</Table.Td>
										<Table.Td>
											<Text size='sm'>{getShelfTypeLabel(shelfType, translate)}</Text>
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
