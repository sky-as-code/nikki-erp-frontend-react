import {
	ActionIcon, Box, Button, ButtonGroup, Checkbox, Divider, Group, Modal, Paper, Pill, Select,
	Stack, TagsInput, Text, UnstyledButton,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import {
	IconChevronDown, IconChevronUp, IconFilter, IconSearch, IconSortAscending, IconSortDescending,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './SearchBox.module.css';
import { TranslateFn, useTranslate } from '../../i18n';


export type SearchBoxProps = {
	fields: string[],
	sortableFields: string[],
	orderBy?: dyn.OrderBy,
	onApplyOrderBy?: (orderBy: dyn.OrderBy) => void,
};

export function SearchBox({ fields, sortableFields, orderBy, onApplyOrderBy }: SearchBoxProps): React.ReactNode {
	const [expanded, setExpanded] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState('');
	const [customFilterOpen, setCustomFilterOpen] = React.useState(false);
	const [filters, setFilters] = React.useState(defaultFilters);
	const t = useTranslate('common');
	const options = React.useMemo(() => {
		const sourceFields = sortableFields.length > 0 ? sortableFields : fields;
		return buildFieldOptions(sourceFields, t);
	}, [fields, sortableFields]);
	const sortByState = useSortByState(orderBy, onApplyOrderBy, () => setExpanded(false));
	const openCustomFilters = () => {
		setExpanded(false);
		setCustomFilterOpen(true);
	};

	return (
		<Box className='relative grow basis-0 text-right'>
			<Box className={clsx('inline-block rounded-md border px-2 py-1 shadow-sm', classes.searchBoxInner)}>
				<FilterTagsInput
					filters={filters}
					setFilters={setFilters}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					rightSection={<ActionIcon
						variant='light'
						size='sm'
						onClick={() => setExpanded(prev => !prev)}
						aria-label={expanded ? t('search.collapseSearchOptions') : t('search.expandSearchOptions')}
					>
						{expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
					</ActionIcon>}
				/>
			</Box>

			{expanded ? (
				<ExpandedPanel
					fieldOptions={options}
					firstSortField={sortByState.firstSortField}
					firstSortDirection={sortByState.firstSortDirection}
					onFirstSortFieldChange={sortByState.onFirstSortFieldChange}
					onFirstSortDirectionChange={sortByState.onFirstSortDirectionChange}
					secondSortField={sortByState.secondSortField}
					secondSortDirection={sortByState.secondSortDirection}
					onSecondSortFieldChange={sortByState.onSecondSortFieldChange}
					onSecondSortDirectionChange={sortByState.onSecondSortDirectionChange}
					onApply={sortByState.onApply}
					onDiscard={() => setExpanded(false)}
					onOpenCustomFilter={openCustomFilters}
				/>
			) : null}
			<CustomFilterDialog opened={customFilterOpen} onClose={() => setCustomFilterOpen(false)} />
		</Box>
	);
}

const defaultFilters = ['Goods or Combo or Services', 'Name does not contain rein'];

const sortSelectComboboxProps = { width: 250, position: 'bottom-start' as const };
const sortSelectStyles = {
	input: { height: '2rem', minHeight: '2rem', width: '200px' },
};

function buildFieldOptions(fields: string[], t: TranslateFn) {
	return [{ value: '', label: `- ${t('form.selectOnePrompt', { item: 'field' })} -` }, ...fields.map(field => ({ value: field, label: field }))];
}

function buildOrderByFromFields(
	firstField: string,
	firstDir: dyn.SearchOrder | '',
	secondField: string,
	secondDir: dyn.SearchOrder | '',
): dyn.OrderBy {
	const seen = new Set<string>();
	const order: dyn.OrderBy = [];
	const push = (field: string, dir: dyn.SearchOrder | '') => {
		if (!field || seen.has(field)) return;
		seen.add(field);
		order.push([field, dir || 'asc']);
	};
	push(firstField, firstDir);
	push(secondField, secondDir);
	return order;
}

function useSortByState(
	orderBy: dyn.OrderBy | undefined,
	onApplyOrderBy: ((orderBy: dyn.OrderBy) => void) | undefined,
	onApplied: () => void,
) {
	const [firstSortField, setFirstSortField] = React.useState('');
	const [firstSortDirection, setFirstSortDirection] = React.useState<dyn.SearchOrder | ''>('');
	const [secondSortField, setSecondSortField] = React.useState('');
	const [secondSortDirection, setSecondSortDirection] = React.useState<dyn.SearchOrder | ''>('');
	React.useEffect(() => {
		const primary = orderBy?.[0];
		const secondary = orderBy?.[1];
		if (!primary) {
			setFirstSortField('');
			setFirstSortDirection('');
			setSecondSortField('');
			setSecondSortDirection('');
			return;
		}
		setFirstSortField(primary[0]);
		setFirstSortDirection(primary[1]);
		if (!secondary) {
			setSecondSortField('');
			setSecondSortDirection('');
			return;
		}
		setSecondSortField(secondary[0]);
		setSecondSortDirection(secondary[1]);
	}, [orderBy]);
	const onFirstSortFieldChange = (fieldName: string | null) => {
		const next = fieldName ?? '';
		setFirstSortField(next);
		if (!next) {
			setFirstSortDirection('');
			setSecondSortField('');
			setSecondSortDirection('');
			return;
		}
		setFirstSortDirection(d => d || 'asc');
	};
	const onSecondSortFieldChange = (fieldName: string | null) => {
		const next = fieldName ?? '';
		setSecondSortField(next);
		if (!next) {
			setSecondSortDirection('');
			return;
		}
		setSecondSortDirection(d => d || 'asc');
	};
	const onApply = () => {
		const nextOrderBy = buildOrderByFromFields(
			firstSortField, firstSortDirection, secondSortField, secondSortDirection,
		);
		onApplyOrderBy?.(nextOrderBy);
		onApplied();
	};
	return {
		firstSortField,
		firstSortDirection,
		secondSortField,
		secondSortDirection,
		onFirstSortFieldChange,
		onFirstSortDirectionChange: setFirstSortDirection,
		onSecondSortFieldChange,
		onSecondSortDirectionChange: setSecondSortDirection,
		onApply,
	};
}

type FieldOption = { value: string, label: string };

type ExpandedPanelProps = {
	fieldOptions: FieldOption[],
	firstSortField: string,
	firstSortDirection: dyn.SearchOrder | '',
	onFirstSortFieldChange: (fieldName: string | null) => void,
	onFirstSortDirectionChange: (direction: dyn.SearchOrder | '') => void,
	secondSortField: string,
	secondSortDirection: dyn.SearchOrder | '',
	onSecondSortFieldChange: (fieldName: string | null) => void,
	onSecondSortDirectionChange: (direction: dyn.SearchOrder | '') => void,
	onApply: () => void,
	onDiscard: () => void,
	onOpenCustomFilter: () => void,
};

function ExpandedPanel({
	fieldOptions,
	firstSortField,
	firstSortDirection,
	onFirstSortFieldChange,
	onFirstSortDirectionChange,
	secondSortField,
	secondSortDirection,
	onSecondSortFieldChange,
	onSecondSortDirectionChange,
	onApply,
	onDiscard,
	onOpenCustomFilter,
}: ExpandedPanelProps): React.ReactNode {
	const t = useTranslate('common');
	return (
		<Paper p='md' withBorder shadow='xs'
			className='absolute right-0 top-[calc(100%+4px)] z-[300] text-left'
		>
			<Group align='flex-start'>
				<QuickFiltersColumn onOpenCustomFilter={onOpenCustomFilter} />
				<Stack gap='xs' w={290}>
					<Text fw={600}>{t('search.sortBy')}</Text>
					<SortFieldDirectionRow
						fieldOptions={fieldOptions}
						selectedField={firstSortField}
						selectedDirection={firstSortDirection}
						onFieldChange={onFirstSortFieldChange}
						onDirectionChange={onFirstSortDirectionChange}
					/>
					<SortFieldDirectionRow
						fieldOptions={fieldOptions}
						selectedField={secondSortField}
						selectedDirection={secondSortDirection}
						onFieldChange={onSecondSortFieldChange}
						onDirectionChange={onSecondSortDirectionChange}
					/>
				</Stack>
			</Group>

			<Group justify='flex-end' mt='md'>
				<Button variant='default' onClick={onDiscard}>{t('action.discard')}</Button>
				<Button onClick={onApply}>{t('action.apply')}</Button>
			</Group>
		</Paper>
	);
}

function QuickFiltersColumn({ onOpenCustomFilter }: { onOpenCustomFilter: () => void }): React.ReactNode {
	const t = useTranslate('common');
	return (
		<Stack gap='xs' w={160}>
			<Text fw={600}>{t('search.filterPresets')}</Text>
			<Button variant='subtle' justify='flex-start'>Filter 1</Button>
			<Button variant='subtle' justify='flex-start'>Filter 2</Button>
			<Checkbox label='Include archive' />
			<Divider />
			<UnstyledButton onClick={onOpenCustomFilter}>
				<Text c='blue.7'>{t('search.customFilters')}</Text>
			</UnstyledButton>
		</Stack>
	);
}

type SortFieldDirectionRowProps = {
	fieldOptions: FieldOption[],
	selectedField: string,
	selectedDirection: dyn.SearchOrder | '',
	onFieldChange: (fieldName: string | null) => void,
	onDirectionChange: (direction: dyn.SearchOrder | '') => void,
};

function SortFieldDirectionRow({
	fieldOptions,
	selectedField,
	selectedDirection,
	onFieldChange,
	onDirectionChange,
}: SortFieldDirectionRowProps): React.ReactNode {
	const dirDisabled = !selectedField;
	const effectiveDir = selectedDirection || 'asc';
	return (
		<Group gap={1} justify='space-between'>
			<Select
				data={fieldOptions}
				value={selectedField}
				onChange={onFieldChange}
				comboboxProps={sortSelectComboboxProps}
				size='md'
				styles={sortSelectStyles}
			/>
			<SortDirectionButtonGroup
				disabled={dirDisabled}
				activeDirection={effectiveDir}
				onDirectionChange={onDirectionChange}
			/>
		</Group>
	);
}

type SortDirectionButtonGroupProps = {
	disabled: boolean,
	activeDirection: dyn.SearchOrder,
	onDirectionChange: (direction: dyn.SearchOrder) => void,
};

function SortDirectionButtonGroup({
	disabled,
	activeDirection,
	onDirectionChange,
}: SortDirectionButtonGroupProps): React.ReactNode {
	const t = useTranslate('common');
	return (
		<ButtonGroup>
			<Button
				variant={activeDirection === 'asc' ? 'primary' : 'outline'}
				size='compact-md'
				disabled={disabled}
				onClick={() => onDirectionChange('asc')}
				aria-label={t('search.sortAscending')}
			>
				<IconSortAscending size={16} />
			</Button>
			<Button
				variant={activeDirection === 'desc' ? 'primary' : 'outline'}
				size='compact-md'
				disabled={disabled}
				onClick={() => onDirectionChange('desc')}
				aria-label={t('search.sortDescending')}
			>
				<IconSortDescending size={16} />
			</Button>
		</ButtonGroup>
	);
}

function CustomFilterDialog({
	opened,
	onClose,
}: {
	opened: boolean,
	onClose: () => void,
}): React.ReactNode {
	const t = useTranslate('common');
	return (
		<Modal opened={opened} onClose={onClose} title={t('search.customFilter')} centered>
			<Stack gap='md'>
				<Text>{t('search.matchAnyOfTheseConditions')}</Text>
				<Box h={120} />
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>{t('action.discard')}</Button>
					<Button onClick={() => {}}>{t('action.apply')}</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

type FilterTagsInputProps = {
	filters: string[],
	setFilters: (items: string[]) => void,
	searchValue: string,
	setSearchValue: (value: string) => void,
	rightSection?: React.ReactNode,
};

function FilterTagsInput({
	filters, setFilters,
	searchValue, setSearchValue,
	rightSection,
}: FilterTagsInputProps): React.ReactNode {
	const nextVersionProps = {
		renderPill: ({ value, onRemove }: { value: string, onRemove?: () => void }) => (
			<Pill withRemoveButton onRemove={onRemove} style={{ minWidth: 150, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
				<Group gap={4} wrap='nowrap'>
					<IconFilter size={14} />
					<span className={classes.pillText}>{value}</span>
				</Group>
			</Pill>
		),
	} as any;
	return (
		<TagsInput
			value={filters}
			onChange={setFilters}
			searchValue={searchValue}
			onSearchChange={setSearchValue}
			placeholder='Search...'
			leftSection={<IconSearch size={14} />}
			rightSection={rightSection}
			variant='unstyled'
			{...nextVersionProps}
		/>
	);
}
