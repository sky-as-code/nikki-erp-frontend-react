import { Box, useMantineColorScheme } from '@mantine/core';
import React, { useRef, useCallback } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';


import {
	useMapInitialization,
	useMapTheme,
	useMapMarkers,
	useMapZoom,
	createMarkersOnMap,
} from './hooks';


export function KioskHitMap(): React.ReactElement {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const getMapStyle = useCallback((dark: boolean) => {
		return dark
			? 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
			: 'https://api.maptiler.com/maps/positron/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL';
	}, []);

	const mapRef = useMapInitialization({
		mapContainerRef,
		getMapStyle,
		isDark,
	});

	const markersRef = useMapMarkers({ mapRef });

	useMapTheme({
		mapRef,
		isDark,
		getMapStyle,
		onThemeUpdated: (map) => {
			createMarkersOnMap(map, markersRef);
		},
	});

	useMapZoom({ mapRef, mapContainerRef });

	return (
		<Box style={{ width: '100%', height: '100%' }}>
			<Box
				ref={mapContainerRef}
				w='100%'
				h='100%'
			/>
		</Box>
	);
}

