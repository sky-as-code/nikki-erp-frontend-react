
import { Grid, Stack } from '@mantine/core';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import React from 'react';

import { PageContainer } from '@/components/PageContainer';

import {
	PaymentMethodRevenue,
	ProductCategoryRevenue,
	RecentActivities,
	RevenueByHour,
	RevenueByRegion,
	RevenueChart,
	RevenueGeneratedChart,
	TopProductsTable,
	TopRevenueByKiosk,
	WelcomeCard,
} from '../../features/reports/revenue/components';

// Mock data - in a real app, this would come from API calls
const mockRevenueData = [
	{ date: '2026-01-23', lastYear: 12000, thisYear: 15000 },
	{ date: '2026-01-24', lastYear: 13500, thisYear: 16500 },
	{ date: '2026-01-25', lastYear: 14000, thisYear: 17000 },
	{ date: '2026-01-26', lastYear: 12500, thisYear: 16000 },
	{ date: '2026-01-27', lastYear: 15000, thisYear: 18000 },
	{ date: '2026-01-28', lastYear: 14500, thisYear: 17500 },
	{ date: '2026-01-29', lastYear: 16000, thisYear: 19000 },
	{ date: '2026-01-30', lastYear: 15500, thisYear: 18500 },
	{ date: '2026-01-31', lastYear: 17000, thisYear: 20000 },
	{ date: '2026-02-01', lastYear: 16500, thisYear: 19500 },
	{ date: '2026-02-02', lastYear: 18000, thisYear: 21000 },
	{ date: '2026-02-03', lastYear: 17500, thisYear: 20500 },
	{ date: '2026-02-04', lastYear: 19000, thisYear: 22000 },
	{ date: '2026-02-05', lastYear: 18500, thisYear: 21500 },
	{ date: '2026-02-06', lastYear: 20000, thisYear: 23000 },
];

// Mock product category revenue data
// Testing with 6 items to demonstrate "Other" grouping (will show top 4 + "Other")
const mockProductCategoryRevenue = {
	totalRevenue: '$125,000',
	items: [
		{ name: 'Nước suối', revenue: 35000, percentage: 28.0, change: 5.2, color: 'rgba(59, 130, 246, 0.8)' },
		{ name: 'Cà phê', revenue: 32000, percentage: 25.6, change: 8.1, color: 'rgba(139, 69, 19, 0.8)' },
		{ name: 'Nước có ga', revenue: 25000, percentage: 20.0, change: -2.3, color: 'rgba(34, 197, 94, 0.8)' },
		{ name: 'Đồ ăn', revenue: 18000, percentage: 14.4, change: 12.5, color: 'rgba(251, 146, 60, 0.8)' },
		{ name: 'Sữa', revenue: 10000, percentage: 8.0, change: 3.7, color: 'rgba(255, 255, 255, 0.8)' },
		{ name: 'Dừa', revenue: 5000, percentage: 4.0, change: -1.2, color: 'rgba(168, 85, 247, 0.8)' },
	],
};

const mockProducts = [
	{ id: '1', name: 'Shanty Cotton Seat', vendors: ['V1', 'V2', 'V3'], margin: 45.50, sold: 234, stock: 'in_stock' as const },
	{ id: '2', name: 'Advanced Soft Couch', vendors: ['V1', 'V2'], margin: 427.00, sold: 189, stock: 'in_stock' as const },
	{ id: '3', name: 'Premium Wooden Table', vendors: ['V3', 'V4', 'V5'], margin: 289.99, sold: 156, stock: 'low_stock' as const },
	{ id: '4', name: 'Modern Glass Chair', vendors: ['V2'], margin: 125.00, sold: 298, stock: 'in_stock' as const },
	{ id: '5', name: 'Luxury Leather Sofa', vendors: ['V1', 'V3', 'V4', 'V5'], margin: 899.99, sold: 87, stock: 'in_stock' as const },
	{ id: '6', name: 'Classic Bookshelf', vendors: ['V2', 'V3'], margin: 199.50, sold: 201, stock: 'low_stock' as const },
	{ id: '7', name: 'Elegant Dining Set', vendors: ['V1', 'V4'], margin: 650.00, sold: 134, stock: 'in_stock' as const },
	{ id: '8', name: 'Comfortable Recliner', vendors: ['V3'], margin: 375.00, sold: 167, stock: 'in_stock' as const },
	{ id: '9', name: 'Stylish Coffee Table', vendors: ['V2', 'V5'], margin: 225.00, sold: 223, stock: 'in_stock' as const },
	{ id: '10', name: 'Minimalist Desk', vendors: ['V1', 'V2', 'V3'], margin: 299.99, sold: 145, stock: 'low_stock' as const },
	{ id: '11', name: 'Cozy Armchair', vendors: ['V4'], margin: 189.00, sold: 278, stock: 'in_stock' as const },
	{ id: '12', name: 'Executive Office Chair', vendors: ['V1', 'V5'], margin: 449.99, sold: 112, stock: 'in_stock' as const },
];

