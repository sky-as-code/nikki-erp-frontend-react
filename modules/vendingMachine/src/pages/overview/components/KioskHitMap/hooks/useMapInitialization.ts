import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';


interface KioskLocation {
	id: string;
	name: string;
	lat: number;
	lng: number;
	status: 'active' | 'inactive';
	temperature: number;
	humidity: number;
	powerConsumption: number;
}

const mockKiosks: KioskLocation[] = [
	{ id: '1', name: 'Kiosk 1 - Trung tâm thương mại', lat: 10.762622, lng: 106.660172, status: 'active', temperature: 25.5, humidity: 65, powerConsumption: 2.3 },
	{ id: '2', name: 'Kiosk 2 - Sân bay', lat: 10.7769, lng: 106.7009, status: 'active', temperature: 23.8, humidity: 58, powerConsumption: 2.1 },
	{ id: '3', name: 'Kiosk 3 - Bệnh viện', lat: 10.8019, lng: 106.7148, status: 'active', temperature: 24.2, humidity: 62, powerConsumption: 2.4 },
	{ id: '4', name: 'Kiosk 4 - Trường học', lat: 10.7419, lng: 106.7022, status: 'inactive', temperature: 0, humidity: 0, powerConsumption: 0 },
	{ id: '5', name: 'Kiosk 5 - Công viên', lat: 10.7879, lng: 106.7042, status: 'active', temperature: 26.1, humidity: 70, powerConsumption: 2.5 },
	{ id: '6', name: 'Kiosk 6 - Ga tàu', lat: 10.7719, lng: 106.6981, status: 'active', temperature: 25.0, humidity: 60, powerConsumption: 2.2 },
	{ id: '7', name: 'Kiosk 7 - Trung tâm mua sắm', lat: 10.7559, lng: 106.6672, status: 'inactive', temperature: 0, humidity: 0, powerConsumption: 0 },
	{ id: '8', name: 'Kiosk 8 - Văn phòng', lat: 10.7699, lng: 106.6902, status: 'active', temperature: 24.5, humidity: 63, powerConsumption: 2.3 },
];

interface UseMapInitializationProps {
	mapContainerRef: React.RefObject<HTMLDivElement | null>;
	getMapStyle: (dark: boolean) => string;
	isDark: boolean;
}

export function useMapInitialization({
	mapContainerRef,
	getMapStyle,
	isDark,
}: UseMapInitializationProps) {
	const mapRef = useRef<maplibregl.Map | null>(null);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		const avgLng = mockKiosks.reduce((sum, k) => sum + k.lng, 0) / mockKiosks.length;
		const avgLat = mockKiosks.reduce((sum, k) => sum + k.lat, 0) / mockKiosks.length;
		const mapStyle = getMapStyle(isDark);

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [avgLng, avgLat],
			zoom: 11,
			scrollZoom: false,
		});

		map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
		mapRef.current = map;

		return () => {
			map.remove();
		};
	}, []); // Chỉ chạy một lần khi mount

	return mapRef;
}

