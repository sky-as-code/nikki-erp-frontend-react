import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface MiniLineChartProps {
	data: number[];
	color?: string;
}

export function MiniLineChart({ data, color = 'rgba(59, 130, 246, 0.8)' }: MiniLineChartProps): React.ReactElement {
	const chartData = {
		labels: data.map((_, _i) => ''),
		datasets: [
			{
				data,
				borderColor: color,
				backgroundColor: color.replace('0.8', '0.1'),
				tension: 0.4,
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 0,
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

	return <Line data={chartData} options={options} />;
}