const mockActivities = [
	{ id: '1', type: 'purchase' as const, description: 'New order received from customer', timeAgo: '2s ago' },
	{ id: '2', type: 'order' as const, description: 'Order #1234 has been shipped', timeAgo: '5m ago' },
	{ id: '3', type: 'question' as const, description: 'Customer inquiry about product availability', timeAgo: '12m ago' },
	{ id: '4', type: 'purchase' as const, description: 'Payment received for order #1235', timeAgo: '1 hr ago' },
	{ id: '5', type: 'event' as const, description: 'Scheduled maintenance completed', timeAgo: '2 hr ago' },
	{ id: '6', type: 'order' as const, description: 'Order #1236 processing', timeAgo: '3 hr ago' },
];

// Mock payment method revenue data
// In a real app, this would come from API calls
// The percentage will be calculated automatically in the component
// Using actual payment method IDs from mockPayments
const mockPaymentMethodRevenue = [
	{ paymentMethodId: '1', revenue: 125000 }, // VietQR
	{ paymentMethodId: '2', revenue: 98000 },  // mpos
	{ paymentMethodId: '3', revenue: 75000 },  // MoMo
	{ paymentMethodId: '4', revenue: 52000 },  // ZaloPay
];

const topOrders = [
	{ id: '1', name: 'Advanced Soft Couch', price: 427 },
	{ id: '2', name: 'Premium Wooden Table', price: 289.99 },
	{ id: '3', name: 'Modern Glass Chair', price: 125 },
	{ id: '4', name: 'Luxury Leather Sofa', price: 899.99 },
];

// Mock quarterly revenue data with revenue and orders
const mockQuarterlyRevenue = [
	{ quarter: '2023 Q1', revenue: 350, orders: 1200 },
	{ quarter: '2023 Q2', revenue: 285, orders: 980 },
	{ quarter: '2023 Q3', revenue: 375, orders: 1350 },
	{ quarter: '2023 Q4', revenue: 325, orders: 1150 },
	{ quarter: '2024 Q1', revenue: 205, orders: 750 },
	{ quarter: '2024 Q2', revenue: 250, orders: 900 },
	{ quarter: '2024 Q3', revenue: 295, orders: 1050 },
];

const mockRegionRevenue = [
	{ country: 'Japan', revenue: 44000, coordinates: [138.2529, 36.2048] },
	{ country: 'Greenland', revenue: 41000, coordinates: [-42.6043, 71.7069] },
	{ country: 'India', revenue: 38000, coordinates: [78.9629, 20.5937] },
	{ country: 'Egypt', revenue: 27000, coordinates: [30.8025, 26.8206] },
	{ country: 'Mexico', revenue: 19000, coordinates: [-102.5528, 23.6345] },
	{ country: 'Angola', revenue: 13000, coordinates: [17.8739, -11.2027] },
	{ country: 'Colombia', revenue: 11000, coordinates: [-74.2973, 4.5709] },
	{ country: 'Finland', revenue: 7000, coordinates: [25.7482, 61.9241] },
];

