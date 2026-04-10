import { Button, Group, Text, Select, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export type PageSizeOption = { value: string; label: string };

export interface TablePaginationProps {
	totalItems?: number;
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageSize?: number;
	pageSizeOptions?: PageSizeOption[];
	onPageSizeChange?: (value: string | null) => void;
}

const DEFAULT_PAGE_SIZE = '10';
const DEFAULT_TOTAL_PAGES = 1;

export const TablePagination: React.FC<TablePaginationProps> = ({
	totalItems,
	page = 1,
	totalPages = DEFAULT_TOTAL_PAGES,
	onPageChange,
	pageSize = DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	onPageSizeChange,
}) => {
	const { t: translate } = useTranslation();
	const defaultPageSizeOptions = useMemo(() => [
		{ value: '5', label: translate('nikki.general.pagination.page_size', { count: 5 }) },
		{ value: '10', label: translate('nikki.general.pagination.page_size', { count: 10 }) },
		{ value: '20', label: translate('nikki.general.pagination.page_size', { count: 20 }) },
		{ value: '50', label: translate('nikki.general.pagination.page_size', { count: 50 }) },
	], []);

	const [pageInputValue, setPageInputValue] = React.useState<number | string | undefined>(page);

	const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value === '' || e.target.value === undefined) {
			setPageInputValue('');
			return;
		}

		const value = Number(e.target.value);
		if ((value && !Number.isNaN(value))) {
			if(value > totalPages) {
				setPageInputValue(String(totalPages));
				onPageChange?.(totalPages);
				return;
			}
			if(value < 1) {
				setPageInputValue(String(1));
				onPageChange?.(1);
				return;
			}
			setPageInputValue(String(value));
			onPageChange?.(value);
		}
	};

	return <Group justify='space-between' mt='xs' px='xs'>
		<Box>
			{(totalItems || totalItems === 0) && <Text size='sm'>{translate('nikki.general.pagination.items_found', { count: totalItems })}</Text>}
		</Box>
		<Group gap={'sm'}>
			<Group gap={2} align='center'>
				<Button size='compact-sm' p={0} variant='transparent'
					onClick={() => page > 1 && onPageChange?.(page - 1)}
				>
					<IconChevronLeft color='gray' size={24} stroke={1.5} />
				</Button>
				<Group gap={3} justify='center' bdrs={'sm'} bd={'solid 1px var(--mantine-color-gray-3)'}>
					<input
						style={{ width: 50, textAlign: 'center', fontSize: 'var(--mantine-font-size-sm)', border: 'none', outline: 'none' }}
						value={pageInputValue}
						onChange={handlePageChange}
					/>
					<span>/</span>
					<Box fz='sm' w={40} ta='center'>{totalPages}</Box>
				</Group>
				<Button size='compact-sm' p={0} variant='transparent'
					onClick={() => page < totalPages && onPageChange?.(page + 1)}
				>
					<IconChevronRight color='gray' size={24} stroke={1.5} />
				</Button>
			</Group>

			<Select
				w={100}
				size='xs'
				data={pageSizeOptions || defaultPageSizeOptions}
				value={String(pageSize)}
				onChange={onPageSizeChange}
				allowDeselect={false}
			/>
		</Group>
	</Group>;
};
