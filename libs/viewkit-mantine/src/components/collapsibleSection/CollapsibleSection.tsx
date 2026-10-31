import { Collapse, Paper } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { collapsibleSectionPropsSchema, CollapsibleSectionProps } from './props';
import { SectionHeader } from './SectionHeader';
import classes from './SectionShell.module.css';
import { COLLAPSIBLE_SECTION } from '../../ids';
import { useSectionTitle } from '../../pages/resourceDetail/sectionTitle';
import { FormPanel } from '../formPanel/FormPanel';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * A general-purpose bordered block, optionally titled and collapsible. The collapse toggle caret
 * renders whether or not a `header` is set -- an untitled block collapses by its bare caret --
 * unless a caller opts out with `collapsible: false`.
 *
 * It touches no form context, so it is safe anywhere in a page tree — including as the section a
 * resource detail page wraps its `resource_form__column`s in, which is what `layout: 'formBlocks'`
 * is for. Both layouts share the frame and header (`SectionHeader`); only the body differs.
 */
export const collapsibleSectionRenderer: IComponentRenderer<CollapsibleSectionProps> = {
	type: COLLAPSIBLE_SECTION,
	propsSchema: collapsibleSectionPropsSchema,
	render(props, runtime) {
		if (props.layout === 'formBlocks') {
			return <FormPanel props={props} runtime={runtime} />;
		}
		return <CollapsibleSection props={props} runtime={runtime} />;
	},
};

function CollapsibleSection({ props, runtime }: {
	props: CollapsibleSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const titleId = React.useId();
	// The schema guarantees a namespace wherever a header exists, so this never resolves blank.
	const t = useTranslate(props.translationNs ?? '');
	const title = useSectionTitle(props.header, t);
	const hasHeader = props.collapsible || title != null || props.rightSegment != null;
	const body = <div className={classes.body}><MetaComponent node={runtime.children} /></div>;

	return (
		<Paper
			withBorder radius='md' className={classes.panel}
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
