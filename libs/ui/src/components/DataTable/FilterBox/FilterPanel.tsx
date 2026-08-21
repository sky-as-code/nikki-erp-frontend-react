import { Alert, Box, Checkbox, Divider, Group, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { FilterConditionTree } from './FilterConditionTree';
import { getFilterableFieldNames } from './filterModel';
import classes from './FilterPanel.module.css';
import { FilterSortPane } from './FilterSortPane';
import { ensureNonEmpty, validateTree } from './filterTree';
import { useTranslate } from '../../../i18n';
import { Button } from '../../Button';

import type { FilterTree, FilterValidationIssue } from './filterTree';
import type { DataTableTestIds } from '../testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type FilterPanelProps = {
	modelSchema?: dyn.ModelSchema,
	tree: FilterTree,
	onTreeChange: (tree: FilterTree) => void,
	orderBy: dyn.OrderBy,
	onOrderByChange: (orderBy: dyn.OrderBy) => void,
	sortableFields?: string[],
	/** The seeded graph nested deeper than the builder can draw; shown as a notice. */
	lossy?: boolean,
	includeArchived: boolean,
	onIncludeArchivedChange: (includeArchived: boolean) => void,
	/**
	 * Publishes the search.
	 *
	 * Takes the tree to apply, because Enter inside a value box has to apply the keystroke that
	 * triggered it — state written in that same handler is not in `props.tree` yet.
	 */
	onApply: (overrides?: { tree: FilterTree }) => void,
	onClear: () => void,
	translateFieldName: (field: string) => string,
	tid: DataTableTestIds,
};

/**
 * The expanded filter pane: conditions on the left, sort order on the right, Apply above both.
 *
 * **Two gestures publish a search, and nothing else: the Apply button, and Enter inside a
 * condition value box.** Choosing a field, changing an operator, editing the sort slots and
 * ticking "include archived" all only move local state. The panel is a composition surface —
 * a filter is a several-step thought, and re-querying midway through it shifts the result set
 * under a user who has not finished expressing what they want, and spends a request per
 * keystroke to do it.
 *
 * Apply validates first and returns early on any issue, rather than disabling the button —
 * a disabled Apply gives the user no way to find out *which* row is wrong (§29). Enter runs
 * that same path, so it cannot publish anything the button would have rejected.
 */
export function FilterPanel(props: FilterPanelProps): React.ReactNode {
	const t = useTranslate('common');
	const [issues, setIssues] = React.useState<FilterValidationIssue[]>([]);
	const filterableFields = React.useMemo(
		() => getFilterableFieldNames(props.modelSchema),
		[props.modelSchema],
	);
	const sortableFields = props.sortableFields ?? filterableFields;

	// Applying leaves the pane open. It sits above the table rather than over it, so the user
	// can see the result take effect against the conditions that produced it; closing would hide
	// the very thing they just built. The Filters button is what closes it.
	// One path for both triggers, so Enter can never apply something the button would reject.
	// `ensureNonEmpty` matches what `onTreeChange` stores, so the tree validated here is the one
	// the rows will re-render from.
	const applyTree = (next: FilterTree) => {
		const settled = ensureNonEmpty(next);
		const found = validateTree(settled);
		setIssues(found);
		if (found.length === 0) {
			props.onApply({ tree: settled });
		}
	};

	const onApply = () => applyTree(props.tree);

	// Enter carries the patched tree up from the row, so it is stored *and* applied here: the
	// row deliberately skips `onTreeChange` to avoid applying a tree one keystroke stale.
	const onSubmit = (next: FilterTree) => {
		props.onTreeChange(ensureNonEmpty(next));
		applyTree(next);
	};

	// Edits clear the errors they may have fixed: leaving them up while the user types makes the
	// panel look broken after it has already been corrected.
	const onTreeChange = (next: FilterTree) => {
		setIssues([]);
		props.onTreeChange(ensureNonEmpty(next));
	};

	return (
		<Box className={clsx('px-4 text-left', classes.panel)} {...props.tid.filterPanel()}>
			<Stack gap='sm'>
				<Group justify='flex-start'>
					<Button onClick={onApply} {...props.tid.filterApply()}>
						{t('action.apply')}
					</Button>
					<Button variant='default' onClick={props.onClear} {...props.tid.filterClear()}>
						{t('action.clearFilters')}
					</Button>
				</Group>
				{props.lossy ? (
					<Alert color='yellow' icon={<IconAlertTriangle size={16} />} p='xs'>
						{t('search.complexFilterNotice')}
					</Alert>
				) : null}
				<Divider />
				<Group align='start'>
					{/* <div className={classes.panelGrid}> */}
					<FilterConditionTree
						tree={props.tree}
						onTreeChange={onTreeChange}
						onSubmit={onSubmit}
						issues={issues}
						fields={filterableFields}
						modelSchema={props.modelSchema}
						translateFieldName={props.translateFieldName}
						tid={props.tid}
					/>
					<FilterSortPane
						orderBy={props.orderBy}
						onOrderByChange={props.onOrderByChange}
						fields={sortableFields}
						translateFieldName={props.translateFieldName}
						tid={props.tid}
					/>
					{/* </div> */}
				</Group>
				<Divider />
				{/* Local state like every other control here: it is read at Apply time, so ticking
				    it does not re-query on its own. */}
				<Checkbox
					label={t('search.includeArchived')}
					checked={props.includeArchived}
					onChange={event => props.onIncludeArchivedChange(event.currentTarget.checked)}
					{...props.tid.filterIncludeArchived()}
				/>
			</Stack>
		</Box>
	);
}
