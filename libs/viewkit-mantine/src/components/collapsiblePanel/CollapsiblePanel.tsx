import { Collapse, Group, Stack, Title, UnstyledButton } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { collapsiblePanelPropsSchema, CollapsiblePanelProps } from './props';
import { COLLAPSIBLE_PANEL } from '../../ids';
import classes from '../../pages/resourceDetail/ResourceDetail.module.css';
import { PaperWithBorder } from '../../pages/resourceDetail/resourceUpdateParts';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * A titled, self-contained collapsible block.
 *
 * Deliberately *not* `collapsible_section`: that one is the resource form's own
 * section and renders a `SectionActionBar` wired to the enclosing form's state,
 * so nesting it yields a second action bar whose Save submits the parent form.
 * This panel touches no form context and is safe anywhere in a page tree.
 */
export const collapsiblePanelRenderer: IComponentRenderer<CollapsiblePanelProps> = {
	type: COLLAPSIBLE_PANEL,
	propsSchema: collapsiblePanelPropsSchema,
	render(props, runtime) {
		return <CollapsiblePanel props={props} runtime={runtime} />;
	},
};

function CollapsiblePanel({ props, runtime }: {
	props: CollapsiblePanelProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const t = useTranslate(props.translationNs);

	return (
		<Stack component={PaperWithBorder} gap='md'>
			<UnstyledButton
				className={classes.collapsibleHeader}
				onClick={() => setExpanded(prev => !prev)}
				aria-expanded={expanded}
			>
				<Group gap='xs' pt='md'>
					{expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
					<Title order={4}>{t(props.header)}</Title>
				</Group>
			</UnstyledButton>
			<Collapse
				expanded={expanded}
				transitionDuration={props.transitionDuration}
				transitionTimingFunction={props.transitionTimingFunction}
			>
				<MetaComponent node={runtime.children} />
			</Collapse>
		</Stack>
	);
}
