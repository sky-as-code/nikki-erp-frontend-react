import { Table } from '@mantine/core';
import React from 'react';

import classes from './ColumnFilterRow.module.css';
import { getFilterInputKind, isFilterableField, isTextLikeKind as isTextLike } from './filterModel';
import { SchemaFilterValueInput } from './FilterValueInput';

import type { DataTableTestIds } from '../testIds';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type ColumnFilterRowProps = {
	fields: string[],
	modelSchema?: dyn.ModelSchema,
	/** Raw text per field, as typed. Parsing happens on commit, not here. */
	values: Record<string, string>,
	onChange: (field: string, value: string) => void,
	onCommit: (field: string, value: string) => void,
	getColumnStyle: (field: string) => React.CSSProperties,
	/** Mirrors the header's trailing filler cell, present only when resizing is on. */
	hasFillerColumn: boolean,
	placeholder: string,
	translateEnumValue?: (field: string, value: string) => string,
	tid: DataTableTestIds,
};

/**
 * The row of per-column filter inputs sitting directly beneath the header.
 *
 * It mirrors the header's cell structure exactly — the row-number cell, one cell per visible
 * field in the same order, and the filler cell when column resizing is on — because it shares
 * the header's column widths. Any cell this row omits or adds would shift every column after
 * it out of alignment with the data below.
 */
export function ColumnFilterRow(props: ColumnFilterRowProps): React.ReactNode {
	// No sticky handling here: the row lives inside the same <thead> as the column headers, and
	// `stickyHeader` pins that element as a whole, so both rows travel together for free.
	return (
		<Table.Tr className={classes.columnFilterRow}>
			<Table.Th className={classes.columnFilterCell} aria-hidden />
			{props.fields.map(field => (
				<ColumnFilterCell key={field} field={field} {...props} />
			))}
			{props.hasFillerColumn ? (
				<Table.Th className={classes.columnFilterCell} aria-hidden />
			) : null}
		</Table.Tr>
	);
}

type ColumnFilterCellProps = ColumnFilterRowProps & { field: string };

function ColumnFilterCell(props: ColumnFilterCellProps): React.ReactNode {
	const { field, modelSchema, onChange, onCommit } = props;
	const fieldSchema = modelSchema?.fields?.[field];
	const translateEnumValue = props.translateEnumValue;
	const onValueChange = React.useCallback(
		(value: string) => onChange(field, value),
		[onChange, field],
	);
	const onValueCommit = React.useCallback(
		(value: string) => onCommit(field, value),
		[onCommit, field],
	);
	const translate = React.useCallback(
		(value: string) => translateEnumValue ? translateEnumValue(field, value) : value,
		[translateEnumValue, field],
	);

	// A column the server cannot filter on gets an empty cell rather than a dead input: an
	// inert text box invites the user to type a query that would never be sent.
	if (!isFilterableField(fieldSchema)) {
		return (
			<Table.Th
				style={props.getColumnStyle(field)}
				className={classes.columnFilterCell}
				aria-hidden
			/>
		);
	}

	return (
		<Table.Th style={props.getColumnStyle(field)} className={classes.columnFilterCell}>
			<SchemaFilterValueInput
				fieldSchema={fieldSchema}
				value={props.values[field] ?? ''}
				onChange={onValueChange}
				onCommit={onValueCommit}
				placeholder={isTextLike(getFilterInputKind(fieldSchema)) ? props.placeholder : undefined}
				translateEnumValue={translate}
				// Free text applies only on Enter — the spec's Data Table uplift. A select has no
				// half-typed state, so it still commits on change.
				commitOn='enter'
				clearOnEscape
				testAttrs={props.tid.columnFilter(field)}
			/>
		</Table.Th>
	);
}
