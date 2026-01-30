/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Menu,
	MultiSelect,
	Select,
	Stack,
	Text,
	TextInput,
	SegmentedControl,
	Center,
} from '@mantine/core';
import { IconChevronDown, IconFilter, IconList, IconSearch, IconSortAscending, IconStar, IconLayoutGrid, IconList as IconListMode, IconX } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	FilterDropdownConfig,
	FilterState,
	FilterTag,
} from './types';
import { filterStateToSearchGraph, formatFilterTag } from './utils';


export type FilterViewMode = 'list' | 'compact';

export interface FilterDropdownProps {
	config: FilterDropdownConfig;
	state: FilterState;
	onStateChange: (state: FilterState) => void;
	onSearchGraphChange?: (graph: any) => void;
	opened?: boolean;
	onOpenChange?: (opened: boolean) => void;
	viewMode?: FilterViewMode;
	onViewModeChange?: (mode: FilterViewMode) => void;
	onClearFilters?: () => void; // Callback để clear tất cả filters
}


export const FilterDropdown: React.FC<FilterDropdownProps> = ({
	config,
	state,
	onStateChange,
	onSearchGraphChange,
	opened: controlledOpened,
	onOpenChange,
	onClearFilters,
}) => {
	const { t: translate } = useTranslation();
	const [internalOpened, setInternalOpened] = useState(false);
	const opened = controlledOpened !== undefined ? controlledOpened : internalOpened;
	const setOpened = onOpenChange || setInternalOpened;

	const updateState = (updates: Partial<FilterState>) => {
		const newState = { ...state, ...updates };
		onStateChange(newState);
	};

	const handleSearchChange = (key: string, value: string) => {
		const searchIndex = state.search.findIndex((s) => s.key === key);
		const newSearch = [...state.search];

		if (value.trim()) {
			if (searchIndex >= 0) {
				newSearch[searchIndex] = { ...newSearch[searchIndex], value };
			}
			else {
				const searchConfig = config.search?.find((s) => s.key === key);
				newSearch.push({
					key,
					value,
					operator: searchConfig?.operator || '~',
				});
			}
		}
		else {
			newSearch.splice(searchIndex, 1);
		}

		updateState({ search: newSearch });
	};

	const handleFilterChange = (key: string, values: (string | number | boolean)[]) => {
		const filterIndex = state.filter.findIndex((f) => f.key === key);
		const newFilter = [...state.filter];

		if (values.length > 0) {
			if (filterIndex >= 0) {
				newFilter[filterIndex] = { ...newFilter[filterIndex], values };
			}
			else {
				const filterConfig = config.filter?.find((f) => f.key === key);
				newFilter.push({
					key,
					values,
					operator: filterConfig?.operator || '=',
				});
			}
		}
		else {
			newFilter.splice(filterIndex, 1);
		}

		updateState({ filter: newFilter });
	};

	const handleGroupByChange = (keys: string[]) => {
		updateState({ groupBy: keys });
	};

	const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
		const sortIndex = state.sort.findIndex((s) => s.field === key);
		const newSort = [...state.sort];

		if (sortIndex >= 0) {
			newSort[sortIndex] = { field: key, direction };
		}
		else {
			newSort.push({ field: key, direction });
		}

		updateState({ sort: newSort });
	};

	const handleRemoveSort = (key: string) => {
		updateState({
			sort: state.sort.filter((s) => s.field !== key),
		});
	};

	const handleSaveFavorite = () => {
		if (config.favorites?.onSave) {
			// Generate search graph from current state
			const graph = filterStateToSearchGraph(state);
			const name = prompt('Nhập tên cho bộ lọc:');
			if (name) {
				config.favorites.onSave(name, graph);
			}
		}
	};

	const handleClearFilters = () => {
		if (onClearFilters) {
			onClearFilters();
		}
		else {
			updateState({
				search: [],
				filter: [],
				groupBy: [],
				sort: [],
			});
		}
	};

	// Generate tags from filter state
	const tags: FilterTag[] = useMemo(() => {
		const result: FilterTag[] = [];

		// Add search tags
		state.search.forEach((search) => {
			const searchConfig = config.search?.find((s) => s.key === search.key);
			result.push({
				type: 'search',
				key: search.key,
				label: searchConfig?.label || search.key,
				value: search.value,
				onRemove: () => {
					handleSearchChange(search.key, '');
				},
			});
		});

		// Add filter tags
		state.filter.forEach((filter) => {
			const filterConfig = config.filter?.find((f) => f.key === filter.key);
			result.push({
				type: 'filter',
				key: filter.key,
				label: filterConfig?.label || filter.key,
				value: filter.values.map(String),
				onRemove: () => {
					handleFilterChange(filter.key, []);
				},
			});
		});

		// Add groupBy tags - format as "groupBy1 > groupBy2 > ..."
		if (state.groupBy.length > 0) {
			const groupByLabels = state.groupBy.map((key) => {
				const groupByConfig = config.groupBy?.find((g) => g.key === key);
				return groupByConfig?.label || key;
			});
			result.push({
				type: 'groupBy',
				key: 'groupBy',
				label: translate('nikki.general.groupBy.title'),
				value: groupByLabels.join(' > '),
				onRemove: () => {
					updateState({ groupBy: [] });
				},
			});
		}

		// Add sort tags
		state.sort.forEach((sort) => {
			const sortConfig = config.sort?.find((s) => s.key === sort.field);
			result.push({
				type: 'filter', // Use filter type for sort tags
				key: sort.field,
				label: sortConfig?.label || sort.field,
				value: `${translate(`nikki.general.sort.${sort.direction}`)}`,
				onRemove: () => {
					handleRemoveSort(sort.field);
				},
			});
		});

		return result;
	}, [state.search, state.filter, state.groupBy, state.sort, config, translate]);

	const renderTagsSection = () => {
		if (tags.length === 0) return null;

		return (
			<Box>
				<Group justify='space-between' mb='xs' align='center'>
					<Text size='sm' fw={500}>
						{translate('nikki.general.filter.active_filters') || 'Active Filters'}
					</Text>
					<Button
						variant='subtle'
						size='xs'
						color='red'
						onClick={(e) => {
							e.stopPropagation();
							handleClearFilters();
						}}
					>
						{translate('nikki.general.actions.clear_filters')}
					</Button>
				</Group>
				<Box
					style={{
						maxHeight: 120,
						overflowY: 'auto',
						overflowX: 'hidden',
					}}
				>
					<Group gap='xs' wrap='wrap'>
						{tags.map((tag, index) => (
							<Badge
								key={`${tag.type}-${tag.key}-${index}`}
								size='sm'
								variant='light'
								color='blue'
								rightSection={
									<IconX
										size={12}
										style={{ cursor: 'pointer', marginLeft: 4 }}
										onClick={(e) => {
											e.stopPropagation();
											tag.onRemove();
										}}
									/>
								}
								style={{
									cursor: 'default',
								}}
							>
								{tag.label}: {Array.isArray(tag.value) ? tag.value.join(' or ') : tag.value}
							</Badge>
						))}
					</Group>
				</Box>
			</Box>
		);
	};

	const renderFilterSection = () => {
		if (!config.filter || config.filter.length === 0) return null;

		return (
			<Box>
				<Group gap='xs' mb='xs'>
					<IconFilter size={16} style={{ color: '#e64980' }} />
					<Text size='sm' fw={500}>
						{translate('nikki.general.filter.title')}
					</Text>
				</Group>
				<Stack gap='xs'>
					{config.filter.map((filterConfig) => {
						const filterValue = state.filter.find((f) => f.key === filterConfig.key);
						// console.debug('🚀 ~ renderFilterSection ~ filterValue:', filterValue);
						const selectedValues = filterValue?.values.map(String) || [];
						// console.debug('🚀 ~ renderFilterSection ~ selectedValues:', selectedValues);

						if (filterConfig.type === 'select' && filterConfig.options) {
							return (
								<Box
									key={filterConfig.key}
									onMouseDown={(e) => e.stopPropagation()}
								>
									<Select
										label={filterConfig.label}
										placeholder={filterConfig.label}
										data={filterConfig.options}
										value={selectedValues[0] || null}
										onChange={(value) => {
											handleFilterChange(
												filterConfig.key,
												value ? [value] : [],
											);
										}}
										size='sm'
										clearable
									/>
								</Box>
							);
						}

						if (filterConfig.type === 'multiselect' && filterConfig.options) {
							return (
								<Box
									key={filterConfig.key}
									onMouseDown={(e) => e.stopPropagation()}
								>
									<MultiSelect
										label={filterConfig.label}
										placeholder={filterConfig.label}
										data={filterConfig.options}
										value={selectedValues}
										onChange={(values) => {
											handleFilterChange(
												filterConfig.key,
												values?.map(String) || [],
											);
										}}
										size='sm'
										clearable
									/>
								</Box>
							);
						}

						// Custom component or other types
						if (filterConfig.customComponent) {
							const CustomComponent = filterConfig.customComponent;
							return (
								<CustomComponent
									key={filterConfig.key}
									value={filterValue?.values}
									onChange={(values: (string | number | boolean)[]) => {
										handleFilterChange(filterConfig.key, values);
									}}
								/>
							);
						}

						return null;
					})}
					<Button
						variant='subtle'
						size='xs'
						mt='xs'
						onClick={(e) => {
							e.stopPropagation();
							// TODO: Add custom filter
							console.log('Add custom filter');
						}}
					>
						{translate('nikki.general.filter.add_custom')}
					</Button>
				</Stack>
			</Box>
		);
	};

	const renderGroupBySection = () => {
		if (!config.groupBy || config.groupBy.length === 0) return null;

		const selectedKeys = state.groupBy;

		return (
			<Box>
				<Group gap='xs' mb='xs'>
					<IconList size={16} style={{ color: '#51cf66' }} />
					<Text size='sm' fw={500}>
						{translate('nikki.general.groupBy.title')}
					</Text>
				</Group>
				<Stack gap='xs'>
					<Box onMouseDown={(e) => e.stopPropagation()}>
						<MultiSelect
							placeholder={translate('nikki.general.groupBy.placeholder')}
							data={config.groupBy.map((g) => ({ value: g.key, label: g.label }))}
							value={selectedKeys}
							onChange={(values) => handleGroupByChange(values)}
							size='sm'
							clearable
						/>
					</Box>
					<Button
						variant='subtle'
						size='xs'
						mt='xs'
						onClick={(e) => {
							e.stopPropagation();
							// TODO: Add custom group
							console.log('Add custom group');
						}}
					>
						{translate('nikki.general.groupBy.add_custom')}
					</Button>
				</Stack>
			</Box>
		);
	};

	const renderSortSection = () => {
		if (!config.sort || config.sort.length === 0) return null;

		return (
			<Box>
				<Group gap='xs' mb='xs'>
					<IconSortAscending size={16} style={{ color: '#339af0' }} />
					<Text size='sm' fw={500}>
						{translate('nikki.general.sort.title')}
					</Text>
				</Group>
				<Stack gap='xs'>
					{config.sort.map((sortConfig) => {
						const sortValue = state.sort.find((s) => s.field === sortConfig.key);
						return (
							<Group key={sortConfig.key} gap='xs' align='flex-end'>
								<Box
									onMouseDown={(e) => e.stopPropagation()}
									style={{ flex: 1 }}
								>
									<Select
										placeholder={sortConfig.label}
										data={[
											{ value: 'asc', label: translate('nikki.general.sort.asc') },
											{ value: 'desc', label: translate('nikki.general.sort.desc') },
										]}
										value={sortValue?.direction || null}
										onChange={(value) => {
											if (value) {
												handleSortChange(sortConfig.key, value as 'asc' | 'desc');
											}
											else {
												handleRemoveSort(sortConfig.key);
											}
										}}
										size='sm'
										style={{ width: '100%' }}
										clearable
									/>
								</Box>
							</Group>
						);
					})}
				</Stack>
			</Box>
		);
	};

	const renderFavoritesSection = () => {
		if (!config.favorites) return null;

		return (
			<Box>
				<Group gap='xs' mb='xs'>
					<IconStar size={16} style={{ color: '#ffd43b' }} />
					<Text size='sm' fw={500}>
						{translate('nikki.general.favorites.title')}
					</Text>
				</Group>
				<Stack gap='xs'>
					<Button
						variant='subtle'
						size='sm'
						leftSection={<IconStar size={16} />}
						onClick={(e) => {
							e.stopPropagation();
							handleSaveFavorite();
						}}
					>
						{translate('nikki.general.favorites.save_current')}
					</Button>
					{config.favorites.savedFilters && config.favorites.savedFilters.length > 0 && (
						<Stack gap={4}>
							{config.favorites.savedFilters.map((saved) => (
								<Button
									key={saved.name}
									variant='light'
									size='xs'
									fullWidth
									justify='flex-start'
									onClick={(e) => {
										e.stopPropagation();
										// TODO: Load saved filter
										console.log('Load filter', saved.name);
									}}
								>
									{saved.name}
								</Button>
							))}
						</Stack>
					)}
				</Stack>
			</Box>
		);
	};


	return (
		<Menu
			opened={opened}
			onChange={setOpened}
			position='bottom-end'
			width={500}
			shadow='md'
			closeOnItemClick={false}
			trapFocus={false}
		>
			<Menu.Target>
				<ActionIcon
					variant={'outline'}
					color={opened ? 'blue' : 'gray'}
					size='lg'
				>
					<IconChevronDown size={16} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Box p='md' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
					<Stack gap='md'>
						{renderTagsSection()}
						{tags.length > 0 && <Divider />}
						{renderFilterSection()}
						{config.filter && config.filter.length > 0 && <Divider />}
						{renderGroupBySection()}
						{config.groupBy && config.groupBy.length > 0 && <Divider />}
						{renderSortSection()}
						{config.sort && config.sort.length > 0 && <Divider />}
						{renderFavoritesSection()}
					</Stack>
				</Box>
			</Menu.Dropdown>
		</Menu>
	);
};
