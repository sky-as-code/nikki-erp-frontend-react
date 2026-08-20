import { Stack } from '@mantine/core';
import React from 'react';

import { FilterConditionRow } from './FilterConditionRow';
import {
	addAnd, addOr, ensureNonEmpty, flattenForRender, removeNode, updateCondition,
} from './filterTree';

import type { FilterConditionNode, FilterTree, FilterValidationIssue } from './filterTree';
import type { DataTableTestIds } from './testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type FilterConditionTreeProps = {
	tree: FilterTree,
	onTreeChange: (tree: FilterTree) => void,
	/** Enter in a value box: the patched tree, ready to validate and apply. */
	onSubmit: (tree: FilterTree) => void,
	issues: FilterValidationIssue[],
	fields: string[],
	modelSchema?: dyn.ModelSchema,
	translateFieldName: (field: string) => string,
	tid: DataTableTestIds,
};

/**
 * The condition list: every row of the expression, in reading order.
 *
 * All structural editing funnels through here, so the tree is normalized after each change and
 * the rows below always describe a valid expression. Which buttons a row shows is decided by
 * `flattenForRender`, not here.
 */
export function FilterConditionTree(props: FilterConditionTreeProps): React.ReactNode {
	const { tree, onTreeChange, onSubmit } = props;
	const rows = React.useMemo(() => flattenForRender(tree), [tree]);
	const issueById = React.useMemo(
		() => new Map(props.issues.map(issue => [issue.nodeId, issue.reason])),
		[props.issues],
	);

	const onPatch = React.useCallback(
		(id: string, patch: Partial<FilterConditionNode>) => onTreeChange(updateCondition(tree, id, patch)),
		[tree, onTreeChange],
	);
	// The patched tree goes up directly rather than through `onPatch` first: the panel has to
	// apply the value the user just typed, and a `setState` from this same handler would not
	// have re-rendered it into props yet.
	const onRowSubmit = React.useCallback(
		(id: string, patch: Partial<FilterConditionNode>) => onSubmit(updateCondition(tree, id, patch)),
		[tree, onSubmit],
	);
	const onAddAnd = React.useCallback((id: string) => onTreeChange(addAnd(tree, id)), [tree, onTreeChange]);
	const onAddOr = React.useCallback((id: string) => onTreeChange(addOr(tree, id)), [tree, onTreeChange]);
	// `ensureNonEmpty` after a remove: emptying the list would leave no row, and every button
	// that could add one lives *on* a row, so the panel would become a dead end.
	const onRemove = React.useCallback(
		(id: string) => onTreeChange(ensureNonEmpty(removeNode(tree, id))),
		[tree, onTreeChange],
	);

	return (
		<Stack gap='xs'>
			{rows.map((row, index) => (
				<FilterConditionRow
					key={row.node.id}
					row={row}
					index={index}
					fields={props.fields}
					modelSchema={props.modelSchema}
					translateFieldName={props.translateFieldName}
					errorReason={issueById.get(row.node.id)}
					onPatch={onPatch}
					onSubmit={onRowSubmit}
					onAddAnd={onAddAnd}
					onAddOr={onAddOr}
					onRemove={onRemove}
					tid={props.tid}
				/>
			))}
		</Stack>
	);
}
