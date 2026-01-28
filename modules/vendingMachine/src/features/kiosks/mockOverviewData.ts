import {
	CustomerUsage,
	ErrorStatus,
	ErrorType,
	LowStockAlert,
	MachineType,
	OperationParameter,
	SupportRequest,
} from './types';

// Mock errors data
export const mockKioskErrors = [
	{
		id: 'err-001',
		kioskId: '3',
		kioskCode: 'KIOSK-003',
		kioskName: 'Kiosk Bến Thành',
		type: ErrorType.DISCONNECTED,
		status: ErrorStatus.PENDING,
		description: 'Mất kết nối hơn 2 giờ',
		reportedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
		severity: 'high' as const,
	},
	{
		id: 'err-002',
		kioskId: '2',
		kioskCode: 'KIOSK-002',
		kioskName: 'Kiosk Sân Bay Tân Sơn Nhất',
		type: ErrorType.TEMPERATURE,
		status: ErrorStatus.IN_PROGRESS,
		description: 'Nhiệt độ cao bất thường: 35°C (ngưỡng: 30°C)',
		reportedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
		severity: 'medium' as const,
	},
	{
		id: 'err-003',
		kioskId: '7',
		kioskCode: 'KIOSK-007',
		kioskName: 'Kiosk Crescent Mall',
		type: ErrorType.DEVICE_ERROR,
		status: ErrorStatus.PENDING,
		description: 'Lỗi thiết bị thanh toán không phản hồi',
		reportedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
		severity: 'critical' as const,
	},
	{
		id: 'err-004',
		kioskId: '1',
		kioskCode: 'KIOSK-001',
		kioskName: 'Kiosk Trung Tâm Thành Phố',
		type: ErrorType.SALES_APP_ERROR,
		status: ErrorStatus.RESOLVED,
		description: 'Ứng dụng bán hàng bị crash',
		reportedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
		resolvedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
		severity: 'high' as const,
	},
	{
		id: 'err-005',
		kioskId: '8',
		kioskCode: 'KIOSK-008',
		kioskName: 'Kiosk Bitexco',
		type: ErrorType.POWER_CAPACITY,
		status: ErrorStatus.PENDING,
		description: 'Công suất điện không đảm bảo: 85% (ngưỡng: 80%)',
		reportedAt: new Date(Date.now() - 30 * 60000).toISOString(),
		severity: 'medium' as const,
	},
	{
		id: 'err-006',
		kioskId: '4',
		kioskCode: 'KIOSK-004',
		kioskName: 'Kiosk Vincom Center',
		type: ErrorType.REFUND_ERROR,
		status: ErrorStatus.RESOLVED,
		description: 'Lỗi hoàn tiền không thành công',
		reportedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
		resolvedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
		severity: 'high' as const,
	},
	{
		id: 'err-007',
		kioskId: '5',
		kioskCode: 'KIOSK-005',
		kioskName: 'Kiosk Landmark 81',
		type: ErrorType.WARNING,
		status: ErrorStatus.PENDING,
		description: 'Cảnh báo: Độ ẩm cao: 75% (ngưỡng: 70%)',
		reportedAt: new Date(Date.now() - 45 * 60000).toISOString(),
		severity: 'low' as const,
	},
];

// Mock low stock alerts
export const mockLowStockAlerts: LowStockAlert[] = [
	{
		id: 'stock-001',
		kioskId: '1',
		kioskCode: 'KIOSK-001',
		kioskName: 'Kiosk Trung Tâm Thành Phố',
		stockRatio: 0.15,
		requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
		items: [
			{ productId: 'p1', productName: 'Coca Cola 330ml', currentStock: 5, maxStock: 50 },
			{ productId: 'p2', productName: 'Pepsi 330ml', currentStock: 3, maxStock: 50 },
			{ productId: 'p3', productName: 'Snack khoai tây', currentStock: 2, maxStock: 30 },
		],
	},
	{
		id: 'stock-002',
		kioskId: '2',
		kioskCode: 'KIOSK-002',
		kioskName: 'Kiosk Sân Bay Tân Sơn Nhất',
		stockRatio: 0.08,
		requestedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
		items: [
			{ productId: 'p1', productName: 'Coca Cola 330ml', currentStock: 2, maxStock: 50 },
			{ productId: 'p4', productName: 'Nước suối 500ml', currentStock: 1, maxStock: 40 },
		],
	},
	{
		id: 'stock-003',
		kioskId: '5',
		kioskCode: 'KIOSK-005',
		kioskName: 'Kiosk Landmark 81',
		stockRatio: 0.12,
		requestedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
		restockedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
		items: [
			{ productId: 'p2', productName: 'Pepsi 330ml', currentStock: 4, maxStock: 50 },
		],
	},
];

