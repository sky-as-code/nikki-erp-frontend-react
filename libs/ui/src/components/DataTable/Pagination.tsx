import { Group, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { useDataTableContext } from './DataTableContext';
import { useTranslate } from '../../i18n';
import { Button } from '../Button';
import { Input } from '../Input';

import type { DataTableContextValue } from './DataTableContext';


/** The prev/next pair around the page box, reading `[<] [1]/10 [>]`. */
export function Pagination(): React.ReactNode {
	const context = useDataTableContext();
	const t = useTranslate('common');
	const searchData = context.tableSearchData;
	const totalPages = countPages(searchData.total, searchData.size);
	const paginationState = usePaginationState(context, totalPages);

	return (
		<Group gap='xs' justify='flex-end' className='flex-grow-0'>
			<Button
				onClick={paginationState.onGoPrev}
				disabled={searchData.page <= 0}
				aria-label={t('datatable.previousPage')}
				{...context.tid.pagePrev()}
			>
				<IconChevronLeft />
			</Button>
			<Input
				value={paginationState.pageInput}
				onChange={event => paginationState.setPageInput(event.currentTarget.value)}
				onBlur={paginationState.commitPageChange}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						paginationState.commitPageChange();
					}
				}}
				w={50} classNames={{ input: 'text-center' }}
				type='number'
				{...context.tid.pageInput()}
			/>
			<Text size='sm'>/</Text>
			<Text size='sm'>{totalPages}</Text>
			<Button
				onClick={paginationState.onGoNext}
				disabled={searchData.page >= totalPages - 1}
				aria-label={t('datatable.nextPage')}
				{...context.tid.pageNext()}
			>
				<IconChevronRight />
			</Button>
		</Group>
	);
}

function usePaginationState(context: DataTableContextValue, totalPages: number) {
	const searchData = context.tableSearchData;
	const [pageInput, setPageInput] = React.useState(String(searchData.page + 1));

	React.useEffect(() => {
		setPageInput(String(searchData.page + 1));
	}, [searchData.page]);

	const updateSearchPage = React.useCallback((nextPage: number) => {
		if (nextPage === searchData.page) {
			return;
		}
		setPageInput(String(nextPage + 1));
		context.setSearchRequest(prev => ({
			...prev,
			page: nextPage,
			size: searchData.size,
		}));
	}, [context, searchData.page, searchData.size]);

	const commitPageChange = React.useCallback(() => {
		const nextPage = parseUserFacingPageInput(pageInput, totalPages);
		if (nextPage === null) {
			setPageInput(String(searchData.page + 1));
			return;
		}
		updateSearchPage(nextPage);
	}, [pageInput, searchData.page, totalPages, updateSearchPage]);

	const onGoPrev = React.useCallback(() => {
		updateSearchPage(Math.max(0, searchData.page - 1));
	}, [searchData.page, updateSearchPage]);

	const onGoNext = React.useCallback(() => {
		updateSearchPage(Math.min(totalPages - 1, searchData.page + 1));
	}, [searchData.page, totalPages, updateSearchPage]);

	return { pageInput, setPageInput, commitPageChange, onGoPrev, onGoNext };
}

/**
 * How many pages `total` records fill, never fewer than one.
 *
 * Both operands are guarded because the first render happens before any response has arrived, so
 * `size` can be absent or zero — and `total / 0` is `Infinity` while `undefined / n` is `NaN`,
 * neither of which `Math.max` filters out. An empty table reads `1/1` rather than `1/NaN`.
 *
 * Exported for its unit tests.
 */
export function countPages(total: number | undefined, size: number | undefined): number {
	if (!Number.isFinite(total) || !Number.isFinite(size) || (size as number) <= 0) {
		return 1;
	}
	return Math.max(1, Math.ceil((total as number) / (size as number)));
}

/**
 * Reads the 1-based page number the user typed, or null when it is not a usable page.
 *
 * Exported for its unit tests; the component reaches it through `usePaginationState`.
 */
export function parseUserFacingPageInput(value: string, totalPages: number): number | null {
	if (!/^\d+$/.test(value.trim())) {
		return null;
	}
	const displayPage = Number(value);
	if (!Number.isInteger(displayPage)) {
		return null;
	}
	if (displayPage < 1 || displayPage > totalPages) {
		return null;
	}
	return displayPage - 1;
}
