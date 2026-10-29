import { Tooltip } from '@mantine/core';
import React from 'react';

import classes from './FieldDescription.module.css';


const tooltipWidth = 360;
const headerOpenDelayMs = 1000;

/**
 * The superscript `?` after a field label; hovering it shows the field's schema description.
 * Renders nothing for an empty description.
 */
export function FieldDescriptionMark({ description }: { description: string | undefined }): React.ReactNode {
	if (!description) {
		return null;
	}
	return (
		<Tooltip
			label={description} multiline maw={tooltipWidth} withinPortal classNames={{ tooltip: classes.tooltip }}
		>
			<sup className={classes.mark} aria-hidden data-testid='fieldDescription.mark'>?</sup>
		</Tooltip>
	);
}

/** A field label followed by its description mark: the one label shape of edit, read-only and locked fields. */
export function FieldLabelText({ label, description }: {
	label: React.ReactNode,
	description?: string,
}): React.ReactNode {
	return (
		<>
			{label}
			<FieldDescriptionMark description={description} />
		</>
	);
}

export type ColumnHeaderLabelProps = {
	label: string,
	description: string | undefined,
	className?: string,
};

/**
 * A column header's label text. Only the label itself carries the description tooltip, after a
 * deliberate 1s hover, so the header's menu, sort and resize controls never raise it.
 */
export function ColumnHeaderLabel({ label, description, className }: ColumnHeaderLabelProps): React.ReactNode {
	const text = <span className={className}>{label}</span>;
	if (!description) {
		return text;
	}
	return (
		<Tooltip
			label={description}
			multiline
			maw={tooltipWidth}
			openDelay={headerOpenDelayMs}
			withinPortal
			classNames={{ tooltip: classes.tooltip }}
		>
			{text}
		</Tooltip>
	);
}
