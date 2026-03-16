/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Card, Flex, Group, Loader, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { FileActionMenu } from '@/features/files/components';
import { DriveFileFilterBar, type DriveFileFilterState } from '@/features/files/components/filters/DriveFileFilterBar';
import { fileService } from '@/features/files/fileService';
import { useDriveFileActions, useMinimumLoading } from '@/features/files/hooks';
import { useOrgModulePath } from '@/hooks/useRootPath';

import type { DriveFile } from '@/features/files/types';


type DriveSearchResultsPaneProps = {
	query: string;
	results: DriveFile[];
	total: number;
	loading: boolean;
	showLoading: boolean;
	error: string | null;
	filters: DriveFileFilterState;
	onFiltersChange: (next: DriveFileFilterState) => void;
	isOpen: boolean;
	isHoveringPane: boolean;
	setIsHoveringPane: (value: boolean) => void;
	searchInputRef: React.RefObject<HTMLInputElement | null>;
	onViewAll: () => void;
};

function buildGraph(queryText: string, currentFilters: DriveFileFilterState): Record<string, unknown> {
	const and: any[] = [
		{ if: ['status', '!=', 'in-trash'] },
		{ if: ['name', '*', queryText.trim()] },
	];

	if (currentFilters.statuses.length > 0) {
		and.push({
			if: ['status', 'in', currentFilters.statuses],
		});
	}

	if (currentFilters.visibilities.length > 0) {
		and.push({
			if: ['visibility', 'in', currentFilters.visibilities],
		});
	}

	if (currentFilters.isFolderValues.length === 1) {
		const wantFolder = currentFilters.isFolderValues[0] === 'folder';
		and.push({
			if: ['is_folder', '=', wantFolder],
		});
	}

	const order: any[] = [];

	if (currentFilters.folderFirst) {
		order.push(['is_folder', 'desc']);
	}

	const field = currentFilters.sortField === 'name' ? 'name' : 'created_at';
	order.push([field, currentFilters.sortDirection]);

	return {
		and,
		order,
	};
}

