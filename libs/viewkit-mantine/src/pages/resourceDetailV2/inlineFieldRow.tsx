import { Box, Group, Text } from '@mantine/core';
import { ExplicitInputWidth } from '@nikkierp/ui/components/form';
import { useTranslate } from '@nikkierp/ui/i18n';
import clsx from 'clsx';
import React from 'react';

import classes from './ResourceDetail.module.css';
import { groupItemsOf } from '../resourceDetail/formColumnFields';
import { useResourceDetailTranslationNs } from '../resourceDetail/ResourceDetailProvider';

import type { FieldGroupDisplay } from '../resourceDetail/formColumnFields';


/**
 * One field group display of a form column: its items on a single line -- translated text, literal
 * text and field inputs (or values, in read mode) side by side -- under the group's label, like a
 * field's label over its input (a `dt`/`dd` pair with `asTerm`, in read mode's `dl`). A group whose
 * fields all render nothing is dropped, text included, so no sentence is left without its subject.
 *
 * The label is the group's `label`, else `fallbackLabel` (the first field's schema label). A field
 * item with a width is boxed to it; the rest size themselves.
 */
export function InlineFieldRow({ group, renderField, fallbackLabel, asTerm = false }: {
	group: FieldGroupDisplay,
	renderField: (field: string) => React.ReactNode,
	fallbackLabel?: string,
	asTerm?: boolean,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const labelId = React.useId();
	const parsed = groupItemsOf(group);
	const fieldNodes = parsed.map(item => (item.kind === 'field' ? renderField(item.name) : null));
	const fieldCount = parsed.filter(item => item.kind === 'field').length;
	if (fieldCount > 0 && fieldNodes.every(node => node === null)) {
		return null;
	}
	const row = (
		<Group gap='xs' align='center' wrap='wrap' data-testid='resourceForm.inlineRow'>
			{parsed.map((item, index) => {
				if (item.kind === 'field') {
					return item.width
						? (
							<Box key={index} w={item.width} className={classes.sizedGroupItem}>
								<ExplicitInputWidth>{fieldNodes[index]}</ExplicitInputWidth>
							</Box>
						)
						: <React.Fragment key={index}>{fieldNodes[index]}</React.Fragment>;
				}
				const text = item.kind === 'text' ? t(item.key, item.ns ? { ns: item.ns } : undefined) : item.text;
				return <Text key={index} size='md' component='span'>{text}</Text>;
			})}
		</Group>
	);
	const label = group.label ? t(group.label) : (fallbackLabel ?? '');
	return (
		<LabelledRow
			label={label} labelId={labelId} asTerm={asTerm} isFullRow={group.isFullRow === true}
			testKey={group.label ?? group.fields.join(',')}
		>
			{row}
		</LabelledRow>
	);
}

/** A field group display's frame: its label over the items, in one grid track or the whole row. */
function LabelledRow({ label, labelId, asTerm, isFullRow, testKey, children }: {
	label: string,
	labelId: string,
	asTerm: boolean,
	isFullRow: boolean,
	testKey: string,
	children: React.ReactNode,
}): React.ReactNode {
	const testId = `resourceForm.fieldGroup.${testKey}`;
	const className = clsx(classes.fieldGroup, isFullRow && classes.fullRow);
	if (asTerm) {
		return (
			<div className={className} data-testid={testId}>
				<dt id={labelId} className={classes.fieldLabel}>{label}</dt>
				<dd className={classes.fieldValue}>{children}</dd>
			</div>
		);
	}
	return (
		<div role='group' aria-labelledby={labelId} className={className} data-testid={testId}>
			<div id={labelId} className={classes.fieldLabel}>{label}</div>
			{children}
		</div>
	);
}
