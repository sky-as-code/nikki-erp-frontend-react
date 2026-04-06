import { IconBolt, IconDroplet, IconTemperature } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';

import { GroupedStatCard } from '@/components/GroupedStatCard';
import { type OperationParameter } from '@/features/kiosks/types';



interface OperationParametersCardProps {
	operationParameters: OperationParameter[];
	translate: TFunction;
}

export function OperationParametersCard({
	operationParameters,
	translate,
}: OperationParametersCardProps): React.ReactElement {
	// Calculate operation parameters summary
	const totalPowerConsumption = operationParameters.reduce((sum, p) => sum + p.powerConsumption, 0);
	const avgTemperature = operationParameters.length > 0
		? operationParameters.reduce((sum, p) => sum + p.temperature, 0) / operationParameters.length
		: 0;
	const avgHumidity = operationParameters.length > 0
		? operationParameters.reduce((sum, p) => sum + p.humidity, 0) / operationParameters.length
		: 0;

	const items = [
		{
			label: translate('nikki.vendingMachine.overview.operationParams.totalPowerConsumption'),
			value: totalPowerConsumption.toFixed(1),
			suffix: 'kW',
			icon: <IconBolt size={16} />,
			color: 'green',
		},
		{
			label: translate('nikki.vendingMachine.overview.operationParams.avgTemperature'),
			value: avgTemperature.toFixed(1),
			suffix: '°C',
			icon: <IconTemperature size={16} />,
			color: 'red',
		},
		{
			label: translate('nikki.vendingMachine.overview.operationParams.avgHumidity'),
			value: avgHumidity.toFixed(1),
			suffix: '%',
			icon: <IconDroplet size={16} />,
			color: 'blue',
		},
	];

	return (
		<GroupedStatCard
			title={translate('nikki.vendingMachine.overview.operationParams.title')}
			icon={<IconBolt size={24} />}
			iconColor='green'
			items={items}
		/>
	);
}
