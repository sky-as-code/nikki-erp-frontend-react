import { ConnectionStatus, KioskMode, KioskStatus } from '../types';

import { FilterDropdownConfig } from '@/components/FilterDropdown';


export const kioskFilterConfig: FilterDropdownConfig = {
	search: [
		{
			key: 'code',
			label: 'Mã kiosk',
			placeholder: 'Tìm kiếm theo mã...',
			operator: '~',
		},
		{
			key: 'name',
			label: 'Tên kiosk',
			placeholder: 'Tìm kiếm theo tên...',
			operator: '~',
		},
		{
			key: 'address',
			label: 'Địa chỉ',
			placeholder: 'Tìm kiếm theo địa chỉ...',
			operator: '~',
		},
	],
	filter: [
		{
			key: 'status',
			label: 'Trạng thái',
			type: 'multiselect',
			options: [
				{ value: KioskStatus.ACTIVATED, label: 'Đã kích hoạt' },
				{ value: KioskStatus.DISABLED, label: 'Đã vô hiệu hóa' },
				{ value: KioskStatus.DELETED, label: 'Đã xóa' },
			],
			operator: '=',
		},
		{
			key: 'connectionStatus',
			label: 'Trạng thái kết nối',
			type: 'select',
			options: [
				{ value: ConnectionStatus.FAST, label: 'Nhanh' },
				{ value: ConnectionStatus.SLOW, label: 'Chậm' },
				{ value: ConnectionStatus.DISCONNECTED, label: 'Mất kết nối' },
			],
			operator: '=',
		},
		{
			key: 'mode',
			label: 'Chế độ',
			type: 'select',
			options: [
				{ value: KioskMode.PENDING, label: 'Chờ xử lý' },
				{ value: KioskMode.SELLING, label: 'Đang bán' },
				{ value: KioskMode.ADSONLY, label: 'Chỉ quảng cáo' },
			],
			operator: '=',
		},
		{
			key: 'isActive',
			label: 'Hoạt động',
			type: 'select',
			options: [
				{ value: 'true', label: 'Có' },
				{ value: 'false', label: 'Không' },
			],
			operator: '=',
		},
	],
	groupBy: [
		{
			key: 'status',
			label: 'Trạng thái',
		},
		{
			key: 'mode',
			label: 'Chế độ',
		},
		{
			key: 'connectionStatus',
			label: 'Trạng thái kết nối',
		},
	],
	sort: [
		{
			key: 'code',
			label: 'Mã kiosk',
			defaultDirection: 'asc',
		},
		{
			key: 'name',
			label: 'Tên kiosk',
			defaultDirection: 'asc',
		},
		{
			key: 'createdAt',
			label: 'Ngày tạo',
			defaultDirection: 'desc',
		},
		{
			key: 'connectionStatus',
			label: 'Trạng thái kết nối',
			defaultDirection: 'asc',
		},
	],
	favorites: {
		onSave: (name: string, graph: any) => {
			// TODO: Implement save to localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kiosk_filters') || '[]');
			saved.push({ name, graph, createdAt: new Date().toISOString() });
			localStorage.setItem('kiosk_filters', JSON.stringify(saved));
		},
		onLoad: (name: string) => {
			// TODO: Implement load from localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kiosk_filters') || '[]');
			const filter = saved.find((f: any) => f.name === name);
			return filter?.graph || null;
		},
		onDelete: (name: string) => {
			// TODO: Implement delete from localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kiosk_filters') || '[]');
			const filtered = saved.filter((f: any) => f.name !== name);
			localStorage.setItem('kiosk_filters', JSON.stringify(filtered));
		},
		get savedFilters() {
			try {
				const saved = JSON.parse(localStorage.getItem('kiosk_filters') || '[]');
				return saved.map((f: any) => ({ name: f.name, graph: f.graph }));
			}
			catch {
				return [];
			}
		},
	},
};
