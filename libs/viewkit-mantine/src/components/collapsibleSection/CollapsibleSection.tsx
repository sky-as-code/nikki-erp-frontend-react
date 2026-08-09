import { Collapse, Group, Stack, Title, UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import classes from './CollapsibleSection.module.css';
import { collapsibleSectionPropsSchema, CollapsibleSectionProps } from './props';
import { COLLAPSIBLE_SECTION } from '../../ids';
import { PaperWithBorder } from '../paperWithBorder';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * A general-purpose bordered block, optionally titled and collapsible.
 *
 * It touches no form context, so it is safe anywhere in a page tree — including as an appended
 * section of a resource detail page. The resource form's own section, which carries that form's
 * `SectionActionBar`, is `resource_form__section` and is emitted by `ResourceUpdate` alone.
 */
export const collapsibleSectionRenderer: IComponentRenderer<CollapsibleSectionProps> = {
	type: COLLAPSIBLE_SECTION,
	propsSchema: collapsibleSectionPropsSchema,
	render(props, runtime) {
		return <CollapsibleSection props={props} runtime={runtime} />;
	},
};

function CollapsibleSection({ props, runtime }: {
	props: CollapsibleSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);

	return (
		<Stack component={PaperWithBorder} gap='md' {...componentAttrs(COLLAPSIBLE_SECTION)}>
			{props.header != null ? (
				<SectionHeader
					header={props.header}
					translationNs={props.translationNs ?? ''}
					collapsible={props.collapsible}
					expanded={expanded}
					onToggle={() => setExpanded(prev => !prev)}
					testId={props.testId}
				/>
			) : null}
			{props.collapsible ? (
				<Collapse
					expanded={expanded}
					transitionDuration={props.transitionDuration}
					transitionTimingFunction={props.transitionTimingFunction}
				>
					<MetaComponent node={runtime.children} />
				</Collapse>
			) : (
				<MetaComponent node={runtime.children} />
			)}
		</Stack>
	);
}

function SectionHeader({ header, translationNs, collapsible, expanded, onToggle, testId }: {
	header: string,
	translationNs: string,
	collapsible: boolean,
	expanded: boolean,
	onToggle: () => void,
	testId?: string,
}): React.ReactNode {
	// The schema guarantees a namespace wherever a header exists, so this never resolves blank.
	const t = useTranslate(translationNs);
	if (!collapsible) {
		return (
			<Group gap='xs'>
				<Title order={4}>{t(header)}</Title>
			</Group>
		);
	}

	return (
		<UnstyledButton
			className={classes.collapsibleHeader} onClick={onToggle} aria-expanded={expanded}
			{...testAttrs(testId ?? 'ui.collapsibleSection', header, 'toggle')}
		>
			<Group gap='xs'>
				{expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
				<Title order={4}>{t(header)}</Title>
			</Group>
		</UnstyledButton>
	);
}
