import { FilterGroupConfig } from '@/components/FilterGroup';


export const filterConfig: FilterGroupConfig = {
	search: [
		{
			key: 'referenceCode',
			label: 'Mã dòng máy',
			placeholder: 'Tìm kiếm theo mã dòng máy...',
			operator: '*',
		},
		{
			key: 'name',
			label: 'Tên dòng máy',
			placeholder: 'Tìm kiếm theo tên dòng máy...',
			operator: '*',
		},
		{
			key: 'description',
			label: 'Mô tả',
			placeholder: 'Tìm kiếm theo mô tả...',
			operator: '*',
		},
	],
	// filter: {
	// 	key: 'filter',
	// 	label: 'Filter',
	// 	condition: [
	// 		'$and', [
	// 			{
	// 				key: 'status',
	// 				label: 'Trạng thái',
	// 				condition: ['$or', [
	// 					{
	// 						key: 'status',
	// 						label: 'Trạng thái',
	// 						condition: ['=', KioskModelStatus.ACTIVE],
	// 					},
	// 					{
	// 						key: 'status',
	// 						label: 'Trạng thái',
	// 						condition: ['=', KioskModelStatus.INACTIVE],
	// 					},
	// 					{
	// 						key: 'status',
	// 						label: 'Trạng thái',
	// 						condition: ['=', KioskModelStatus.DELETED],
	// 					},
	// 				]],
	// 			},
	// 		],
	// 	],
	// },
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
			key: 'referenceCode',
			label: 'Mã dòng máy',
		},
		{
			key: 'name',
			label: 'Tên dòng máy',
		},
		{
			key: 'createdAt',
			label: 'Ngày tạo',
		},
	],
	favorites: {
		onSave: (name: string, graph: any) => {
			// TODO: Implement save to localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kioskModel_filters') || '[]');
			saved.push({ name, graph, createdAt: new Date().toISOString() });
			localStorage.setItem('kioskModel_filters', JSON.stringify(saved));
		},
		onLoad: (name: string) => {
			// TODO: Implement load from localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kioskModel_filters') || '[]');
			const filter = saved.find((f: any) => f.name === name);
			return filter?.graph || null;
		},
		onDelete: (name: string) => {
			// TODO: Implement delete from localStorage or backend
			const saved = JSON.parse(localStorage.getItem('kiosk_filters') || '[]');
			const filtered = saved.filter((f: any) => f.name !== name);
			localStorage.setItem('kioskModel_filters', JSON.stringify(filtered));
		},
		get savedFilters() {
			try {
				const saved = JSON.parse(localStorage.getItem('kioskModel_filters') || '[]');
				return saved.map((f: any) => ({ name: f.name, graph: f.graph }));
			}
			catch {
				return [];
			}
		},
	},
};
