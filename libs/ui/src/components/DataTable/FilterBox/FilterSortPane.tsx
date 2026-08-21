import { ButtonGroup, Group, Stack, Text } from '@mantine/core';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import React from 'react';

import classes from './FilterPanel.module.css';
import { TranslateFn, useTranslate } from '../../../i18n';
import { Button } from '../../Button';
import { Select } from '../../Select';

import type { DataTableTestIds } from '../testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** Distinguishes the two otherwise-identical sort rows. */
type SortRank = 'primary' | 'secondary';

const SORT_RANKS: readonly SortRank[] = ['primary', 'secondary'];

export type FilterSortPaneProps = {
	orderBy: dyn.OrderBy,
	onOrderByChange: (orderBy: dyn.OrderBy) => void,
	/** Sortable fields, which are not always the filterable ones. */
	fields: string[],
	translateFieldName: (field: string) => string,
	tid: DataTableTestIds,
};

/**
 * The "Sort by" column: two persistent slots, each a field dropdown with direction buttons.
 *
 * Two fixed rows rather than an add/remove list, matching `SearchBox`: the backend applies
 * `order` as a tie-break chain, and a primary plus one tie-breaker covers what a list view
 * actually needs. Persistent rows also mean the controls are visible before anything is chosen,
 * so sorting does not start behind an "Add sort" click.
 *
 * The empty option in each dropdown is what clears that slot — there is no separate remove
 * button, because a slot is never absent, only unset.
 */
export function FilterSortPane(props: FilterSortPaneProps): React.ReactNode {
	const t = useTranslate('common');
	const { orderBy, onOrderByChange } = props;

	const setSlot = React.useCallback((index: number, entry: [string, dyn.SearchOrder] | null) => {
		const slots: Array<[string, dyn.SearchOrder] | null> = [orderBy[0] ?? null, orderBy[1] ?? null];
		slots[index] = entry;
		// Compacted, so clearing the primary promotes the secondary rather than leaving a hole
		// the backend would read as the secondary being primary anyway.
		onOrderByChange(slots.filter((slot): slot is [string, dyn.SearchOrder] => slot !== null));
	}, [orderBy, onOrderByChange]);

	return (
		<Stack gap='xs'>
			<Text fw={600} size='sm'>{t('search.sortBy')}</Text>
			{SORT_RANKS.map((rank, index) => (
				<SortSlotRow
					key={rank}
					rank={rank}
					index={index}
					entry={orderBy[index]}
					// The other slot's field, so the same column cannot be chosen twice: the
					// backend honours the first and ignores the duplicate.
					excludeField={orderBy[index === 0 ? 1 : 0]?.[0]}
					fields={props.fields}
					translateFieldName={props.translateFieldName}
					onChange={setSlot}
					t={t}
					tid={props.tid}
				/>
			))}
		</Stack>
	);
}

type SortSlotRowProps = {
	rank: SortRank,
	index: number,
	entry: [string, dyn.SearchOrder] | undefined,
	excludeField: string | undefined,
	fields: string[],
	translateFieldName: (field: string) => string,
	onChange: (index: number, entry: [string, dyn.SearchOrder] | null) => void,
	t: TranslateFn,
	tid: DataTableTestIds,
};

function SortSlotRow(props: SortSlotRowProps): React.ReactNode {
	const { entry, index, onChange, t } = props;
	const field = entry?.[0] ?? '';
	// Shown as ascending while unset, so the pair always reads as a valid state; the buttons are
	// disabled until a field is chosen, so it cannot be acted on.
	const direction = entry?.[1] ?? 'asc';

	const options = React.useMemo(() => [
		{ value: '', label: `- ${t('search.chooseField')} -` },
		...props.fields
			.filter(name => name !== props.excludeField)
			.map(name => ({ value: name, label: props.translateFieldName(name) })),
	], [props.fields, props.excludeField, props.translateFieldName, t]);

	const onFieldChange = (next: string | null) => {
		onChange(index, next ? [next, direction] : null);
	};
	const onDirectionChange = (next: dyn.SearchOrder) => {
		if (field) {
			onChange(index, [field, next]);
		}
	};

	return (
		<Group gap={4} wrap='nowrap' className={classes.sortRow}>
			<Select
				data={options}
				value={field}
				onChange={onFieldChange}
				searchable
				allowDeselect={false}
				className={classes.sortField}
				{...props.tid.filterSortField(index)}
			/>
			<ButtonGroup>
				<Button
					variant={field && direction === 'asc' ? 'filled' : 'default'}
					disabled={!field}
					onClick={() => onDirectionChange('asc')}
					aria-label={t('search.sortAscending')}
					{...props.tid.filterSortDirection(index, 'asc')}
				>
					<IconSortAscending size={14} />
				</Button>
				<Button
					variant={field && direction === 'desc' ? 'filled' : 'default'}
					disabled={!field}
					onClick={() => onDirectionChange('desc')}
					aria-label={t('search.sortDescending')}
					{...props.tid.filterSortDirection(index, 'desc')}
				>
					<IconSortDescending size={14} />
				</Button>
			</ButtonGroup>
		</Group>
	);
}

