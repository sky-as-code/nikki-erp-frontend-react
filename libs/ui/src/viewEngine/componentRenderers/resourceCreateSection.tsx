import { Collapse, Stack } from '@mantine/core';
import React from 'react';

import type { ComponentRenderContext, IComponentRenderer } from './IComponentRenderer';
import { RenderComponentTree } from './renderComponent';
import { useCrudFormRuntime } from '../../components/form';
import classes from '../templates/ResourceDetail.module.css';
import { ResourceCreateActionBar } from '../templates/resourceCreateParts';
import { PaperWithBorder } from '../templates/resourceUpdateParts';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_CREATE_SECTION = 'resource_create__section';

type ResourceCreateSectionProps = {
	expanded?: boolean,
	transitionDuration?: number,
	transitionTimingFunction?: string,
};

export const resourceCreateSectionRenderer: IComponentRenderer = {
	type: RESOURCE_CREATE_SECTION,
	render(node, ctx) {
		return <ResourceCreateSection node={node} ctx={ctx} />;
	},
};

function ResourceCreateSection({ node, ctx }: {
	node: ComponentNode,
	ctx: ComponentRenderContext,
}): React.ReactNode {
	const props = (node.props ?? {}) as ResourceCreateSectionProps;
	const [expanded, setExpanded] = React.useState(props.expanded ?? true);
	const runtime = useCrudFormRuntime();
	const onSaveClick = runtime ? runtime.handleSubmit() : () => undefined;

	return (
		<Stack component={PaperWithBorder} gap='md'>
			<ResourceCreateActionBar
				expanded={expanded}
				onToggleCollapse={() => setExpanded(prev => !prev)}
				onSaveClick={onSaveClick}
				isLoading={runtime?.isLoading ?? false}
			/>
			<Collapse
				expanded={expanded}
				transitionDuration={props.transitionDuration ?? 500}
				transitionTimingFunction={props.transitionTimingFunction ?? 'ease-in-out'}
				className={classes.containerInlineSize}
			>
				<div className={classes.formBlockWrapper}>
					<RenderComponentTree nodes={node.children} ctx={ctx.ctx} />
				</div>
			</Collapse>
		</Stack>
	);
}
