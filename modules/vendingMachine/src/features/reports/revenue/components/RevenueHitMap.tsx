import { Box, MantineColorScheme, useMantineColorScheme } from '@mantine/core';
import React, { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface RegionRevenue {
	country: string;
	revenue: number;
	coordinates: [number, number]; // [longitude, latitude]
}

interface RevenueHitMapProps {
	data: RegionRevenue[];
}

const getMapStyle = (colorScheme: MantineColorScheme): string => {
	return colorScheme === 'dark'
		? 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
		: 'https://api.maptiler.com/maps/positron/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL';
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

export function RevenueHitMap({ data }: RevenueHitMapProps): React.ReactElement {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const { colorScheme } = useMantineColorScheme();
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);

	// Calculate max revenue for normalization
	const maxRevenue = useMemo(() => {
		return Math.max(...data.map((d) => d.revenue), 1);
	}, [data]);

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current) return;

		const mapStyle = getMapStyle(colorScheme);
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
				el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

				// Add hover effect
				el.addEventListener('mouseenter', () => {
					el.style.transform = 'scale(1.2)';
					el.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
				});
				el.addEventListener('mouseleave', () => {
					el.style.transform = 'scale(1)';
					el.style.backgroundColor = 'rgba(59, 130, 246, 0.7)';
				});

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
		} else {
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
		const mapStyle = getMapStyle(colorScheme);
		mapRef.current.setStyle(mapStyle);
	}, [colorScheme]);

	return <Box ref={mapContainerRef} w='100%' h='100%' />;
}
