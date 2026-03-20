/* eslint-disable max-lines-per-function */
import { Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { MantineColorScheme, useMantineColorScheme } from '@mantine/core';
import { useShellEnvVars } from '@nikkierp/shell/config';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef, useMemo } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface RegionRevenue {
	country: string;
	revenue: number;
	coordinates: [number, number]; // [longitude, latitude]
}

interface RevenueByRegionProps {
	data: RegionRevenue[];
}

const getMapStyle = (colorScheme: MantineColorScheme, maplibreGlApiKey: string = 'get_your_own_OpIi9ZULNHzrESv6T2vL'): string => {
	return colorScheme === 'dark'
		? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${maplibreGlApiKey}`
		: `https://api.maptiler.com/maps/positron/style.json?key=${maplibreGlApiKey}`;
};

// Country center coordinates for major countries
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
	Japan: [138.2529, 36.2048],
	Greenland: [-42.6043, 71.7069],
	India: [78.9629, 20.5937],
	Egypt: [30.8025, 26.8206],
	Mexico: [-102.5528, 23.6345],
	Angola: [17.8739, -11.2027],
	Colombia: [-74.2973, 4.5709],
	Finland: [25.7482, 61.9241],
	Philippines: [121.774, 12.8797],
	Indonesia: [113.9213, -0.7893],
	Peru: [-75.0152, -9.19],
	Iraq: [43.6793, 33.2232],
};

export function RevenueByRegion({ data }: RevenueByRegionProps): React.ReactElement {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const { colorScheme } = useMantineColorScheme();
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);
	const envVars = useShellEnvVars();
	const maplibreGlApiKey = envVars.MAPLIBRE_GL_API_KEY || 'get_your_own_OpIi9ZULNHzrESv6T2vL';

	// Sort data by revenue descending for bar chart
	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => b.revenue - a.revenue);
	}, [data]);

	// Calculate max revenue for normalization
	const maxRevenue = useMemo(() => {
		return Math.max(...data.map((d) => d.revenue), 1);
	}, [data]);

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current) return;

		const mapStyle = getMapStyle(colorScheme, maplibreGlApiKey);
		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [0, 20],
			zoom: 2,
			scrollZoom: true,
			attributionControl: false,
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-left');
		mapRef.current = map;

		return () => {
			map.remove();
		};
	}, [colorScheme]);

	// Add markers for regions
	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const createMarkersWhenReady = () => {
			// Clear existing markers
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];

			// Create markers for each region
			data.forEach((region) => {
				const coords = region.coordinates || COUNTRY_COORDINATES[region.country];
				if (!coords) return;

				// Calculate marker size based on revenue (normalized)
				const normalizedRevenue = region.revenue / maxRevenue;
				const markerSize = Math.max(20, Math.min(60, 20 + normalizedRevenue * 40));

				// Create marker element
				const el = document.createElement('div');
				el.className = 'revenue-marker';
				el.style.width = `${markerSize}px`;
				el.style.height = `${markerSize}px`;
				el.style.borderRadius = '50%';
				el.style.backgroundColor = 'rgba(59, 130, 246, 0.7)';
				el.style.border = '2px solid rgba(59, 130, 246, 1)';
				el.style.cursor = 'pointer';
				el.style.transition = 'all 0.3s ease';

				// Create popup
				const revenueFormatted = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}).format(region.revenue);

				const popupContent = `
					<div style="padding: 8px; min-width: 150px;">
						<strong>${region.country}</strong><br/>
						<span>Revenue: ${revenueFormatted}</span>
					</div>
				`;

				const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

				const marker = new maplibregl.Marker({
					element: el,
					anchor: 'center',
				})
					.setLngLat(coords)
					.setPopup(popup)
					.addTo(map);

				markersRef.current.push(marker);
			});
		};

		if (map.loaded()) {
			createMarkersWhenReady();
		}
		else {
			map.once('load', createMarkersWhenReady);
		}

		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
		};
	}, [data, maxRevenue]);

	// Update map style when color scheme changes
	useEffect(() => {
		if (!mapRef.current) return;
		const mapStyle = getMapStyle(colorScheme, maplibreGlApiKey);
		mapRef.current.setStyle(mapStyle);
	}, [colorScheme]);

	// Prepare chart data
	const chartData = {
		labels: sortedData.map((d) => d.country),
		datasets: [
			{
				label: 'Revenue',
				data: sortedData.map((d) => d.revenue),
				backgroundColor: 'rgba(59, 130, 246, 0.8)',
				borderColor: 'rgba(59, 130, 246, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 20,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y' as const,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const value = context.parsed.x;
						return new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}).format(value);
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				ticks: {
					callback: (value: any) => {
						if (value >= 1000) {
							return `$${(value / 1000).toFixed(0)}K`;
						}
						return `$${value}`;
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			y: {
				grid: {
					display: false,
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Total Revenue by Region
						</Title>
						<Text size='xs' c='dimmed'>
							Our total revenue based on region
						</Text>
					</Stack>
					<Select
						placeholder='Last month'
						data={['Last month', 'Last week', 'Last year']}
						defaultValue='Last month'
						size='xs'
						w={120}
					/>
				</Group>

				{/* Map */}
				<div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
					<div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
				</div>

				{/* Bar Chart */}
				<div style={{ height: '400px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
