import { Button as MantineButton, Group, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { useTranslate } from '../../i18n';
import { Button } from '../Button';
import { Input } from '../Input';

import type { ExcelDataTableContextValue } from './context';


/** A page number is digits only; an `<input type=number>` would also take `e`, signs and decimals. */
function toPageDigits(text: string): string {
	return text.replace(/\D/g, '');
}

/**
 * `[<] [1]/10 [>]`; on a compact screen only the Prev/Next pair, as one button group.
 *
 * `Alt+←`/`Alt+→` page and `Alt+P` focuses the page input. A step button disabled at a bound still
 * holds its key, so `Alt+←` on the first page does nothing rather than navigating the browser back.
 * None of these keys register while the Provider's `enableHotKeys` is off, or this part's own
 * `enableHotKeys` is: a table showing its pagination above and below keeps the keys on one copy.
 */
export function Pagination(props: { enableHotKeys?: boolean }) {
	const context = useExcelDataTableContext();
	const { data, isCompact, tid } = context;
	const enableHotKeys = props.enableHotKeys ?? context.enableHotKeys;
	const totalPages = countPages(data.total, data.size);
	const state = usePaginationState(context, totalPages);
	const prev = <StepButton direction='prev' onClick={state.onGoPrev} disabled={data.page <= 0} hotKey={enableHotKeys} />;
	const next = (
		<StepButton direction='next' onClick={state.onGoNext} disabled={data.page >= totalPages - 1} hotKey={enableHotKeys} />
	);
	if (isCompact) {
		return <MantineButton.Group>{prev}{next}</MantineButton.Group>;
	}
	return (
		<Group gap='xs' justify='flex-end' wrap='nowrap'>
			{prev}
			<Input
				value={state.pageInput}
				onChange={event => state.setPageInput(toPageDigits(event.currentTarget.value))}
				onBlur={state.commitPageChange}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						state.commitPageChange();
					}
				}}
				w={50}
				classNames={{ input: 'text-center' }}
				inputMode='numeric'
				shortcut={enableHotKeys ? 'P' : undefined}
				{...tid.pageInput()}
			/>
			<Text size='sm'>/</Text>
			<Text size='sm'>{totalPages}</Text>
			{next}
		</Group>
	);
}

type StepButtonProps = { direction: 'prev' | 'next', onClick: () => void, disabled: boolean, hotKey: boolean };

function StepButton({ direction, onClick, disabled, hotKey }: StepButtonProps) {
	const t = useTranslate('common');
	const { tid } = useExcelDataTableContext();
	const isPrev = direction === 'prev';
	const shortcut = isPrev ? 'ArrowLeft' : 'ArrowRight';
	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			shortcut={hotKey ? shortcut : undefined}
			aria-label={t(isPrev ? 'datatable.previousPage' : 'datatable.nextPage')}
			{...(isPrev ? tid.pagePrev() : tid.pageNext())}
		>
			{isPrev ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
		</Button>
	);
}

function usePaginationState(context: ExcelDataTableContextValue, totalPages: number) {
	const { data, setSearchRequest } = context;
	const [pageInput, setPageInput] = React.useState(String(data.page + 1));

	React.useEffect(() => {
		setPageInput(String(data.page + 1));
	}, [data.page]);

	const updateSearchPage = React.useCallback((nextPage: number) => {
		if (nextPage === data.page) {
			return;
		}
		setPageInput(String(nextPage + 1));
		setSearchRequest(prev => ({ ...prev, page: nextPage, size: data.size }));
	}, [data.page, data.size, setSearchRequest]);

	const commitPageChange = React.useCallback(() => {
		const nextPage = parseUserFacingPageInput(pageInput, totalPages);
		if (nextPage === null) {
			setPageInput(String(data.page + 1));
			return;
		}
		updateSearchPage(nextPage);
	}, [pageInput, data.page, totalPages, updateSearchPage]);

	const onGoPrev = React.useCallback(
		() => updateSearchPage(Math.max(0, data.page - 1)), [data.page, updateSearchPage],
	);
	const onGoNext = React.useCallback(
		() => updateSearchPage(Math.min(totalPages - 1, data.page + 1)), [data.page, totalPages, updateSearchPage],
	);

	return { pageInput, setPageInput, commitPageChange, onGoPrev, onGoNext };
}

/** How many pages `total` records fill, never fewer than one; guards the pre-response render. */
export function countPages(total: number | undefined, size: number | undefined): number {
	if (!Number.isFinite(total) || !Number.isFinite(size) || (size as number) <= 0) {
		return 1;
	}
	return Math.max(1, Math.ceil((total as number) / (size as number)));
}

/** The 1-based page number the user typed, or null when it is not a usable page. */
export function parseUserFacingPageInput(value: string, totalPages: number): number | null {
	if (!/^\d+$/.test(value.trim())) {
		return null;
	}
	const displayPage = Number(value);
	if (displayPage < 1 || displayPage > totalPages) {
		return null;
	}
	return displayPage - 1;
}
