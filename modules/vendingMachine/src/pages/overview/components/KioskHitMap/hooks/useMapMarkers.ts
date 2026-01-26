import maplibregl from 'maplibre-gl';
import { useRef, useEffect } from 'react';


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

const geoJsonData: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: mockKiosks.map((kiosk) => ({
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [kiosk.lng, kiosk.lat],
		},
		properties: {
			id: kiosk.id,
			name: kiosk.name,
			status: kiosk.status,
			temperature: kiosk.temperature,
			humidity: kiosk.humidity,
			powerConsumption: kiosk.powerConsumption,
		},
	})),
};

const createMarkers = (map: maplibregl.Map, markersRef: React.MutableRefObject<maplibregl.Marker[]>) => {
	markersRef.current.forEach(marker => marker.remove());
	markersRef.current = [];

	geoJsonData.features.forEach((feature) => {
		if (feature.geometry.type !== 'Point') return;
		const [lng, lat] = feature.geometry.coordinates;
		const status = feature.properties?.status || 'active';
		const name = feature.properties?.name || '';
		const temperature = feature.properties?.temperature || 0;
		const humidity = feature.properties?.humidity || 0;
		const powerConsumption = feature.properties?.powerConsumption || 0;

		const el = document.createElement('div');
		el.className = 'custom-marker';
		el.style.width = '32px';
		el.style.height = '32px';
		el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='${status === 'active' ? '%234caf50' : '%23f44336'}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
		el.style.backgroundSize = 'contain';
		el.style.backgroundRepeat = 'no-repeat';
		el.style.backgroundPosition = 'center';
		el.style.cursor = 'pointer';

		const popup = new maplibregl.Popup({ offset: 25 })
			.setHTML(`
				<div style="padding: 8px;">
					<strong>${name}</strong><br/>
					<span>Trạng thái: ${status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}</span>
					${status === 'active' ? `
						<br/>Nhiệt độ: ${temperature}°C
						<br/>Độ ẩm: ${humidity}%
						<br/>Tiêu thụ: ${powerConsumption}kW
					` : ''}
				</div>
			`);

		const marker = new maplibregl.Marker({
			element: el,
			anchor: 'bottom',
		})
			.setLngLat([lng, lat])
			.setPopup(popup)
			.addTo(map);

		markersRef.current.push(marker);
	});
};

interface UseMapMarkersProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
}

export function useMapMarkers({ mapRef }: UseMapMarkersProps) {
	const markersRef = useRef<maplibregl.Marker[]>([]);

	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		if (map.loaded()) {
			createMarkers(map, markersRef);
		}
		else {
			map.once('load', () => {
				createMarkers(map, markersRef);
			});
		}

		return () => {
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
		};
	}, [mapRef]);

	return markersRef;
}

export function createMarkersOnMap(map: maplibregl.Map, markersRef: React.MutableRefObject<maplibregl.Marker[]>) {
	createMarkers(map, markersRef);
}

