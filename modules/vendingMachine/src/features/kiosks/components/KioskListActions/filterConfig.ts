import { FilterGroupConfig } from '@/components/FilterGroup';

import { ConnectionStatus, KioskMode, KioskStatus } from '../../types';





export const kioskFilterConfig: FilterGroupConfig = {
	search: [
		{
			key: 'code',
			label: 'Mã kiosk',
			placeholder: 'Tìm kiếm theo mã...',
			operator: '*',
		},
		{
			key: 'name',
			label: 'Tên kiosk',
			placeholder: 'Tìm kiếm theo tên...',
			operator: '*',
		},
		{
			key: 'address',
			label: 'Địa chỉ',
			placeholder: 'Tìm kiếm theo địa chỉ...',
			operator: '*',
		},
	],
	filter: {
		key: 'filter',
		label: 'Filter',
		condition: [
			'$and', [
				{
					key: 'status',
					label: 'Trạng thái',
					condition: ['$and', [
						{
							key: 'status',
							label: 'Trạng thái',
							condition: ['in', [KioskStatus.ACTIVATED, KioskStatus.DISABLED, KioskStatus.DELETED]],
						},
						{
							key: 'status',
							label: 'Trạng thái',
							condition: ['!=', KioskStatus.DELETED],
						},
						{
							key: 'connectionStatus',
							label: 'Trạng thái kết nối',
							condition: ['=', ConnectionStatus.FAST],
						},
						{
							key: 'connectionStatus',
							label: 'Trạng thái kết nối',
							condition: ['$or', [
								{
									key: 'connectionStatus',
									label: 'Trạng thái kết nối',
									condition: ['=', ConnectionStatus.FAST],
								},
								{
									key: 'connectionStatus',
									label: 'Trạng thái kết nối',
									condition: ['=', ConnectionStatus.SLOW],
								},
								{
									key: 'connectionStatus',
									label: 'Trạng thái kết nối',
									condition: ['=', ConnectionStatus.DISCONNECTED],
								},
							]],
						},
					]],
				},
				{
					key: 'connectionStatus',
					label: 'Trạng thái kết nối',
					condition: ['$or', [
						{
							key: 'connectionStatus',
							label: 'Trạng thái kết nối',
							condition: ['=', ConnectionStatus.FAST],
						},
						{
							key: 'connectionStatus',
							label: 'Trạng thái kết nối',
							condition: ['=', ConnectionStatus.SLOW],
						},
						{
							key: 'connectionStatus',
							label: 'Trạng thái kết nối',
							condition: ['=', ConnectionStatus.DISCONNECTED],
						},
					]],
				},
				{
					key: 'mode',
					label: 'Chế độ',
					condition: ['$or', [
						{
							key: 'mode',
							label: 'Chế độ',
							condition: ['=', KioskMode.PENDING],
						},
						{
							key: 'mode',
							label: 'Chế độ',
							condition: ['=', KioskMode.SELLING],
						},
						{
							key: 'mode',
							label: 'Chế độ',
							condition: ['=', KioskMode.SLIDESHOW_ONLY],
						},
					]],
				},
				{
					key: 'isActive',
					label: 'Hoạt động',
					condition: ['$or', [
						{
							key: 'isActive',
							label: 'Hoạt động',
							condition: ['=', 'true'],
						},
						{
							key: 'isActive',
							label: 'Hoạt động',
							condition: ['=', 'false'],
						},
					]],
				},
				{
					key: 'mode',
					label: 'Chế độ',
					component: {
						type: 'range_number',
						min: 0,
						max: 100,
						step: 1,
					},
					condition: ['$and', [
						{
							key: 'mode',
							label: 'Chế độ',
							condition: ['>=', 0],
						},
						{
							key: 'mode',
							label: 'Chế độ',
							condition: ['<=', 100],
						},
					]],
				},
			],
		],
	},
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
		},
		{
			key: 'name',
			label: 'Tên kiosk',
		},
		{
			key: 'createdAt',
			label: 'Ngày tạo',
		},
		{
			key: 'connectionStatus',
			label: 'Trạng thái kết nối',
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