// Mock hourly revenue and orders data
const mockHourlyData = [
	{ hour: 0, revenue: 50000, orders: 5 },
	{ hour: 1, revenue: 30000, orders: 3 },
	{ hour: 2, revenue: 20000, orders: 2 },
	{ hour: 3, revenue: 15000, orders: 1 },
	{ hour: 4, revenue: 10000, orders: 1 },
	{ hour: 5, revenue: 50000, orders: 5 },
	{ hour: 6, revenue: 200000, orders: 20 },
	{ hour: 7, revenue: 500000, orders: 50 },
	{ hour: 8, revenue: 800000, orders: 80 },
	{ hour: 9, revenue: 1200000, orders: 120 },
	{ hour: 10, revenue: 1500000, orders: 150 },
	{ hour: 11, revenue: 1800000, orders: 180 },
	{ hour: 12, revenue: 2000000, orders: 200 },
	{ hour: 13, revenue: 2100000, orders: 210 },
	{ hour: 14, revenue: 2200000, orders: 220 },
	{ hour: 15, revenue: 2308900, orders: 230 },
	{ hour: 16, revenue: 2100000, orders: 210 },
	{ hour: 17, revenue: 1900000, orders: 190 },
	{ hour: 18, revenue: 1700000, orders: 170 },
	{ hour: 19, revenue: 1500000, orders: 150 },
	{ hour: 20, revenue: 1800000, orders: 180 },
	{ hour: 21, revenue: 1200000, orders: 120 },
	{ hour: 22, revenue: 800000, orders: 80 },
	{ hour: 23, revenue: 400000, orders: 40 },
];

// Mock top revenue by kiosk data
const mockKioskRevenue = [
	{ kioskId: '1', kioskName: 'Bảo tàng Mỹ thuật TP.HCM', revenue: 8900000, orders: 450 },
	{ kioskId: '2', kioskName: 'Cao đẳng Công nghệ Thủ Đức', revenue: 2000000, orders: 250 },
	{ kioskId: '3', kioskName: 'Saigon Garden Mall', revenue: 1800000, orders: 280 },
	{ kioskId: '4', kioskName: 'Bảo tàng Phụ nữ Nam Bộ', revenue: 1200000, orders: 200 },
	{ kioskId: '5', kioskName: 'Chung cư 4S', revenue: 800000, orders: 150 },
	{ kioskId: '6', kioskName: 'Trường ĐH Bách Khoa', revenue: 600000, orders: 120 },
	{ kioskId: '7', kioskName: 'Bệnh viện Chợ Rẫy', revenue: 500000, orders: 100 },
	{ kioskId: '8', kioskName: 'Công viên Lê Văn Tám', revenue: 400000, orders: 80 },
];

function getFormattedDate(): string {
	const today = new Date();
	return today.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

function RevenueOverviewContent(): React.ReactElement {
	return (
		<Stack gap='md'>
			<Grid>
				<Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
					<WelcomeCard
						date={getFormattedDate()}
						greeting='Good morning, Captain!'
						visitors={2110}
						earnings='$8.2M'
						orders={1124}
						ordersToday={16}
						topOrders={topOrders}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 12, lg: 8 }}>
					<RevenueGeneratedChart data={mockQuarterlyRevenue} />
				</Grid.Col>
			</Grid>

			{/* Revenue by Hour and Top Revenue by Kiosk */}
			<Grid>
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<RevenueByHour data={mockHourlyData} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<TopRevenueByKiosk data={mockKioskRevenue} />
				</Grid.Col>
			</Grid>

			{/* Revenue Chart and Product Category Revenue */}
			<Grid>
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<RevenueChart data={mockRevenueData} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<ProductCategoryRevenue
						totalRevenue={mockProductCategoryRevenue.totalRevenue}
						items={mockProductCategoryRevenue.items}
					/>
				</Grid.Col>
			</Grid>

			{/* Top Products and Payment Method Revenue */}
			<Grid>
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<TopProductsTable products={mockProducts} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<Stack gap='md'>
						<PaymentMethodRevenue data={mockPaymentMethodRevenue} />
						<RecentActivities activities={mockActivities} />
					</Stack>
				</Grid.Col>
			</Grid>

			{/* Revenue by Region */}
			<Grid>
				<Grid.Col span={12}>
					<RevenueByRegion data={mockRegionRevenue as any} />
				</Grid.Col>
			</Grid>
		</Stack>
	);
}

export function RevenueOverview(): React.ReactElement {
	useDocumentTitle('nikki.vendingMachine.reports.revenue.title');

	return (
		<PageContainer>
			<RevenueOverviewContent />
		</PageContainer>
	);
}
