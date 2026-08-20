import {
	ActionIcon, Badge, Box, Button, Checkbox, Divider, Group, Paper, Select, Stack, Text,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconFilter, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './FilterBox.module.css';
import {
	getDefaultOperator, getEnumOptions, getFilterInputKind, getFilterableFieldNames,
	getOperatorsForKind, isMultiValueOperator,
} from './filterModel';
import { FilterValueInput, shouldHideValueInput } from './FilterValueInput';
import { useTranslate } from '../../i18n';

import type { FilterClause } from './filterModel';
import type { DataTableTestIds } from './testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type FilterBoxProps = {
	modelSchema?: dyn.ModelSchema,
	clauses: FilterClause[],
	onClausesChange: (clauses: FilterClause[]) => void,
	includeArchived: boolean,
	onIncludeArchivedChange: (includeArchived: boolean) => void,
	/** Total active filters, including the column row's. Drives the applied-state chip. */
	activeCount: number,
	onApply: () => void,
	onClear: () => void,
	translateFieldName: (field: string) => string,
	tid: DataTableTestIds,
};

/**
 * The table's filter control: a trigger button that reports how many filters are live, and a
 * pane that expands beneath it to edit them.
 *
 * Replaces the former `SearchBox`. The pane pushes the table down rather than floating over it,
 * so a long condition list never covers the rows it is filtering.
 */
export function FilterBox(props: FilterBoxProps): React.ReactNode {
	const [expanded, setExpanded] = React.useState(false);
	const t = useTranslate('common');
	const hasFilters = props.activeCount > 0;

	return (
		<Box className='relative grow basis-0'>
			<Group justify='flex-end' gap='xs'>
				<Button
					variant={expanded || hasFilters ? 'light' : 'default'}
					onClick={() => setExpanded(prev => !prev)}
					leftSection={hasFilters
						? <Badge size='sm' circle variant='filled'>{props.activeCount}</Badge>
						: <IconFilter size={16} />}
					rightSection={hasFilters
						? (expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />)
						: null}
					{...props.tid.filterToggle()}
				>
					{hasFilters ? t('search.filtersApplied') : t('search.filters')}
				</Button>
			</Group>

			{expanded ? (
				<FilterPanel {...props} onClose={() => setExpanded(false)} />
			) : null}
		</Box>
	);
}

type FilterPanelProps = FilterBoxProps & { onClose: () => void };

