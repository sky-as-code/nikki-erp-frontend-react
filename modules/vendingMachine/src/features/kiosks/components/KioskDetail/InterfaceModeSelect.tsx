import { Box, Select, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { InterfaceMode } from '@/features/kioskModels/types';


export interface InterfaceModeSelectProps {
	value: InterfaceMode | undefined;
	onChange: (value: InterfaceMode | undefined) => void;
	isEditing: boolean;
}

export const InterfaceModeSelect: React.FC<InterfaceModeSelectProps> = ({
	value,
	onChange,
	isEditing,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('nikki.vendingMachine.kioskModels.fields.interfaceMode')}
			</Text>
			<Select
				value={value ?? null}
				onChange={(v) => onChange(v === null ? undefined : (v as InterfaceMode))}
				placeholder={translate('nikki.vendingMachine.kioskModels.fields.interfaceMode')}
				data={[
					{ value: 'normal', label: translate('nikki.vendingMachine.kioskModels.interfaceMode.normal') },
					{ value: 'focus', label: translate('nikki.vendingMachine.kioskModels.interfaceMode.focus') },
				]}
				clearable
				readOnly={!isEditing}
			/>
		</Box>
	);
};
