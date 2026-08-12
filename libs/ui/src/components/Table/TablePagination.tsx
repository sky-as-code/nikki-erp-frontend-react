import { Group, Text, Select, Box, UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
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
	/** `{module}.{component}` prefix for these controls. */
	testId?: string;
}

const DEFAULT_PAGE_SIZE = '10';
const DEFAULT_TOTAL_PAGES = 1;


const PaginationButton = ({ page, type, icon, disabled, onPageChange, testId }: {
	page: number;
	type: 'back' | 'forward';
	icon?: React.ComponentType<IconProps>;
	disabled?: boolean;
	onPageChange?: (page: number) => void;
	testId?: string;
}) => {
	const nextPage = type === 'back' ? page - 1 : page + 1;
	const handleClick = () => {
		if (disabled || !onPageChange) return;
		onPageChange(nextPage);
	};

	const IconComponent = icon || (type === 'back' ? IconChevronLeft : IconChevronRight);
	const element = type === 'back' ? 'pagePrev' : 'pageNext';

	return (
		<UnstyledButton w={26} h={26} onClick={handleClick} {...testAttrs(testId, element)}>
			<IconComponent
				color={ disabled ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-7)'}
				size={26} stroke={1.5}
			/>
		</UnstyledButton>
	);
};


const PageInput = ({ totalPages, value, onPageChange, testId }: {
	value: string | number | undefined;
	totalPages: number;
	onPageChange: (value: string | number | undefined) => void;
	testId?: string;
}) => {
	return (
		<Group gap={3} justify='center' bdrs={'sm'} bd={'solid 1px var(--mantine-color-gray-3)'}>
			<input
				style={{ width: 50, textAlign: 'center', fontSize: 'var(--mantine-font-size-sm)', border: 'none', outline: 'none' }}
				value={value}
				onChange={(e) => onPageChange(e.target.value)}
				{...testAttrs(testId, 'pageInput')}
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
	testId,
}) => {
	const { t: translate } = useTranslation();
	const prefix = testId ?? 'ui.tablePagination';
	// `pagination.size` / `pagination.itemsFound` are the keys that actually exist in the
	// `common` namespace; the former `nikki.general.pagination.*` names resolved to nothing
	// and rendered raw key strings.
	const defaultPageSizeOptions = useMemo(() => [
		{ value: '5', label: translate('pagination.size', { count: 5 }) },
		{ value: '10', label: translate('pagination.size', { count: 10 }) },
		{ value: '20', label: translate('pagination.size', { count: 20 }) },
		{ value: '50', label: translate('pagination.size', { count: 50 }) },
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
			{(totalItems || totalItems === 0) && <Text size='sm'>{translate('pagination.itemsFound', { count: totalItems })}</Text>}
		</Box>
		<Group gap={'sm'}>
			<Group gap={2} align='center'>
				<PaginationButton
					type='back' disabled={page === 1} testId={prefix}
					page={page} onPageChange={handlePageChange}
				/>
				<PageInput
					totalPages={totalPages} value={pageInputValue}
					onPageChange={handlePageChange} testId={prefix}
				/>
				<PaginationButton
					type='forward' disabled={page === totalPages} testId={prefix}
					page={page} onPageChange={handlePageChange}
				/>
			</Group>

			<Select
				w={100} size='xs'
				allowDeselect={false}
				data={pageSizeOptions || defaultPageSizeOptions}
				value={String(pageSize)}
				onChange={onPageSizeChange}
				{...testAttrs(prefix, 'pageSize')}
			/>
		</Group>
	</Group>;
};
