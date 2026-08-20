import { ButtonGroup, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconSettings } from '@tabler/icons-react';
import React from 'react';

import { Button } from '../Button';
import { Input } from '../Input';
import { useDataTableContext } from './DataTableContext';

import type { DataTableContextValue } from './DataTableContext';


/** The page box, the prev/next pair, and the view-settings button, right-aligned. */
export function Pagination(): React.ReactNode {
	const context = useDataTableContext();
	const searchData = context.tableSearchData;
	const totalPages = Math.max(1, Math.ceil(searchData.total / searchData.size));
	const paginationState = usePaginationState(context, totalPages);

	return (
		<Group gap='xs' justify='flex-end' className='flex-grow-0'>
			<span>Page</span>
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
			<span>of {totalPages}</span>
			<ButtonGroup>
				<Button
					onClick={paginationState.onGoPrev}
					disabled={searchData.page <= 0}
					aria-label='Go to previous page'
					{...context.tid.pagePrev()}
				>
					<IconChevronLeft />
				</Button>
				<Button
					onClick={paginationState.onGoNext}
					disabled={searchData.page >= totalPages - 1}
					aria-label='Go to next page'
					{...context.tid.pageNext()}
				>
					<IconChevronRight />
				</Button>
			</ButtonGroup>
			<Button
				onClick={context.onOpenViewSettings}
				{...context.tid.settingsOpen()}
			>
				<IconSettings />
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