function FilterPanel(props: FilterPanelProps): React.ReactNode {
	const t = useTranslate('common');
	const filterableFields = React.useMemo(
		() => getFilterableFieldNames(props.modelSchema),
		[props.modelSchema],
	);
	const addClause = (field: string) => {
		const kind = getFilterInputKind(props.modelSchema?.fields?.[field]);
		const clause: FilterClause = {
			key: `${field}-${props.clauses.length}-${nextClauseSeq()}`,
			field,
			operator: getDefaultOperator(kind),
			values: [],
		};
		// Prepended, as the requirement asks: the condition the user just asked for should be
		// the one they see, without scrolling past the ones already there.
		props.onClausesChange([clause, ...props.clauses]);
	};

	return (
		<Paper withBorder shadow='xs' p='md' className={clsx('mt-1 text-left', classes.panel)}
			{...props.tid.filterPanel()}
		>
			<Stack gap='sm'>
				<ConditionButtons
					fields={filterableFields}
					translateFieldName={props.translateFieldName}
					onAdd={addClause}
					tid={props.tid}
				/>
				<Divider />
				<Checkbox
					label={t('search.includeArchived')}
					checked={props.includeArchived}
					onChange={event => props.onIncludeArchivedChange(event.currentTarget.checked)}
					{...props.tid.filterIncludeArchived()}
				/>
				<Divider />
				<ConditionList {...props} fields={filterableFields} />
				<Group justify='flex-end'>
					<Button variant='default' onClick={props.onClear} {...props.tid.filterClear()}>
						{t('action.clearFilters')}
					</Button>
					<Button
						onClick={() => {
							props.onApply();
							props.onClose();
						}}
						{...props.tid.filterApply()}
					>
						{t('action.apply')}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}

type ConditionButtonsProps = {
	fields: string[],
	translateFieldName: (field: string) => string,
	onAdd: (field: string) => void,
	tid: DataTableTestIds,
};

function ConditionButtons(props: ConditionButtonsProps): React.ReactNode {
	const t = useTranslate('common');
	return (
		<Stack gap='xs'>
			<Text fw={600} size='sm'>{t('search.addCondition')}</Text>
			<Group gap='xs' className={classes.conditionButtons}>
				{props.fields.map(field => (
					<Button
						key={field}
						variant='subtle'
						size='compact-sm'
						onClick={() => props.onAdd(field)}
						{...props.tid.filterAddCondition(field)}
					>
						{props.translateFieldName(field)}
					</Button>
				))}
			</Group>
		</Stack>
	);
}

type ConditionListProps = FilterPanelProps & { fields: string[] };

function ConditionList(props: ConditionListProps): React.ReactNode {
	const t = useTranslate('common');
	if (props.clauses.length === 0) {
		return <Text size='sm' c='dimmed'>{t('search.noConditions')}</Text>;
	}
	const updateClause = (index: number, next: FilterClause) => {
		props.onClausesChange(props.clauses.map((clause, i) => i === index ? next : clause));
	};
	const removeClause = (index: number) => {
		props.onClausesChange(props.clauses.filter((_, i) => i !== index));
	};
	return (
		<Stack gap='xs'>
			<Text fw={600} size='sm'>{t('search.matchAllOfTheseConditions')}</Text>
			{props.clauses.map((clause, index) => (
				<ConditionRow
					key={clause.key}
					index={index}
					clause={clause}
					fields={props.fields}
					modelSchema={props.modelSchema}
					translateFieldName={props.translateFieldName}
					onChange={next => updateClause(index, next)}
					onRemove={() => removeClause(index)}
					tid={props.tid}
				/>
			))}
		</Stack>
	);
}

type ConditionRowProps = {
	index: number,
	clause: FilterClause,
	fields: string[],
	modelSchema?: dyn.ModelSchema,
	translateFieldName: (field: string) => string,
	onChange: (clause: FilterClause) => void,
	onRemove: () => void,
	tid: DataTableTestIds,
};

function ConditionRow(props: ConditionRowProps): React.ReactNode {
	const { clause, onChange } = props;
	const t = useTranslate('common');
	const fieldSchema = props.modelSchema?.fields?.[clause.field];
	const kind = getFilterInputKind(fieldSchema);
	const fieldOptions = React.useMemo(
		() => props.fields.map(field => ({ value: field, label: props.translateFieldName(field) })),
		[props.fields, props.translateFieldName],
	);
	const operatorOptions = React.useMemo(
		() => getOperatorsForKind(kind).map(operator => ({
			value: operator,
			label: t(`search.operator.${operatorLabelKey(operator)}`),
		})),
		[kind, t],
	);
	const enumOptions = React.useMemo(
		() => kind === 'enum' ? getEnumOptions(fieldSchema) : [],
		[kind, fieldSchema],
	);

	const { onFieldChange, onOperatorChange, onValueChange } = useConditionHandlers(
		clause, onChange, props.modelSchema,
	);

	return (
		<Group gap='xs' wrap='nowrap' align='center'>
			<Select
				data={fieldOptions}
				value={clause.field}
				onChange={onFieldChange}
				size='xs'
				className={classes.conditionField}
				comboboxProps={conditionComboboxProps}
				{...props.tid.filterConditionField(props.index)}
			/>
			<Select
				data={operatorOptions}
				value={clause.operator}
				onChange={onOperatorChange}
				size='xs'
				className={classes.conditionOperator}
				comboboxProps={conditionComboboxProps}
				{...props.tid.filterConditionOperator(props.index)}
			/>
			<Box className={classes.conditionValue}>
				{shouldHideValueInput(clause.operator) ? null : (
					<FilterValueInput
						kind={kind}
						enumOptions={enumOptions}
						value={clause.values.map(String).join(', ')}
						onChange={onValueChange}
						onCommit={onValueChange}
						size='xs'
						variant='default'
						testAttrs={props.tid.filterConditionValue(props.index)}
					/>
				)}
			</Box>
			<ActionIcon
				variant='subtle'
				color='red'
				onClick={props.onRemove}
				aria-label={t('action.remove')}
				{...props.tid.filterConditionRemove(props.index)}
			>
				<IconX size={14} />
			</ActionIcon>
		</Group>
	);
}

/**
 * The three edits a condition row allows, kept out of the row so it stays a rendering function.
 */
function useConditionHandlers(
	clause: FilterClause,
	onChange: (clause: FilterClause) => void,
	modelSchema: dyn.ModelSchema | undefined,
) {
	const onFieldChange = (next: string | null) => {
		if (!next) {
			return;
		}
		const nextKind = getFilterInputKind(modelSchema?.fields?.[next]);
		// The value and operator belong to the old field's type. Keeping either across a field
		// change produces a condition the server rejects — an enum value against a date column,
		// or `starts with` against an integer.
		onChange({ ...clause, field: next, operator: getDefaultOperator(nextKind), values: [] });
	};

	const onOperatorChange = (next: string | null) => {
		if (!next) {
			return;
		}
		const operator = next as dyn.SearchOperator;
		// A presence operator takes no operand; carrying the old value over would send a
		// three-element condition where the server expects two.
		const values = shouldHideValueInput(operator) ? [] : clause.values;
		onChange({ ...clause, operator, values });
	};

	const onValueChange = (raw: string) => {
		onChange({
			...clause,
			values: isMultiValueOperator(clause.operator)
				? raw.split(',').map(part => part.trim()).filter(Boolean)
				: [raw],
		});
	};

	return { onFieldChange, onOperatorChange, onValueChange };
}

const conditionComboboxProps = { withinPortal: true, position: 'bottom-start' as const };

/**
 * Maps an operator to the trailing segment of its translation key.
 *
 * The operators are punctuation, which cannot appear in a dotted i18n key, so each gets a
 * spelled-out name. Kept exhaustive so a new backend operator surfaces as a missing key rather
 * than rendering as a symbol the user cannot interpret.
 */
function operatorLabelKey(operator: dyn.SearchOperator): string {
	const names: Record<string, string> = {
		'=': 'equals',
		'!=': 'notEquals',
		'>': 'greaterThan',
		'>=': 'greaterOrEqual',
		'<': 'lessThan',
		'<=': 'lessOrEqual',
		'*': 'contains',
		'!*': 'notContains',
		'^': 'startsWith',
		'!^': 'notStartsWith',
		'$': 'endsWith',
		'!$': 'notEndsWith',
		'in': 'in',
		'not_in': 'notIn',
		'is_set': 'isSet',
		'not_set': 'notSet',
		'linked': 'linked',
		'not_linked': 'notLinked',
	};
	return names[operator] ?? operator;
}

/** Distinguishes two clauses added to the same field, so React keys stay unique. */
let clauseSeq = 0;
function nextClauseSeq(): number {
	clauseSeq += 1;
	return clauseSeq;
}
