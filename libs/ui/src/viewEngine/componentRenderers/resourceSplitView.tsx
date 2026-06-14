import type { ComponentRenderContext, IComponentRenderer } from './IComponentRenderer';
import { adaptResourceDetailProps } from '../templates/ResourceDetail';
import { ResourceDetailMeta } from '../templates/ResourceDetailMeta';
import { adaptResourceListProps, ResourceList } from '../templates/ResourceList';
import { SplitViewBody } from '../templates/ResourceSplitView';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_SPLIT_VIEW = 'resource_split_view';

type ResourceSplitViewNodeProps = {
	primary?: Record<string, unknown>,
	secondary?: Record<string, unknown>,
	routePath?: string,
};

export const resourceSplitViewRenderer: IComponentRenderer = {
	type: RESOURCE_SPLIT_VIEW,
	render(node, ctx) {
		return <ResourceSplitViewComponent node={node} ctx={ctx} />;
	},
};

function ResourceSplitViewComponent({ node, ctx }: {
	node: ComponentNode,
	ctx: ComponentRenderContext,
}): React.ReactNode {
	const props = (node.props ?? {}) as ResourceSplitViewNodeProps;
	const primaryParams = adaptResourceListProps(props.primary, ctx.ctx).params;
	const secondaryParams = adaptResourceDetailProps(props.secondary, ctx.ctx).params;
	const routePath = props.routePath ?? '';

	return (
		<SplitViewBody
			primary={<ResourceList routePath={routePath} params={primaryParams} />}
			secondary={<ResourceDetailMeta params={secondaryParams} />}
		/>
	);
}
