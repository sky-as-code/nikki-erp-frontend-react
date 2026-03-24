import maplibregl from 'maplibre-gl';
import { useEffect, RefObject } from 'react';

import { createBoundsFromKiosks, filterKiosksWithCoordinates } from '../helper';

import { Kiosk } from '@/features/kiosks/types';



interface UseMapBoundsProps {
	mapRef: RefObject<maplibregl.Map | null>;
	kiosks: Kiosk[];
}

const BOUNDS_OPTIONS = {
	padding: 50,
	maxZoom: 15,
} as const;

/**
 * Fits map bounds to kiosks coordinates
 */
function fitBoundsToKiosks(
	map: maplibregl.Map,
	kiosks: Kiosk[],
): void {
	const bounds = createBoundsFromKiosks(kiosks);
	if (bounds) {
		map.fitBounds(bounds, BOUNDS_OPTIONS);
	}
}

/**
 * Fit map bounds when kiosks change
 */
export function useMapBounds({ mapRef, kiosks }: UseMapBoundsProps): void {
	const kiosksWithCoordinates = filterKiosksWithCoordinates(kiosks);

	// Fit bounds when map loads if we have kiosks
	useEffect(() => {
		if (!mapRef.current || kiosksWithCoordinates.length === 0) return;

		const map = mapRef.current;

		// Wait for map to load before fitting bounds
		if (!map.loaded()) {
			map.once('load', () => {
				fitBoundsToKiosks(map, kiosksWithCoordinates);
			});
			return;
		}

		// Map is already loaded, fit bounds immediately
		fitBoundsToKiosks(map, kiosksWithCoordinates);
	}, [mapRef, kiosksWithCoordinates]);

	// Update bounds when kiosks change after map is initialized
	useEffect(() => {
		if (!mapRef.current || kiosksWithCoordinates.length === 0) return;

		const map = mapRef.current;
		if (!map.loaded()) return;

		fitBoundsToKiosks(map, kiosksWithCoordinates);
	}, [mapRef, kiosksWithCoordinates]);
}
