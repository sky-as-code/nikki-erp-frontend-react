import { MantineColorScheme } from '@mantine/core';
import maplibregl from 'maplibre-gl';
import { useRef, useEffect, useMemo } from 'react';

import { Kiosk, KioskStatus, ConnectionStatus } from '@/features/kiosks/types';

import { getConnectionHistory } from '../../KioskTable';


const clearMarkers = (markersRef: React.RefObject<maplibregl.Marker[]>) => {
	markersRef.current.forEach(marker => marker.remove());
	markersRef.current = [];
};

const getMarkerColor = (isActive: boolean, connectionStatus?: ConnectionStatus): string => {
	// Nếu không hoạt động thì màu xám
	if (!isActive) {
		return '%239ca3af'; // gray-400
	}

	// Nếu đang hoạt động thì màu dựa vào trạng thái kết nối
	switch (connectionStatus) {
		case ConnectionStatus.FAST:
			return '%2351cf66'; // green
		case ConnectionStatus.SLOW:
			return '%23ffd43b'; // yellow
		case ConnectionStatus.DISCONNECTED:
			return '%23ff6b6b'; // red
		default:
			return '%239ca3af'; // gray-400 (fallback)
	}
};

const createMarkerElement = (isActive: boolean, connectionStatus?: ConnectionStatus): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = 'custom-marker';
	el.style.width = '32px';
	el.style.height = '32px';
	const color = getMarkerColor(isActive, connectionStatus);
	el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
	el.style.backgroundSize = 'contain';
	el.style.backgroundRepeat = 'no-repeat';
	el.style.backgroundPosition = 'center';
	el.style.cursor = 'pointer';
	return el;
};

const getConnectionStatusText = (connectionStatus?: ConnectionStatus): string => {
	switch (connectionStatus) {
		case ConnectionStatus.FAST:
			return 'Nhanh';
		case ConnectionStatus.SLOW:
			return 'Chậm';
		case ConnectionStatus.DISCONNECTED:
			return 'Mất kết nối';
		default:
			return 'N/A';
	}
};

const createPopupContent = (kiosk: Kiosk, isActive: boolean): string => {
	const name = kiosk.name || kiosk.code || '';
	const statusText = isActive ? 'Đang hoạt động' : 'Không hoạt động';
	const connectionHistory = getConnectionHistory(kiosk as unknown as Record<string, unknown>);
	const connectionStatusText = getConnectionStatusText(connectionHistory?.[0]?.connection);
	const temperature = kiosk.temperature;
	const humidity = kiosk.humidity;
	const powerConsumption = kiosk.powerConsumption;

	const hasEnvironmentalData =
		temperature !== undefined || humidity !== undefined || powerConsumption !== undefined;

	const environmentalInfo = hasEnvironmentalData
		? `
			<br/><br/>
			<strong>Thông tin môi trường:</strong><br/>
			${temperature !== undefined ? `<span>Nhiệt độ: ${temperature}°C</span><br/>` : ''}
			${humidity !== undefined ? `<span>Độ ẩm: ${humidity}%</span><br/>` : ''}
			${powerConsumption !== undefined ? `<span>Điện năng tiêu thụ: ${powerConsumption}kW</span>` : ''}
		`
		: '';

	return `
		<div style="padding: 8px;">
			<strong>${name}</strong><br/>
			<span>Mã: ${kiosk.code}</span><br/>
			<span>Trạng thái: ${statusText}</span><br/>
			<span>Kết nối: ${connectionStatusText}</span><br/>
			<span>Địa chỉ: ${kiosk.locationAddress || 'N/A'}</span>
			${environmentalInfo}
		</div>
	`;
};

const createMarker = (
	map: maplibregl.Map,
	kiosk: Kiosk,
): maplibregl.Marker => {
	const lat = kiosk.latitude ?? 0;
	const lng = kiosk.longitude ?? 0;
	const isActive = kiosk.status === KioskStatus.ACTIVE;

	const connectionHistory = getConnectionHistory(kiosk as unknown as Record<string, unknown>);
	const el = createMarkerElement(isActive, connectionHistory?.[0]?.connection);
	const popupContent = createPopupContent(kiosk, isActive);

	const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

	const marker = new maplibregl.Marker({
		element: el,
		anchor: 'bottom',
	})
		.setLngLat([lng, lat])
		.setPopup(popup)
		.addTo(map);

	return marker;
};

const createMarkers = (
	map: maplibregl.Map,
	markersRef: React.RefObject<maplibregl.Marker[]>,
	kiosks: Kiosk[],
) => {
	clearMarkers(markersRef);

	kiosks.forEach((kiosk) => {
		if (!kiosk.latitude || !kiosk.longitude) return;

		const marker = createMarker(map, kiosk);
		markersRef.current.push(marker);
	});
};

interface UseMapMarkersProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
	kiosks?: Kiosk[];
	colorScheme: MantineColorScheme;
}

export function useMapMarkers({ mapRef, kiosks = [], colorScheme }: UseMapMarkersProps) {
	const markersRef = useRef<maplibregl.Marker[]>([]);

	// Filter kiosks that have valid coordinates
	const kiosksWithCoordinates = useMemo(() => {
		return kiosks.filter(
			(kiosk) => kiosk.latitude && kiosk.longitude,
		);
	}, [kiosks]);

	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const createMarkersWhenReady = () => {
			// Clear existing markers first
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];

			// Create new markers if there are kiosks with coordinates
			if (kiosksWithCoordinates.length > 0) {
				createMarkers(map, markersRef, kiosksWithCoordinates);
			}
		};

		if (map.loaded()) createMarkersWhenReady();
		else map.once('load', createMarkersWhenReady);

		return () => {
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
		};
	}, [mapRef, kiosksWithCoordinates, colorScheme]);

	return markersRef;
}

export function createMarkersOnMap(
	map: maplibregl.Map,
	markersRef: React.RefObject<maplibregl.Marker[]>,
	kiosks: Kiosk[],
) {
	createMarkers(map, markersRef, kiosks);
}