function DriveSearchResultsPane({
	query,
	results,
	total,
	loading,
	showLoading,
	error,
	filters,
	onFiltersChange,
	isOpen,
	setIsHoveringPane,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	searchInputRef,
	onViewAll,
}: DriveSearchResultsPaneProps): React.ReactNode {
	const { t } = useTranslation();
	if (!isOpen) {
		return null;
	}

	return (
		<Card
			p='xs'
			pos='absolute'
			mt='xs'
			w='100%'
			shadow='xl'
			withBorder
			style={{
				zIndex: 20,
				// shadow đều các hướng, mềm hơn (giảm 1/2 so với trước)
				boxShadow:
					'0 9px 20px rgba(15, 23, 42, 0.28), 0 -3px 9px rgba(15, 23, 42, 0.14), 6px 0 12px rgba(15, 23, 42, 0.18), -6px 0 12px rgba(15, 23, 42, 0.18)',
			}}
			onMouseEnter={() => setIsHoveringPane(true)}
			onMouseLeave={() => {
				setIsHoveringPane(false);
			}}
		>
			<Stack gap='xs'>
				<DriveFileFilterBar
					value={filters}
					onChange={onFiltersChange}
					// search bar áp dụng filter ngay khi thay đổi, không cần nút Apply riêng
					onApply={() => { }}
					applyOnChange={true}
				/>
				{showLoading ? (
					<Flex
						align='center'
						justify='center'
						py='sm'
					>
						<Loader size='sm' />
					</Flex>
				) : (
					<>
						{!error && results.length > 0 && (
							<Stack gap='xs'>
								{results.map((file) => (
									<SearchResultItem key={file.id} file={file} />
								))}
							</Stack>
						)}
						{!error && results.length === 0 && query.trim() && (
							<Text
								size='sm'
								fw={500}
								c='dimmed'
								ta='center'
							>
								{t('nikki.drive.search.noResults')}
							</Text>
						)}
						{!loading && error && (
							<Text size='sm' c='red'>
								{error}
							</Text>
						)}
					</>
				)}
				{/* khu vực nút "View all" luôn giữ chỗ để tránh giật layout */}
				<Group justify='flex-end' pt='xs' mih={28}>
					<Button
						size='xs'
						variant='filled'
						disabled={loading || !query.trim() || total === 0 || total <= 5}
						onClick={onViewAll}
					>
						{query.trim()
							? t('nikki.drive.search.viewAllWithCount', { count: total })
							: t('nikki.drive.search.viewAll')}
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

export const DriveSearchBar: React.FC = () => {
	const searchInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const rootPath = useOrgModulePath();
	const [inputValue, setInputValue] = useState('');
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<DriveFile[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [isHoveringPane, setIsHoveringPane] = useState(false);
	const [filters, setFilters] = useState<DriveFileFilterState>({
		statuses: [],
		visibilities: [],
		isFolderValues: [],
		sortField: 'name',
		sortDirection: 'asc',
		folderFirst: true,
	});

	const debouncedSetQuery = useMemo(
		() =>
			debounce((value: string) => {
				setQuery(value);
			}, 300),
		[],
	);

	useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

	const showLoading = useMinimumLoading(loading, 300);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setTotal(0);
			setError(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);
		(async () => {
			try {
				const graph = buildGraph(query, filters);
				const res = await fileService.searchDriveFile({
					page: 0,
					size: 5,
					graph,
				});
				if (!cancelled) {
					const items = res.items ?? [];
					setResults(items);
					setTotal(res.total ?? items.length);
				}
			}
			catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : 'Failed to search files');
					setResults([]);
					setTotal(0);
				}
			}
			finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [query, filters]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	const appendFilterParams = (params: URLSearchParams, currentFilters: DriveFileFilterState) => {
		if (currentFilters.statuses.length > 0) {
			params.set('status', currentFilters.statuses.join(','));
		}
		if (currentFilters.visibilities.length > 0) {
			params.set('visibility', currentFilters.visibilities.join(','));
		}
		if (currentFilters.isFolderValues.length > 0) {
			params.set('type', currentFilters.isFolderValues.join(','));
		}
		if (currentFilters.sortField) {
			params.set('sortField', currentFilters.sortField);
		}
		if (currentFilters.sortDirection) {
			params.set('sortDirection', currentFilters.sortDirection);
		}
		if (currentFilters.folderFirst !== undefined) {
			params.set('folderFirst', currentFilters.folderFirst ? '1' : '0');
		}
	};

	// Đóng pane khi click ra ngoài (không phải input hoặc pane)
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!containerRef.current) return;
			// Nếu click nằm trong dropdown combobox (render qua portal) thì không đóng pane
			const el = target as HTMLElement;
			if (
				el.closest('[data-combobox-dropdown]') ||
				el.closest('[data-mantine-combobox-dropdown]') ||
				el.closest('[role="listbox"]')
			) {
				return;
			}
			if (!containerRef.current.contains(target)) {
				setIsFocused(false);
				setIsHoveringPane(false);
			}
		};

		window.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<Box
			ref={containerRef}
			pos='relative'
			h='fit-content'
			w={'100%'}
			bdrs={'md'}
		>
			<Card
				p='0px'
				withBorder
				style={{
					boxShadow: isFocused
						? '0 9px 20px rgba(15, 23, 42, 0.28), 0 -3px 9px rgba(15, 23, 42, 0.14), 6px 0 12px rgba(15, 23, 42, 0.18), -6px 0 12px rgba(15, 23, 42, 0.18)'
						: 'none',
				}}
			>
				<TextInput
					ref={searchInputRef}
					size='md'
					w='100%'
					variant='unstyled'
					bd='1px solid var(--mantine-color-gray-3)'
					style={{ overflow: 'hidden' }}
					placeholder='Search files and folders... (Ctrl + K)'
					leftSection={<IconSearch size={16} />}
					value={inputValue}
					onChange={(e) => {
						const value = e.currentTarget.value;
						setInputValue(value);
						debouncedSetQuery(value);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							const trimmed = query.trim();
							// chỉ navigate khi có query và có nhiều hơn page size kết quả
							if (!trimmed || total === 0 || total <= 5) return;
							const params = new URLSearchParams();
							params.set('q', trimmed);
							appendFilterParams(params, filters);
							navigate(`${rootPath}/management/search-result?${params.toString()}`);
						}
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => {
						// chỉ đóng pane nếu không hover trong pane
						if (!isHoveringPane) {
							setIsFocused(false);
						}
					}}
				/>
			</Card>
			<DriveSearchResultsPane
				query={query}
				results={results}
				total={total}
				loading={loading}
				showLoading={showLoading}
				error={error}
				filters={filters}
				onFiltersChange={setFilters}
				// luôn mở pane khi ô search focus hoặc đang hover pane,
				// kể cả khi chưa nhập query (hiển thị chỉ phần filter + trạng thái)
				isOpen={isFocused || isHoveringPane}
				isHoveringPane={isHoveringPane}
				setIsHoveringPane={setIsHoveringPane}
				searchInputRef={searchInputRef}
				onViewAll={() => {
					if (!query.trim()) return;
					const params = new URLSearchParams();
					params.set('q', query.trim());
					appendFilterParams(params, filters);
					navigate(`${rootPath}/management/search-result?${params.toString()}`);
				}}
			/>
		</Box>
	);
};

function SearchResultItem({ file }: { file: DriveFile }): React.ReactNode {
	const { openFolder, previewFile } = useDriveFileActions(file);

	const handleClick = () => {
		if (file.isFolder) {
			openFolder();
		}
		else {
			previewFile();
		}
	};

	return (
		<Box
			onClick={handleClick}
			p='xs'
			bdrs='sm'
			style={{
				cursor: 'pointer',
				transition: 'background-color 120ms ease-in-out',
			}}
			// sử dụng token mặc định để hợp theme light/dark
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--mantine-color-default-hover)';
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
			}}
		>
			<Flex
				align='center'
				justify='space-between'
				gap='xs'
			>
				<Box maw='75%'>
					<Text size='sm' fw={500} lineClamp={1}>
						{file.name}
					</Text>
					<Group gap={6}>
						<Badge
							size='xs'
							variant='light'
							color={file.isFolder ? 'blue' : 'gray'}
							radius='sm'
						>
							{file.isFolder ? 'Folder' : 'File'}
						</Badge>
						<Text size='xs' c='dimmed' lineClamp={1}>
							{file.id}
						</Text>
					</Group>
				</Box>
				<Box
					onClick={(e) => e.stopPropagation()}
				>
					<FileActionMenu file={file} />
				</Box>
			</Flex>
		</Box>
	);
}
