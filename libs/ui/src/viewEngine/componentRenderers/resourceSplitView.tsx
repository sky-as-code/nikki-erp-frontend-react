import type { IComponentRenderer } from './IComponentRenderer';
import { ResourceDetail, ResourceDetailTemplateProps } from '../templates/ResourceDetail';
import { ResourceList, ResourceListTemplateProps } from '../templates/ResourceList';
import { SplitViewBody } from '../templates/ResourceSplitView';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_SPLIT_VIEW = 'resource_split_view';

type ResourceSplitViewNodeProps = {
	primary?: ResourceListTemplateProps,
	secondary?: ResourceDetailTemplateProps,
	routePath?: string,
};

export const resourceSplitViewRenderer: IComponentRenderer = {
	type: RESOURCE_SPLIT_VIEW,
	render(node) {
		return <ResourceSplitViewComponent node={node} />;
	},
};

function ResourceSplitViewComponent({ node }: { node: ComponentNode }): React.ReactNode {
	const props = (node.props ?? {}) as ResourceSplitViewNodeProps;
	const routePath = props.routePath ?? '';

	if (!(props.primary instanceof ResourceListTemplateProps)) {
		throw new Error('Split view primary props must be a ResourceListTemplateProps instance.');
	}
	if (!(props.secondary instanceof ResourceDetailTemplateProps)) {
		throw new Error('Split view secondary props must be a ResourceDetailTemplateProps instance.');
	}

	return (
		<SplitViewBody
			primary={<ResourceList routePath={routePath} params={props.primary.params} />}
			secondary={<ResourceDetail params={props.secondary.params} />}
		/>
	);
}
