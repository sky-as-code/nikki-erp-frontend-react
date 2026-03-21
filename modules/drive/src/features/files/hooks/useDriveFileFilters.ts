import React from 'react';

import { DRIVE_FILE_TYPE_TO_MIME } from '../fileSlice';
import { DriveFileType } from '../types';

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
		types: [],
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
			and.push({ if: ['status', 'in', ...filters.statuses] });
		}

		if (filters.visibilities.length > 0) {
			and.push({ if: ['visibility', 'in', ...filters.visibilities] });
		}

		if (filters.types.length > 0) {
			const typeOrConditions: any[] = [];
			const hasFolderType = filters.types.includes(DriveFileType.FOLDER);
			if (hasFolderType) {
				typeOrConditions.push({ if: ['is_folder', '=', true] });
			}

			const nonFolderTypes = filters.types.filter((type) => type !== DriveFileType.FOLDER);
			const mimes = Array.from(new Set(nonFolderTypes.flatMap((type) => DRIVE_FILE_TYPE_TO_MIME[type] ?? [])));
			if (mimes.length > 0) {
				typeOrConditions.push({
					and: [
						{ if: ['is_folder', '=', false] },
						{ if: ['mime', 'in', ...mimes] },
					],
				});
			}

			if (typeOrConditions.length === 1) {
				and.push(typeOrConditions[0]);
			}
			if (typeOrConditions.length > 1) {
				and.push({ or: typeOrConditions });
			}
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
