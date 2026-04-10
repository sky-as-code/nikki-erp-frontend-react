import { Box, Select, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ShelvesConfig } from '../ShelvesConfig';
import { useModelSettingsTab } from './hooks/useModelSettingsTab';

import type { KioskModel, KioskType } from '../../types';


export interface KioskModelSettingsProps {
	model: KioskModel;
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
	const {
		isEditing, selectedKioskType, setSelectedKioskType,
		shelvesNumber, setShelvesNumber, shelvesConfigRows, setShelvesConfigRows,
	} = useModelSettingsTab({ model });

	return (
		<Stack gap='lg'>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
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
			</Box>

			<ShelvesConfig
				isEditing={isEditing}
				shelvesNumber={shelvesNumber}
				shelvesConfigRows={shelvesConfigRows}
				onShelvesNumberChange={setShelvesNumber}
				onShelvesConfigRowsChange={setShelvesConfigRows}
			/>
		</Stack>
	);
};