// Mock customer usage data (for hit map and visit chart)
export const mockCustomerUsage: CustomerUsage[] = [
	// Day 1
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-22', usageCount: 145 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-22', usageCount: 89 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-22', usageCount: 67 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-22', usageCount: 123 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-22', usageCount: 98 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-22', usageCount: 56 },
	// Day 2
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-23', usageCount: 152 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-23', usageCount: 95 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-23', usageCount: 72 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-23', usageCount: 130 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-23', usageCount: 105 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-23', usageCount: 62 },
	// Day 3
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-24', usageCount: 138 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-24', usageCount: 87 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-24', usageCount: 65 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-24', usageCount: 118 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-24', usageCount: 92 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-24', usageCount: 54 },
	// Day 4
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-25', usageCount: 165 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-25', usageCount: 102 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-25', usageCount: 78 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-25', usageCount: 142 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-25', usageCount: 115 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-25', usageCount: 68 },
	// Day 5
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-26', usageCount: 148 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-26', usageCount: 91 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-26', usageCount: 70 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-26', usageCount: 125 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-26', usageCount: 100 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-26', usageCount: 59 },
	// Day 6
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-27', usageCount: 160 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-27', usageCount: 98 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-27', usageCount: 75 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-27', usageCount: 135 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-27', usageCount: 108 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-27', usageCount: 64 },
	// Day 7
	{ kioskId: '1', kioskCode: 'KIOSK-001', kioskName: 'Kiosk Trung Tâm Thành Phố', date: '2026-01-28', usageCount: 145 },
	{ kioskId: '2', kioskCode: 'KIOSK-002', kioskName: 'Kiosk Sân Bay Tân Sơn Nhất', date: '2026-01-28', usageCount: 89 },
	{ kioskId: '4', kioskCode: 'KIOSK-004', kioskName: 'Kiosk Vincom Center', date: '2026-01-28', usageCount: 67 },
	{ kioskId: '5', kioskCode: 'KIOSK-005', kioskName: 'Kiosk Landmark 81', date: '2026-01-28', usageCount: 123 },
	{ kioskId: '7', kioskCode: 'KIOSK-007', kioskName: 'Kiosk Crescent Mall', date: '2026-01-28', usageCount: 98 },
	{ kioskId: '9', kioskCode: 'KIOSK-009', kioskName: 'Kiosk Bãi biển Mỹ Khê', date: '2026-01-28', usageCount: 56 },
];

// Mock operation parameters (time series data)
export const mockOperationParameters: OperationParameter[] = [
	{ kioskId: '1', timestamp: '2026-01-28T00:00:00Z', temperature: 24.5, humidity: 55.2, powerConsumption: 285.3, cpu: 45, redis: 12, memory: 65 },
	{ kioskId: '1', timestamp: '2026-01-28T01:00:00Z', temperature: 24.2, humidity: 54.8, powerConsumption: 282.1, cpu: 42, redis: 11, memory: 63 },
	{ kioskId: '1', timestamp: '2026-01-28T02:00:00Z', temperature: 23.9, humidity: 54.5, powerConsumption: 278.5, cpu: 40, redis: 10, memory: 61 },
	{ kioskId: '1', timestamp: '2026-01-28T03:00:00Z', temperature: 23.5, humidity: 54.2, powerConsumption: 275.2, cpu: 38, redis: 9, memory: 59 },
	{ kioskId: '1', timestamp: '2026-01-28T04:00:00Z', temperature: 23.2, humidity: 53.9, powerConsumption: 272.8, cpu: 36, redis: 8, memory: 57 },
	{ kioskId: '1', timestamp: '2026-01-28T05:00:00Z', temperature: 23.8, humidity: 54.5, powerConsumption: 276.5, cpu: 39, redis: 9, memory: 60 },
	{ kioskId: '1', timestamp: '2026-01-28T06:00:00Z', temperature: 24.1, humidity: 55.0, powerConsumption: 280.2, cpu: 41, redis: 10, memory: 62 },
	{ kioskId: '1', timestamp: '2026-01-28T07:00:00Z', temperature: 24.5, humidity: 55.2, powerConsumption: 285.3, cpu: 45, redis: 12, memory: 65 },
];

// Mock support requests
export const mockSupportRequests: SupportRequest[] = [
	{
		id: 'sup-001',
		kioskId: '1',
		kioskCode: 'KIOSK-001',
		kioskName: 'Kiosk Trung Tâm Thành Phố',
		customerName: 'Nguyễn Văn A',
		customerPhone: '0901234567',
		description: 'Máy không nhận tiền, không thể mua hàng',
		status: 'pending',
		createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
	},
	{
		id: 'sup-002',
		kioskId: '2',
		kioskCode: 'KIOSK-002',
		kioskName: 'Kiosk Sân Bay Tân Sơn Nhất',
		customerName: 'Trần Thị B',
		customerPhone: '0912345678',
		description: 'Sản phẩm bị kẹt, không rơi xuống',
		status: 'in_progress',
		createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
	},
	{
		id: 'sup-003',
		kioskId: '5',
		kioskCode: 'KIOSK-005',
		kioskName: 'Kiosk Landmark 81',
		customerName: 'Lê Văn C',
		customerPhone: '0923456789',
		description: 'Màn hình cảm ứng không phản hồi',
		status: 'resolved',
		createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
		resolvedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
	},
];

// Helper function to get machine type distribution
export function getMachineTypeDistribution(kiosks: Array<{ machineType?: MachineType }>) {
	const distribution: Record<MachineType, number> = {
		[MachineType.DROP_PRODUCT]: 0,
		[MachineType.ELEVATOR]: 0,
	};

	kiosks.forEach((kiosk) => {
		if (kiosk.machineType) {
			distribution[kiosk.machineType] = (distribution[kiosk.machineType] || 0) + 1;
		}
	});

	return distribution;
}
