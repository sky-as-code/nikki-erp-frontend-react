import { Stack, Title } from '@mantine/core';
import { isLongTextField } from '@nikkierp/ui/components/form';
import clsx from 'clsx';
import React from 'react';

import { InlineFieldRow } from './inlineFieldRow';
import classes from './ResourceDetail.module.css';
import { formPanelSectionClass } from '../../components/formPanel/sectionClass';

import type { FormPanelSectionLayout } from '../../components/formPanel/sectionClass';
import type { FormColumnField } from '../resourceDetail/formColumnFields';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** One form column as a section of the form panel: an h3 title over its fields. */
export function FormSection({ block, title, children }: {
	block: FormPanelSectionLayout,
	title: string | undefined,
	children: React.ReactNode,
}): React.ReactNode {
	const titleId = React.useId();
	return (
		<section
			className={clsx(classes.formBlock, formPanelSectionClass(block))}
			aria-labelledby={title ? titleId : undefined}
		>
			{title ? <Title order={3} id={titleId} className={classes.sectionTitle}>{title}</Title> : null}
			{children}
		</section>
	);
}

export type RenderField = (field: string, labelHidden: boolean) => React.ReactNode;

/**
 * A column's fields. In read mode they are `dl` pairs: each run of plain fields one `dl`, an inline
 * row between the runs (a sentence, not a label-value pair). Editing keeps one grid of inputs.
 */
export function FieldRuns({ fields, semantic, renderField }: {
	fields: FormColumnField[],
	semantic: boolean,
	renderField: RenderField,
}): React.ReactNode {
	const renderEntry = (entry: FormColumnField, index: number): React.ReactNode => (typeof entry === 'string'
		? <React.Fragment key={entry}>{renderField(entry, false)}</React.Fragment>
		: <InlineFieldRow key={`row-${index}`} items={entry} renderField={field => renderField(field, true)} />
	);
	if (!semantic) {
		return <div className={classes.fieldGrid}>{fields.map(renderEntry)}</div>;
	}
	return (
		<div className={classes.fieldRuns}>
			{splitRuns(fields).map((run, index) => (Array.isArray(run)
				? <dl key={`run-${index}`} className={classes.fieldGrid}>{run.map(renderEntry)}</dl>
				: renderEntry(run.row, index)
			))}
		</div>
	);
}

type FieldRun = string[] | { row: Exclude<FormColumnField, string> };

function splitRuns(fields: FormColumnField[]): FieldRun[] {
	const runs: FieldRun[] = [];
	for (const entry of fields) {
		if (typeof entry !== 'string') {
			runs.push({ row: entry });
			continue;
		}
		const last = runs.at(-1);
		if (Array.isArray(last)) {
			last.push(entry);
		}
		else {
			runs.push([entry]);
		}
	}
	return runs;
}

/** A field's label over its value: a `dt`/`dd` pair inside a `dl`, plain boxes elsewhere. */
export function FieldPair({ asTerm, label, valueClassName, children }: {
	asTerm: boolean,
	label: React.ReactNode | null,
	valueClassName?: string,
	children: React.ReactNode,
}): React.ReactNode {
	const valueClass = clsx(classes.fieldValue, valueClassName);
	if (asTerm) {
		return (
			<div>
				<dt className={classes.fieldLabel}>{label}</dt>
				<dd className={valueClass}>{children}</dd>
			</div>
		);
	}
	return (
		<Stack gap={0}>
			{label != null ? <div className={classes.fieldLabel}>{label}</div> : null}
			<div className={valueClass}>{children}</div>
		</Stack>
	);
}

const TABULAR_TYPES = new Set<dyn.ModelSchemaFieldDataTypeName>([
	'decimal', 'int32', 'int64', 'nikkiDate', 'nikkiDateTime', 'nikkiTime', 'nikkiResourceCode',
]);

/**
 * Extra classes of a field's value: aligned digits for numbers, dates and codes; kept line breaks for
 * long text (whose field also takes a whole row of the field grid, see `.fieldGrid`).
 */
export function fieldValueClass(fieldDef: dyn.ModelSchemaField): string | undefined {
	const typeName = fieldDef.data_type?.name;
	return clsx(
		typeName && TABULAR_TYPES.has(typeName) && classes.tabularNums,
		isLongTextField(fieldDef) && classes.longText,
	) || undefined;
}
