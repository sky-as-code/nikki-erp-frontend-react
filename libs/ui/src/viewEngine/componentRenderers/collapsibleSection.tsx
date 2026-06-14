import { Collapse, Stack } from '@mantine/core';
import React from 'react';

import { RenderComponentTree } from './renderComponent';
import { useResourceFormView } from './resourceFormViewContext';
import { useCrudFormRuntime } from '../../components/form';
import classes from '../templates/ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues } from '../templates/ResourceDetailProvider';
import { PaperWithBorder, SectionActionBar } from '../templates/resourceUpdateParts';

import type { ComponentRenderContext, IComponentRenderer } from './IComponentRenderer';
import type { ComponentNode } from '../metadata/types';


export const COLLAPSIBLE_SECTION = 'collapsible_section';

type CollapsibleSectionProps = {
	expanded?: boolean,
	transitionDuration?: number,
	transitionTimingFunction?: string,
};

export const collapsibleSectionRenderer: IComponentRenderer = {
	type: COLLAPSIBLE_SECTION,
	render(node, ctx) {
		return <CollapsibleSection node={node} ctx={ctx} />;
	},
};

function CollapsibleSection({ node, ctx }: {
	node: ComponentNode,
	ctx: ComponentRenderContext,
}): React.ReactNode {
	const props = (node.props ?? {}) as CollapsibleSectionProps;
	const [expanded, setExpanded] = React.useState(props.expanded ?? true);
	const [localMode, setLocalMode] = React.useState(false);
	const runtime = useCrudFormRuntime();
	const view = useResourceFormView();
	const updateMode = view?.updateMode ?? localMode;
	const setUpdateMode = view?.setUpdateMode ?? setLocalMode;
	const onSaveClick = runtime ? runtime.handleSubmit(printDebugFormValues) : () => undefined;

	return (
		<Stack component={PaperWithBorder} gap='md'>
			<SectionActionBar
				expanded={expanded}
				onToggleCollapse={() => setExpanded(prev => !prev)}
				onSaveClick={onSaveClick}
				isLoading={runtime?.isLoading ?? false}
				updateMode={updateMode}
				setUpdateMode={setUpdateMode}
			/>
			<Collapse
				expanded={expanded}
				transitionDuration={props.transitionDuration ?? 500}
				transitionTimingFunction={props.transitionTimingFunction ?? 'ease-in-out'}
				className={classes.containerInlineSize}
			>
				<DebugFormErrors errors={runtime?.errors ?? {}} />
				<div className={classes.formBlockWrapper}>
					<RenderComponentTree nodes={node.children} ctx={ctx.ctx} />
				</div>
			</Collapse>
		</Stack>
	);
}
