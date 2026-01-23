import { Box } from '@mantine/core';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef } from 'react';

import { Kiosk, KioskStatus } from '../../types';

import 'maplibre-gl/dist/maplibre-gl.css';


export interface KioskMapViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	onViewDetail?: (kioskId: string) => void;
}

// eslint-disable-next-line max-lines-per-function
export const KioskMapView: React.FC<KioskMapViewProps> = ({
	kiosks,
	isLoading = false,
}) => {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);

	useEffect(() => {
		if (!mapContainerRef.current || isLoading || kiosks.length === 0) return;

		// Tính toán center từ tất cả các kiosk
		const avgLng = kiosks.reduce((sum, k) => sum + k.coordinates.longitude, 0) / kiosks.length;
		const avgLat = kiosks.reduce((sum, k) => sum + k.coordinates.latitude, 0) / kiosks.length;

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: 'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
			center: [avgLng, avgLat],
			zoom: 11,
		});

		map.addControl(new maplibregl.NavigationControl());

		map.on('load', () => {
			// Xóa markers cũ nếu có
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];

			// Tạo marker cho mỗi kiosk
			kiosks.forEach((kiosk) => {
				const { longitude: lng, latitude: lat } = kiosk.coordinates;
				const status = kiosk.status;
				const name = kiosk.name;
				const code = kiosk.code;
				const address = kiosk.address;
				const isActive = kiosk.isActive;

				// Tạo element cho marker
				const el = document.createElement('div');
				el.className = 'custom-marker';
				el.style.width = '32px';
				el.style.height = '32px';
				const statusColor = status === KioskStatus.ACTIVATED && isActive
					? '%234caf50'
					: status === KioskStatus.DELETED
						? '%23f44336'
						: '%23ff9800';
				el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='${statusColor}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
				el.style.backgroundSize = 'contain';
				el.style.backgroundRepeat = 'no-repeat';
				el.style.backgroundPosition = 'center';
				el.style.cursor = 'pointer';

				// Tạo popup với thông tin kiosk
				const popup = new maplibregl.Popup({ offset: 25 })
					.setHTML(`
						<div style="padding: 8px;">
							<strong>${name}</strong><br/>
							<span>Mã: ${code}</span><br/>
							<span>Địa chỉ: ${address}</span><br/>
							<span>Trạng thái: ${status === KioskStatus.ACTIVATED ? 'Đã kích hoạt' : status === KioskStatus.DISABLED ? 'Vô hiệu hóa' : 'Đã xóa'}</span><br/>
							<span>Hoạt động: ${isActive ? 'Đang hoạt động' : 'Không hoạt động'}</span>
						</div>
					`);

				// Tạo marker
				const marker = new maplibregl.Marker({
					element: el,
					anchor: 'bottom',
				})
					.setLngLat([lng, lat])
					.setPopup(popup)
					.addTo(map);

				// Popup sẽ tự động hiển thị khi click vào marker, không cần gọi onViewDetail

				markersRef.current.push(marker);
			});
		});

		mapRef.current = map;

		return () => {
			// Xóa tất cả markers
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
			if (mapRef.current) {
				mapRef.current.remove();
			}
		};
	}, [kiosks, isLoading]);

	if (isLoading) {
		return <Box w='100%' h='500px' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</Box>;
	}

	if (kiosks.length === 0) {
		return <Box w='100%' h='500px' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No kiosks to display</Box>;
	}

	return (
		<Box
			ref={mapContainerRef}
			w='100%'
			h='500px'
		/>
	);
};

