import { ActionIcon, Box, Group, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import {
	getEnumOptions, getFilterInputKind, getOperatorsForKind, isMultiValueOperator,
	operatorLabelKey,
} from './filterModel';
import { Button } from '../Button';
import { Select } from '../Select';
import classes from './FilterPanel.module.css';
import { applyFieldChange, applyOperatorChange } from './filterTree';
import { FilterValueInput, isKeyboardCommitKind, shouldHideValueInput } from './FilterValueInput';
import { useTranslate } from '../../i18n';

import type { FilterConditionNode, FilterRenderRow } from './filterTree';
import type { DataTableTestIds } from './testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type FilterConditionRowProps = {
	row: FilterRenderRow,
	/** Position in the flattened render list; test ids index by it. */
	index: number,
	fields: string[],
	modelSchema?: dyn.ModelSchema,
	translateFieldName: (field: string) => string,
	errorReason?: 'noField' | 'noValue',
	onPatch: (id: string, patch: Partial<FilterConditionNode>) => void,
	/**
	 * Enter inside the value box: patch this condition and apply in the same gesture.
	 *
	 * Separate from `onPatch` because the apply has to see the patched tree. The state write
	 * from `onPatch` has not landed when the keystroke's handler runs, so the panel above
	 * computes the next tree itself and applies that, rather than the props it still holds.
	 */
	onSubmit: (id: string, patch: Partial<FilterConditionNode>) => void,
	onAddAnd: (id: string) => void,
	onAddOr: (id: string) => void,
	onRemove: (id: string) => void,
	tid: DataTableTestIds,
};

/**
 * One line of the builder: field, operator, value, and the buttons that grow the expression.
 *
 * Shared by root-level rows and OR branches — the difference between them is entirely in the
 * `row` flags the tree produced, so this component holds no structural knowledge of its own.
 */
export function FilterConditionRow(props: FilterConditionRowProps): React.ReactNode {
	const { row } = props;
	return (
		<Box className={clsx(row.isOrBranch && classes.orBranch)}>
			{/* {row.isOrBranch ? <JoinMarker join='or' /> : null}
			{row.isAndBranch ? <JoinMarker join='and' /> : null} */}
			<Group gap='xs' align='flex-start' className={classes.conditionRow}>
				<ConditionControls {...props} />
				<RowActions {...props} />
			</Group>
		</Box>
	);
}

/**
 * The `and`/`or` label plus its screen-reader equivalent.
 *
 * Spelling the join out on every row after the first is what makes the expression readable
 * top-to-bottom; for `or` the indent alone must not carry it (§28), and `and` has no indent at
 * all, so the label is the only cue either way.
 */
function JoinMarker(props: { join: 'and' | 'or' }): React.ReactNode {
	const t = useTranslate('common');
	const labelKey = props.join === 'or' ? 'search.joinOr' : 'search.joinAnd';
	const srKey = props.join === 'or' ? 'search.joinedByOr' : 'search.joinedByAnd';
	return (
		<>
			<Text component='span' size='xs' c='dimmed' className={classes.orLabel} aria-hidden>
				{t(labelKey)}
			</Text>
			<Text component='span' className='sr-only'>{t(srKey)}</Text>
		</>
	);
}

/**
 * The three `data` lists the row's controls need, each derived from the one before it.
 *
 * Split out of the render so the dependency chain — field schema to kind, kind to operators and
 * enum choices — is readable on its own, rather than interleaved with the markup.
 */
function useConditionOptions(props: FilterConditionRowProps) {
	const node = props.row.node;
	const t = useTranslate('common');
	const fieldSchema = props.modelSchema?.fields?.[node.field];
	const kind = getFilterInputKind(fieldSchema);

	const fieldOptions = React.useMemo(
		() => props.fields.map(field => ({ value: field, label: props.translateFieldName(field) })),
		[props.fields, props.translateFieldName],
	);
	const operatorOptions = React.useMemo(
		() => buildOperatorOptions(kind, node.operator, t),
		[kind, node.operator, t],
	);
	const enumOptions = React.useMemo(
		() => kind === 'enum' ? getEnumOptions(fieldSchema) : [],
		[kind, fieldSchema],
	);
	return { t, kind, fieldOptions, operatorOptions, enumOptions };
}

