import { MantineColorScheme } from '@mantine/core';
import { useShellEnvVars } from '@nikkierp/shell/config';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useMemo } from 'react';


import { Kiosk } from '@/features/kiosks/types';

import { useMapAttribution } from './useMapAttribution';
import { useMapBounds } from './useMapBounds';
import { calculateCenter, calculateZoom, filterKiosksWithCoordinates } from '../helper';



interface UseMapInitializationProps {
	mapContainerRef: React.RefObject<HTMLDivElement | null>;
	getMapStyle: (colorScheme: MantineColorScheme, maplibreGlApiKey?: string) => string;
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
	const envVars = useShellEnvVars();
	const maplibreGlApiKey = envVars.MAPLIBRE_GL_API_KEY || 'get_your_own_OpIi9ZULNHzrESv6T2vL';

	// Filter kiosks with valid coordinates
	const kiosksWithCoordinates = useMemo(() => {
		return filterKiosksWithCoordinates(kiosks);
	}, [kiosks]);

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current) return;

		const mapStyle = getMapStyle(colorScheme, maplibreGlApiKey);
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
