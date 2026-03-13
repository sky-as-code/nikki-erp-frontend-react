import { MantineColorScheme } from '@mantine/core';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useMemo } from 'react';


import { useMapAttribution } from './useMapAttribution';
import { useMapBounds } from './useMapBounds';
import { calculateCenter, calculateZoom, filterKiosksWithCoordinates } from '../helper';

import { Kiosk } from '@/features/kiosks/types';


interface UseMapInitializationProps {
	mapContainerRef: React.RefObject<HTMLDivElement | null>;
	getMapStyle: (colorScheme: MantineColorScheme) => string;
	colorScheme: MantineColorScheme;
	kiosks?: Kiosk[];
}

/**
 * Initialize MapLibre map instance
 */
export function useMapInitialization({
	mapContainerRef,
	getMapStyle,
	colorScheme = 'light',
	kiosks = [],
}: UseMapInitializationProps) {
	const mapRef = useRef<maplibregl.Map | null>(null);

	// Filter kiosks with valid coordinates
	const kiosksWithCoordinates = useMemo(() => {
		return filterKiosksWithCoordinates(kiosks);
	}, [kiosks]);

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current) return;

		const mapStyle = getMapStyle(colorScheme);
		const center = calculateCenter(kiosksWithCoordinates);
		const zoom = calculateZoom(kiosksWithCoordinates);

		// const center: [number, number] = [106.660172, 11.762622];
		// const zoom = 7;

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: center,
			zoom: zoom,
			scrollZoom: false,
			attributionControl: false,
		});

		map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
		mapRef.current = map;

		return () => {
			map.remove();
		};
	}, [mapContainerRef, getMapStyle, colorScheme, kiosksWithCoordinates]);

	// Handle bounds fitting
	useMapBounds({ mapRef, kiosks: kiosksWithCoordinates });

	// Hide attribution
	useMapAttribution();

	return mapRef;
}
