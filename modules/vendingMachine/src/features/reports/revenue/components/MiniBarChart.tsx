import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface MiniBarChartProps {
	data: number[];
	color?: string;
}

export function MiniBarChart({ data, color = 'rgba(59, 130, 246, 0.8)' }: MiniBarChartProps): React.ReactElement {
	const chartData = {
		labels: data.map((_, _i) => ''),
		datasets: [
			{
				data,
				backgroundColor: color,
				borderRadius: 2,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			tooltip: {
				enabled: false,
			},
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				display: false,
			},
			x: {
				display: false,
			},
		},
	};

	return <Bar data={chartData} options={options} />;
}
