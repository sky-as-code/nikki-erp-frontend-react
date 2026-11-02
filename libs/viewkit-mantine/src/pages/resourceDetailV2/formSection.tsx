import { Stack, Title } from '@mantine/core';
import { FieldDescriptionMark } from '@nikkierp/ui/components';
import { isLongTextField } from '@nikkierp/ui/components/form';
import clsx from 'clsx';
import React from 'react';

import { InlineFieldRow } from './inlineFieldRow';
import classes from './ResourceDetail.module.css';
import { formPanelSectionClass } from '../../components/formPanel/sectionClass';
import { columnFieldNames } from '../resourceDetail/formColumnFields';

import type { FormPanelSectionLayout } from '../../components/formPanel/sectionClass';
import type { FormColumnField } from '../resourceDetail/formColumnFields';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** One form column as a section of the form panel: an h3 title over its fields. */
export function FormSection({ block, title, description, children }: {
	block: FormPanelSectionLayout,
	title: string | undefined,
	/** Translated text behind the `(i)` mark after the title; ignored without a title. */
	description?: string,
	children: React.ReactNode,
}): React.ReactNode {
	const titleId = React.useId();
	return (
		<section
			className={clsx(classes.formBlock, formPanelSectionClass(block))}
			aria-labelledby={title ? titleId : undefined}
		>
			{title ? (
				<Title order={3} id={titleId} className={classes.sectionTitle}>
					{title}
					<FieldDescriptionMark description={description} label={title} />
				</Title>
			) : null}
			{children}
		</section>
	);
}

export type RenderField = (field: string, labelHidden: boolean) => React.ReactNode;

/**
 * A column's fields: one grid of inputs when editing, one `dl` of label-value pairs in read mode,
 * field group displays included (each is a labelled pair too). A field listed twice renders twice,
 * each copy under its own React key. `labelOf` names a group without a `label` after its first field.
 */
export function FieldRuns({ fields, semantic, renderField, labelOf }: {
	fields: FormColumnField[],
	semantic: boolean,
	renderField: RenderField,
	labelOf?: (field: string) => string,
}): React.ReactNode {
	const keys = entryKeys(fields);
	const renderEntry = (entry: FormColumnField, index: number): React.ReactNode => {
		if (typeof entry === 'string') {
			return <React.Fragment key={keys[index]}>{renderField(entry, false)}</React.Fragment>;
		}
		const first = columnFieldNames([entry])[0];
		return (
			<InlineFieldRow
				key={keys[index]} group={entry} asTerm={semantic}
				fallbackLabel={first && labelOf ? labelOf(first) : first}
				renderField={field => renderField(field, true)}
			/>
		);
	};
	if (!semantic) {
		return <div className={classes.fieldGrid}>{fields.map(renderEntry)}</div>;
	}
	return (
		<div className={classes.fieldRuns}>
			<dl className={classes.fieldGrid}>{fields.map(renderEntry)}</dl>
		</div>
	);
}

/**
 * A React key per entry: a field's name, then `name#2`, `name#3`, … for its later copies; a field
 * group display by its position.
 */
export function entryKeys(fields: readonly FormColumnField[]): string[] {
	const seen = new Map<string, number>();
	return fields.map((entry, index) => {
		if (typeof entry !== 'string') {
			return `row-${index}`;
		}
		const count = (seen.get(entry) ?? 0) + 1;
		seen.set(entry, count);
		return count === 1 ? entry : `${entry}#${count}`;
	});
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
