import { Group, Text, Select, Box, UnstyledButton } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconProps } from '@tabler/icons-react';
import React, { useEffect, useMemo } from 'react';
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


const PaginationButton = ({ page, type, icon, disabled, onPageChange }: {
	page: number;
	type: 'back' | 'forward';
	icon?: React.ComponentType<IconProps>;
	disabled?: boolean;
	onPageChange?: (page: number) => void;
}) => {
	const nextPage = type === 'back' ? page - 1 : page + 1;
	const handleClick = () => {
		if (disabled || !onPageChange) return;
		onPageChange(nextPage);
	};

	const IconComponent = icon || (type === 'back' ? IconChevronLeft : IconChevronRight);

	return (
		<UnstyledButton w={26} h={26} onClick={handleClick}>
			<IconComponent
				color={ disabled ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)'}
				size={26} stroke={1.5}
			/>
		</UnstyledButton>
	);
};


const PageInput = ({ totalPages, value, onPageChange }: {
	value: string | number | undefined;
	totalPages: number;
	onPageChange: (value: string | number | undefined) => void;
}) => {
	return (
		<Group gap={3} justify='center' bdrs={'sm'} bd={'solid 1px var(--mantine-color-gray-3)'}>
			<input
				style={{ width: 50, textAlign: 'center', fontSize: 'var(--mantine-font-size-sm)', border: 'none', outline: 'none' }}
				value={value}
				onChange={(e) => onPageChange(e.target.value)}
			/>
			<span>/</span>
			<Box fz='sm' w={40} ta='center'>{totalPages}</Box>
		</Group>
	);
};

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

	const handlePageChange = (targetValue: string | number | undefined) => {
		if (targetValue === '' || targetValue === undefined) {
			setPageInputValue('');
			return;
		}

		const value = Number(targetValue);
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

	useEffect(() => setPageInputValue(page), [page]);

	return <Group justify='space-between' mt='xs' px='xs'>
		<Box>
			{(totalItems || totalItems === 0) && <Text size='sm'>{translate('nikki.general.pagination.items_found', { count: totalItems })}</Text>}
		</Box>
		<Group gap={'sm'}>
			<Group gap={2} align='center'>
				<PaginationButton
					type='back' disabled={page === 1}
					page={page} onPageChange={handlePageChange}
				/>
				<PageInput totalPages={totalPages} value={pageInputValue} onPageChange={handlePageChange} />
				<PaginationButton
					type='forward' disabled={page === totalPages}
					page={page} onPageChange={handlePageChange}
				/>
			</Group>

			<Select
				w={100} size='xs'
				allowDeselect={false}
				data={pageSizeOptions || defaultPageSizeOptions}
				value={String(pageSize)}
				onChange={onPageSizeChange}
			/>
		</Group>
	</Group>;
};
