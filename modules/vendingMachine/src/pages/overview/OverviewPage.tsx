import {
	Box,
	Card,
	Grid,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
	Center,
	Container,
} from '@mantine/core';
import {
	IconBolt,
	IconDeviceDesktop,
	IconDeviceDesktopOff,
	IconDroplet,
	IconTemperature,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { KioskHitMap } from './components/KioskHitMap';


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
			shadow='lg'
			padding='lg'
			radius='md'
			withBorder
			style={{
				cursor: link ? 'pointer' : 'default',
				transition: 'transform 0.2s',
				height: '100%',
				backgroundColor: 'var(--mantine-color-body)',
				backdropFilter: 'blur(10px)',
				opacity: 0.95,
			}}
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
		<Container fluid>

			<Box
				mt={50}
				style={{
					position: 'relative',
					width: '100%',
					// minHeight: '100vh',
					height: '800px',
					overflow: 'hidden',
				}}
			>
				{/* Map as background */}
				<Box
					p='md'
					bg='white'
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 0,
					}}
				>
					<KioskHitMap />
				</Box>

				{/* StatCards positioned on top */}
				<Box
					style={{
						position: 'relative',
						zIndex: 1,
						padding: '1rem',
					}}
				>
					<Title order={5} mb='md' style={{ color: 'var(--mantine-color-text)' }}>
						{translate('nikki.vendingMachine.overview.statistics') || 'Thống kê'}
					</Title>
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
				</Box>



			</Box>
			<Box mt={50} h={500} bg='white'>
				<Center>Padding docks</Center>
			</Box>
		</Container>
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
