import {
	Box,
	Card,
	Grid,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
} from '@mantine/core';
import {
	IconBolt,
	IconDeviceDesktop,
	IconDeviceDesktopOff,
	IconDroplet,
	IconTemperature,
} from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import React from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';


// MapLibreView.tsx
import 'maplibre-gl/dist/maplibre-gl.css';


// Mock data
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

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	color: string;
	link?: string;
	suffix?: string;
}

function StatCard({ title, value, icon, color, link, suffix }: StatCardProps): React.ReactElement {
	const cardProps = link
		? { component: Link as any, to: link }
		: { component: 'div' as const };

	return (
		<Card
			{...cardProps}
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			style={{ cursor: link ? 'pointer' : 'default', transition: 'transform 0.2s', height: '100%' }}
			onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { if (link) e.currentTarget.style.transform = 'translateY(-4px)'; }}
			onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { if (link) e.currentTarget.style.transform = 'translateY(0)'; }}
		>
			<Group justify='space-between' align='flex-start'>
				<Stack gap='xs'>
					<Text size='sm' c='dimmed' fw={500}>
						{title}
					</Text>
					<Title order={2}>
						{value}{suffix && ` ${suffix}`}
					</Title>
				</Stack>
				<ThemeIcon size='xl' radius='md' variant='light' color={color}>
					{icon}
				</ThemeIcon>
			</Group>
		</Card>
	);
}

// eslint-disable-next-line max-lines-per-function
function OverviewPageBody(): React.ReactNode {
	const { t: translate } = useTranslation();

	// Calculate statistics from mock data
	const totalKiosks = mockKiosks.length;
	const activeKiosks = mockKiosks.filter((k) => k.status === 'active').length;
	const inactiveKiosks = mockKiosks.filter((k) => k.status === 'inactive').length;

	const activeKiosksWithData = mockKiosks.filter((k) => k.status === 'active' && k.temperature > 0);
	const avgTemperature = activeKiosksWithData.length > 0
		? (activeKiosksWithData.reduce((sum, k) => sum + k.temperature, 0) / activeKiosksWithData.length).toFixed(1)
		: '0';
	const avgHumidity = activeKiosksWithData.length > 0
		? (activeKiosksWithData.reduce((sum, k) => sum + k.humidity, 0) / activeKiosksWithData.length).toFixed(1)
		: '0';
	const totalPowerConsumption = mockKiosks.reduce((sum, k) => sum + k.powerConsumption, 0).toFixed(1);

	return (

		<Stack gap='md'>
			<Title order={5} mt='md'>{translate('nikki.vendingMachine.overview.statistics') || 'Thống kê'}</Title>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.total_kiosks') || 'Tổng số Kiosk'}
						value={totalKiosks}
						icon={<IconDeviceDesktop size={32} />}
						color='blue'
						link='../kiosks'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.active_kiosks') || 'Kiosk đang hoạt động'}
						value={activeKiosks}
						icon={<IconDeviceDesktop size={32} />}
						color='green'
						link='../kiosks?status=active'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.inactive_kiosks') || 'Kiosk không hoạt động'}
						value={inactiveKiosks}
						icon={<IconDeviceDesktopOff size={32} />}
						color='red'
						link='../kiosks?status=inactive'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.avg_temperature') || 'Nhiệt độ trung bình'}
						value={avgTemperature}
						suffix='°C'
						icon={<IconTemperature size={32} />}
						color='orange'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.avg_humidity') || 'Độ ẩm trung bình'}
						value={avgHumidity}
						suffix='%'
						icon={<IconDroplet size={32} />}
						color='cyan'
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
					<StatCard
						title={translate('nikki.vendingMachine.overview.total_power') || 'Tổng tiêu thụ điện'}
						value={totalPowerConsumption}
						suffix='kW'
						icon={<IconBolt size={32} />}
						color='yellow'
					/>
				</Grid.Col>
			</Grid>

			<Title order={5} mt='lg'>{translate('nikki.vendingMachine.overview.kiosk_distribution') || 'Phân bổ Kiosk'}</Title>
			<Grid>
				<Grid.Col span={12}>
					<KioskHitMap />
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

const OverviewPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.vendingMachine.overview.title') || 'Tổng quan - Máy bán hàng tự động';
	}, [translate]);
	return <OverviewPageBody />;
};

export const OverviewPage: React.FC = OverviewPageWithTitle;



// Chuyển đổi mockKiosks sang GeoJSON format
const geoJsonData: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: mockKiosks.map((kiosk) => ({
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [kiosk.lng, kiosk.lat], // GeoJSON sử dụng [lng, lat]
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

function KioskHitMap() {
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		// Tính toán center từ tất cả các kiosk
		const avgLng = mockKiosks.reduce((sum, k) => sum + k.lng, 0) / mockKiosks.length;
		const avgLat = mockKiosks.reduce((sum, k) => sum + k.lat, 0) / mockKiosks.length;

		const map = new maplibregl.Map({
			container: mapContainerRef.current,
			style: 'https://api.maptiler.com/maps/basic/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
			center: [avgLng, avgLat],
			zoom: 11,
		});

		map.addControl(new maplibregl.NavigationControl());

		map.on('load', () => {
			// Tạo marker cho mỗi điểm
			geoJsonData.features.forEach((feature) => {
				if (feature.geometry.type !== 'Point') return;
				const [lng, lat] = feature.geometry.coordinates;
				const status = feature.properties?.status || 'active';
				const name = feature.properties?.name || '';
				const temperature = feature.properties?.temperature || 0;
				const humidity = feature.properties?.humidity || 0;
				const powerConsumption = feature.properties?.powerConsumption || 0;

				// Tạo element cho marker
				const el = document.createElement('div');
				el.className = 'custom-marker';
				el.style.width = '32px';
				el.style.height = '32px';
				el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='${status === 'active' ? '%234caf50' : '%23f44336'}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
				el.style.backgroundSize = 'contain';
				el.style.backgroundRepeat = 'no-repeat';
				el.style.backgroundPosition = 'center';
				el.style.cursor = 'pointer';

				// Tạo popup với thông tin kiosk
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

				// Tạo marker
				const marker = new maplibregl.Marker({
					element: el,
					anchor: 'bottom',
				})
					.setLngLat([lng, lat])
					.setPopup(popup)
					.addTo(map);

				markersRef.current.push(marker);
			});
		});

		mapRef.current = map;

		return () => {
			// Xóa tất cả markers
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
			map.remove();
		};
	}, []);

	return (
		<Box p='md' bg='white' style={{ borderRadius: '8px' }}>
			<Box
				ref={mapContainerRef}
				w='100%'
				h='500px'

			/>
		</Box>
	);
}
