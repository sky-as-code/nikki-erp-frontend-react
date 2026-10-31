import { Collapse, Paper } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import classes from './FormPanel.module.css';
import { COLLAPSIBLE_SECTION } from '../../ids';
import { useSectionTitle } from '../../pages/resourceDetail/sectionTitle';
import { SectionHeader } from '../collapsibleSection/SectionHeader';
import shellClasses from '../collapsibleSection/SectionShell.module.css';

import type { CollapsibleSectionProps } from '../collapsibleSection/props';
import type { ComponentRenderRuntime } from '@nikkierp/viewengine/core';


/**
 * `collapsible_section` under `layout: 'formBlocks'`: the panel a resource form's columns sit in.
 *
 * The Paper is the container the sections' and the header's container queries measure, so the
 * layout follows the panel's own width -- a split view's pane or a drawer -- never the viewport.
 */
export function FormPanel({ props, runtime }: {
	props: CollapsibleSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const titleId = React.useId();
	const t = useTranslate(props.translationNs ?? '');
	const title = useSectionTitle(props.header, t);
	const hasHeader = props.collapsible || title != null || props.rightSegment != null;
	const body = (
		<div className={classes.sections}>
			<MetaComponent node={runtime.children} />
		</div>
	);

	return (
		<Paper
			withBorder radius='md' className={shellClasses.panel}
			aria-labelledby={title != null ? titleId : undefined}
			{...componentAttrs(COLLAPSIBLE_SECTION)}
		>
			{hasHeader ? (
				<SectionHeader
					title={title} titleId={titleId} collapsible={props.collapsible}
					expanded={expanded} onToggle={() => setExpanded(prev => !prev)}
					toggleAttrs={testAttrs(props.testId ?? 'ui.collapsibleSection', props.header, 'toggle')}
					rightSegment={props.rightSegment ? <MetaComponent node={props.rightSegment} /> : null}
				/>
			) : null}
			{props.collapsible ? (
				<Collapse
					expanded={expanded}
					transitionDuration={props.transitionDuration}
					transitionTimingFunction={props.transitionTimingFunction}
				>
					{body}
				</Collapse>
			) : body}
		</Paper>
	);
}
