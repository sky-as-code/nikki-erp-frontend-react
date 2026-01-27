import { Box, MantineColorScheme, useMantineColorScheme } from '@mantine/core';
import React, { useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
	useMapInitialization,
	useMapTheme,
	useMapMarkers,
	useMapZoom,
	createMarkersOnMap,
} from './hooks';

import { useKioskList } from '@/features/kiosks/hooks';



export const getMapStyle = (colorScheme: MantineColorScheme): string => {
	return colorScheme === 'dark'
		? 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
		: 'https://api.maptiler.com/maps/positron/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL';
};

export function KioskHitMap(): React.ReactElement {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const { colorScheme } = useMantineColorScheme();
	const { kiosks = [] } = useKioskList();

	const mapRef = useMapInitialization({
		mapContainerRef,
		getMapStyle,
		colorScheme,
		kiosks,
	});
	const markersRef = useMapMarkers({ mapRef, kiosks, colorScheme });

	useMapTheme({
		mapRef,
		colorScheme,
		getMapStyle,
		onThemeUpdated: (map) => {
			createMarkersOnMap(map, markersRef, kiosks);
		},
	});

	useMapZoom({ mapRef, mapContainerRef });

	return (
		<Box ref={mapContainerRef} w='100%' h='100%'/>
	);
}

