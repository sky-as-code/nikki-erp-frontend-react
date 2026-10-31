import { HoverCard, VisuallyHidden } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';

import classes from './FieldDescription.module.css';
import { Modal } from '../Modal/Modal';


const tooltipWidth = 360;
/** A deliberate hover: passing the pointer over a mark or a column header never raises the card. */
const openDelayMs = 1000;
/**
 * The card lingers this long after the pointer leaves the mark or the card, so the pointer can
 * cross the gap into the card (to read or select a long description) without it vanishing.
 */
const closeDelayMs = 500;

/**
 * A tooltip-looking card that stays open while the pointer is over its target or the card itself.
 * Mantine's `Tooltip` cannot do that: it is pointer-transparent and closes on leaving the target.
 */
function DescriptionCard({ description, children }: {
	description: string,
	children: React.ReactElement,
}): React.ReactNode {
	return (
		<HoverCard
			openDelay={openDelayMs}
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
 * The info icon after a field label. Hovering it for 1s shows the field's schema description; a click or a
 * tap (where there is no hover) opens it in a dialog. It is not focusable: an input already carries
 * the description as `aria-describedby`, and a read-only label announces it as hidden text.
 * Renders nothing for an empty description.
 */
export function FieldDescriptionMark({ description, label }: {
	description: string | undefined,
	/** The dialog's title. */
	label?: React.ReactNode,
}): React.ReactNode {
	const [opened, setOpened] = React.useState(false);
	if (!description) {
		return null;
	}
	const open = (event: React.MouseEvent): void => {
		// Inside an input's `<label>`, a click would otherwise focus the input instead.
		event.preventDefault();
		event.stopPropagation();
		setOpened(true);
	};
	return (
		<>
			<DescriptionCard description={description}>
				<span className={classes.mark} aria-hidden data-testid='fieldDescription.mark' onClick={open}>
					<IconInfoCircle size={14} />
				</span>
			</DescriptionCard>
			<Modal
				opened={opened} onClose={() => setOpened(false)} title={label} centered
				classNames={{ body: classes.modalBody }} data-testid='fieldDescription.modal'
			>
				{description}
			</Modal>
		</>
	);
}

/** A field label followed by its description mark: the one label shape of edit, read-only and locked fields. */
export function FieldLabelText({ label, description, announce }: {
	label: React.ReactNode,
	description?: string,
	/** Also read the description out with the label, for a label no input points `aria-describedby` from. */
	announce?: boolean,
}): React.ReactNode {
	return (
		<>
			{label}
			<FieldDescriptionMark description={description} label={label} />
			{announce && description ? <VisuallyHidden>{`. ${description}`}</VisuallyHidden> : null}
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
	return <DescriptionCard description={description}>{text}</DescriptionCard>;
}
