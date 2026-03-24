import maplibregl from 'maplibre-gl';

import { Kiosk } from '@/features/kiosks/types';


export const DEFAULT_MAP_CENTER: [number, number] = [106.660172, 10.762622]; // Ho Chi Minh City
export const DEFAULT_MAP_ZOOM = 11;


/**
 * Filters kiosks that have valid coordinates
 */
export function filterKiosksWithCoordinates(kiosks: Kiosk[]): Kiosk[] {
	return kiosks.filter(
		(kiosk) => kiosk.coordinates?.latitude && kiosk.coordinates?.longitude,
	);
}

/**
 * Calculates the center point from kiosks coordinates
 */
export function calculateCenter(kiosks: Kiosk[]): [number, number] {
	if (kiosks.length === 0) {
		return DEFAULT_MAP_CENTER;
	}

	const lngs = kiosks.map(k => k.coordinates.longitude);
	const lats = kiosks.map(k => k.coordinates.latitude);

	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);

	return [
		(minLng + maxLng) / 2,
		(minLat + maxLat) / 2,
	];
}

/**
 * Calculates zoom level based on kiosks spread
 */
export function calculateZoom(kiosks: Kiosk[]): number {
	if (kiosks.length === 0) {
		return DEFAULT_MAP_ZOOM;
	}

	const lngs = kiosks.map(k => k.coordinates.longitude);
	const lats = kiosks.map(k => k.coordinates.latitude);

	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);

	const lngDiff = maxLng - minLng;
	const latDiff = maxLat - minLat;
	const maxDiff = Math.max(lngDiff, latDiff);

	if (maxDiff === 0) {
		return DEFAULT_MAP_ZOOM;
	}

	// Adjust zoom based on the spread of markers
	if (maxDiff > 0.1) return 10;
	if (maxDiff > 0.05) return 11;
	if (maxDiff > 0.02) return 12;
	return 13;
}

/**
 * Creates bounds from kiosks coordinates
 */
export function createBoundsFromKiosks(kiosks: Kiosk[]): maplibregl.LngLatBounds | null {
	if (kiosks.length === 0) {
		return null;
	}

	const lngs = kiosks.map(k => k.coordinates.longitude);
	const lats = kiosks.map(k => k.coordinates.latitude);

	return new maplibregl.LngLatBounds(
		[Math.min(...lngs), Math.min(...lats)],
		[Math.max(...lngs), Math.max(...lats)],
	);
}
