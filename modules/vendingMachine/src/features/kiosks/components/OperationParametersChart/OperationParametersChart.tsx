import { Card, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { type OperationParameter } from '@/features/kiosks/types';


ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
);

interface OperationParametersChartProps {
	parameters: OperationParameter[];
}

function formatTimestampToTimeLabel(timestamp: string): string {
	const date = new Date(timestamp);
	return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createDataset(
	label: string,
	data: number[],
	borderColor: string,
	backgroundColor: string,
	yAxisID: string,
): {
	label: string;
	data: number[];
	borderColor: string;
	backgroundColor: string;
	yAxisID: string;
	tension: number;
} {
	return {
		label,
		data,
		borderColor,
		backgroundColor,
		yAxisID,
		tension: 0.4,
	};
}

const convertToDataset = (parameters: OperationParameter[], translate: TFunction) => {

	const labels = parameters.map((p) => formatTimestampToTimeLabel(p.timestamp)) || [];
	const datasets = [
		createDataset(
			translate('nikki.vendingMachine.overview.operationParams.temperature'),
			parameters.map((p) => p.temperature),
			'rgba(239, 68, 68, 1)',
			'rgba(239, 68, 68, 0.1)',
			'y',
		),
		createDataset(
			translate('nikki.vendingMachine.overview.operationParams.humidity'),
			parameters.map((p) => p.humidity),
			'rgba(59, 130, 246, 1)',
			'rgba(59, 130, 246, 0.1)',
			'y',
		),
		createDataset(
			translate('nikki.vendingMachine.overview.operationParams.powerConsumption'),
			parameters.map((p) => p.powerConsumption),
			'rgba(34, 197, 94, 1)',
			'rgba(34, 197, 94, 0.1)',
			'y1',
		),
	];

	return {
		labels: labels || [],
		datasets: datasets || [],
	};
};

const getChartOptions = (translate: TFunction) => {
	return {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'index' as const,
			intersect: false,
		},
		plugins: {
			legend: {
				position: 'top' as const,
			},
		},
		scales: {
			y: {
				type: 'linear' as const,
				display: true,
				position: 'left' as const,
				title: {
					display: true,
					text: translate('nikki.vendingMachine.overview.operationParams.temperatureHumidity'),
				},
			},
			y1: {
				type: 'linear' as const,
				display: true,
				position: 'right' as const,
				grid: {
					drawOnChartArea: false,
				},
				title: {
					display: true,
					text: translate('nikki.vendingMachine.overview.operationParams.power'),
				},
			},
		},
	};
};

export function OperationParametersChart({ parameters }: OperationParametersChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const data = useMemo(() => convertToDataset(parameters, translate), [parameters, translate]);
	const options = getChartOptions(translate);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Title order={4} mb='md'>
				{translate('nikki.vendingMachine.overview.operationParams.title')}
			</Title>
			<div style={{ height: '350px', position: 'relative' }}>
				<Line data={data} options={options} />
			</div>
		</Card>
	);
}
