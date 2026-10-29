import { HoverCard } from '@mantine/core';
import React from 'react';

import classes from './FieldDescription.module.css';


const tooltipWidth = 360;
const headerOpenDelayMs = 1000;
/**
 * The card lingers this long after the pointer leaves the mark or the card, so the pointer can
 * cross the gap into the card (to read or select a long description) without it vanishing.
 */
const closeDelayMs = 500;

/**
 * A tooltip-looking card that stays open while the pointer is over its target or the card itself.
 * Mantine's `Tooltip` cannot do that: it is pointer-transparent and closes on leaving the target.
 */
function DescriptionCard({ description, openDelay, children }: {
	description: string,
	openDelay: number,
	children: React.ReactElement,
}): React.ReactNode {
	return (
		<HoverCard
			openDelay={openDelay}
			closeDelay={closeDelayMs}
			withinPortal
			classNames={{ dropdown: classes.tooltip }}
		>
			<HoverCard.Target>{children}</HoverCard.Target>
			<HoverCard.Dropdown maw={tooltipWidth} data-testid='fieldDescription.tooltip'>{description}</HoverCard.Dropdown>
		</HoverCard>
	);
}

/**
 * The superscript `?` after a field label; hovering it shows the field's schema description.
 * Renders nothing for an empty description.
 */
export function FieldDescriptionMark({ description }: { description: string | undefined }): React.ReactNode {
	if (!description) {
		return null;
	}
	return (
		<DescriptionCard description={description} openDelay={0}>
			<sup className={classes.mark} aria-hidden data-testid='fieldDescription.mark'>?</sup>
		</DescriptionCard>
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
 * A column header's label text. Only the label itself carries the description card, after a
 * deliberate 1s hover, so the header's menu, sort and resize controls never raise it.
 */
export function ColumnHeaderLabel({ label, description, className }: ColumnHeaderLabelProps): React.ReactNode {
	const text = <span className={className}>{label}</span>;
	if (!description) {
		return text;
	}
	return <DescriptionCard description={description} openDelay={headerOpenDelayMs}>{text}</DescriptionCard>;
}
