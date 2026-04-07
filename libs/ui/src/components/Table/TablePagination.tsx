import { Group, Pagination, Select } from '@mantine/core';
import React from 'react';


export type PageSizeOption = { value: string; label: string };

export interface TablePaginationProps {
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageSize?: number;
	pageSizeOptions?: PageSizeOption[];
	onPageSizeChange?: (value: string | null) => void;
}

const DEFAULT_PAGE_SIZE = '10';
const DEFAULT_TOTAL_PAGES = 1;
const DEFAULT_PAGE_SIZE_OPTIONS = [
	{ value: '5', label: '5 / page' },
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
];

export const TablePagination: React.FC<TablePaginationProps> = ({
	page = 1,
	totalPages = DEFAULT_TOTAL_PAGES,
	onPageChange,
	pageSize = DEFAULT_PAGE_SIZE,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	onPageSizeChange,
}) => {

	return <Group justify='end' mt='md'>
		<Pagination
			total={totalPages}
			defaultValue={1}
			value={page}
			onChange={onPageChange}
		/>
		{pageSizeOptions && (
			<Select
				w={120}
				size='sm'
				data={pageSizeOptions}
				value={String(pageSize)}
				onChange={onPageSizeChange}
				allowDeselect={false}
			/>
		)}
	</Group>;
};