/** Field, operator and value: the three controls whose options depend on each other. */
function ConditionControls(props: FilterConditionRowProps): React.ReactNode {
	const { row, onPatch } = props;
	const node = row.node;
	const { t, kind, fieldOptions, operatorOptions, enumOptions } = useConditionOptions(props);

	const onFieldChange = (next: string | null) => {
		if (next) {
			onPatch(node.id, applyFieldChange(next, getFilterInputKind(props.modelSchema?.fields?.[next])));
		}
	};
	const onOperatorChange = (next: string | null) => {
		if (next) {
			onPatch(node.id, applyOperatorChange(node, next as dyn.SearchOperator));
		}
	};
	const valuePatch = (raw: string): Partial<FilterConditionNode> => (
		{ values: splitValues(raw, node.operator) }
	);
	const onValueChange = (raw: string) => onPatch(node.id, valuePatch(raw));
	const onValueCommit = (raw: string) => props.onSubmit(node.id, valuePatch(raw));

	return (
		<>
			{row.isOrBranch ? <JoinMarker join='or' /> : null}
			{row.isAndBranch ? <JoinMarker join='and' /> : null}
			<Select
				data={fieldOptions}
				value={node.field || null}
				onChange={onFieldChange}
				placeholder={t('search.chooseField')}
				disabled={row.locked}
				error={props.errorReason === 'noField'}
				searchable
				className={classes.conditionField}
				{...props.tid.filterConditionField(props.index)}
			/>
			<Select
				data={operatorOptions}
				value={node.operator}
				onChange={onOperatorChange}
				disabled={row.locked}
				className={classes.conditionOperator}
				{...props.tid.filterConditionOperator(props.index)}
			/>
			<Box className={classes.conditionValue}>
				{shouldHideValueInput(node.operator) ? null : (
					<FilterValueInput
						kind={kind}
						enumOptions={enumOptions}
						value={node.values.map(String).join(', ')}
						onChange={onValueChange}
						// Typing only edits the tree. `commitOn='enter'` is what keeps `onCommit`
						// off the keystroke path — without it the default (`change`) would fire a
						// search per character through `onSubmit`.
						commitOn='enter'
						// A select has no keystroke to confirm, so its change *is* the commit and
						// applying on it would fire a search the user never asked to run; only the
						// text input's Enter reaches `onSubmit`.
						onCommit={isKeyboardCommitKind(kind) ? onValueCommit : onValueChange}
						disabled={row.locked}
						error={props.errorReason === 'noValue'}
						testAttrs={props.tid.filterConditionValue(props.index)}
					/>
				)}
				{props.errorReason ? (
					<Text size='xs' c='red' {...props.tid.filterConditionError(props.index)}>
						{t(`search.error.${props.errorReason}`)}
					</Text>
				) : null}
			</Box>
		</>
	);
}

function RowActions(props: FilterConditionRowProps): React.ReactNode {
	const t = useTranslate('common');
	const { row } = props;
	const id = row.node.id;
	return (
		<Group gap={4} wrap='nowrap' className={classes.rowActions}>
			{row.showJoinButtons ? (
				<>
					<Button
						variant='default'
						onClick={() => props.onAddAnd(id)}
						{...props.tid.filterConditionJoin(props.index, 'and')}
					>
						{t('search.joinAnd')}
					</Button>
					<Button
						variant='default'
						onClick={() => props.onAddOr(id)}
						{...props.tid.filterConditionJoin(props.index, 'or')}
					>
						{t('search.joinOr')}
					</Button>
				</>
			) : null}
			{row.locked ? null : (
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => props.onRemove(id)}
					aria-label={t('search.removeCondition')}
					{...props.tid.filterConditionRemove(props.index)}
				>
					<IconX size={14} />
				</ActionIcon>
			)}
		</Group>
	);
}

/**
 * The operators offered for this kind, plus the current one if the kind would not offer it.
 *
 * A graph seeded from a page — or written by an older build — may carry an operator outside the
 * field's normal set. Dropping it from the list would make `Select` render blank and the next
 * edit would silently rewrite the condition.
 */
function buildOperatorOptions(
	kind: ReturnType<typeof getFilterInputKind>,
	current: dyn.SearchOperator,
	t: (key: string) => string,
): Array<{ value: string, label: string }> {
	const operators = getOperatorsForKind(kind);
	const all = operators.includes(current) ? operators : [...operators, current];
	return all.map(operator => ({
		value: operator,
		label: t(`search.operator.${operatorLabelKey(operator)}`),
	}));
}

function splitValues(raw: string, operator: dyn.SearchOperator): unknown[] {
	if (!isMultiValueOperator(operator)) {
		return [raw];
	}
	return raw.split(',').map(part => part.trim()).filter(Boolean);
}

