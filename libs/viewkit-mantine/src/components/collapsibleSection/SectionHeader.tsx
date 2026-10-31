import { Title, UnstyledButton } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconChevronDown } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './SectionShell.module.css';

import type { TestIdAttributes } from '@nikkierp/common/utils';


export type SectionHeaderProps = {
	title: React.ReactNode | null | undefined,
	/** The h2's id, for the section's `aria-labelledby`. */
	titleId?: string,
	collapsible: boolean,
	expanded: boolean,
	onToggle: () => void,
	/** `data-testid` attributes for the toggle. */
	toggleAttrs?: TestIdAttributes,
	/** Shown at the header's right end, outside the toggle: a click on it never collapses the section. */
	rightSegment?: React.ReactNode,
};

/**
 * The one header of every collapsible section (`collapsible_section` in both layouts, and
 * `tab_collapsible_section`). The toggle is a button as wide and as tall as the header row, less the
 * right segment, so its hover fill meets the section's borders.
 *
 * The button sits inside the h2 (the disclosure pattern: a heading may not live inside a button), and
 * its accessible name is the title; only an untitled toggle needs a label of its own.
 */
export function SectionHeader(props: SectionHeaderProps): React.ReactNode {
	const t = useTranslate();
	const hasTitle = props.title != null && props.title !== '';
	const toggleLabel = props.expanded
		? t('common:form.collapseSection', { defaultValue: 'Collapse section' })
		: t('common:form.expandSection', { defaultValue: 'Expand section' });
	const content = (
		<>
			{props.collapsible ? <IconChevronDown size={18} aria-hidden='true' className={classes.chevron} /> : null}
			{hasTitle ? <span className={classes.titleText}>{props.title}</span> : null}
		</>
	);
	const inner = props.collapsible ? (
		<UnstyledButton
			className={clsx(classes.toggle, classes.toggleButton)} onClick={props.onToggle}
			aria-expanded={props.expanded} aria-label={hasTitle ? undefined : toggleLabel}
			{...props.toggleAttrs}
		>
			{content}
		</UnstyledButton>
	) : <div className={classes.toggle}>{content}</div>;

	return (
		<div className={clsx(classes.header, !props.expanded && classes.headerCollapsed)}>
			{hasTitle ? (
				<Title order={2} id={props.titleId} className={classes.main}>{inner}</Title>
			) : props.collapsible ? <div className={classes.main}>{inner}</div> : null}
			{props.rightSegment ? <div className={classes.rightSegment}>{props.rightSegment}</div> : null}
		</div>
	);
}
