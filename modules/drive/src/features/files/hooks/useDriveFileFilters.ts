import React from 'react';

import type { DriveFileFilterState } from '../components/filters/DriveFileFilterBar';


export type UseDriveFileFiltersOptions = {
	pageSize?: number;
	baseConditions?: any[];
	onBeforeApply?: () => void;
	onApply?: (req: {
		page: number;
		size: number;
		graph: Record<string, unknown>;
	}) => void;
};

export function useDriveFileFilters({
	pageSize = 20,
	baseConditions,
	onBeforeApply,
	onApply,
}: UseDriveFileFiltersOptions) {
	const [filters, setFilters] = React.useState<DriveFileFilterState>({
		statuses: [],
		visibilities: [],
		isFolderValues: [],
		sortField: 'name',
		sortDirection: 'asc',
		folderFirst: true,
	});

	const handleApplyFilters = React.useCallback(() => {
		onBeforeApply?.();

		const and: any[] = [
			// base conditions từ ngoài truyền vào (tùy page)
			...(baseConditions ?? []),
		];

		if (filters.statuses.length > 0) {
			and.push({ if: ['status', 'in', filters.statuses] });
		}

		if (filters.visibilities.length > 0) {
			and.push({ if: ['visibility', 'in', filters.visibilities] });
		}

		if (filters.isFolderValues.length === 1) {
			const wantFolder = filters.isFolderValues[0] === 'folder';
			and.push({ if: ['is_folder', '=', wantFolder] });
		}

		const order: any[] = [];
		if (filters.folderFirst) {
			order.push(['is_folder', 'desc']);
		}
		const field = filters.sortField === 'name' ? 'name' : 'created_at';
		order.push([field, filters.sortDirection]);

		onApply?.({
			page: 0,
			size: pageSize,
			graph: {
				and,
				order,
			},
		});
	}, [baseConditions, filters, onApply, onBeforeApply, pageSize]);

	return {
		filters,
		setFilters,
		handleApplyFilters,
	};
}
