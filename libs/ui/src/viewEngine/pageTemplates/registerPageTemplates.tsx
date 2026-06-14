import React from 'react';

import {
	getPageTemplate, registerPageTemplate, RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE,
	RESOURCE_SPLIT_VIEW_TEMPLATE,
} from './registry';
import { adaptResourceDetailProps, ResourceDetailTemplateProps } from '../templates/ResourceDetail';
import { ResourceDetailMeta } from '../templates/ResourceDetailMeta';
import { adaptResourceListProps, ResourceList, ResourceListTemplateProps } from '../templates/ResourceList';
import { ResourceSplitViewParams, ResourceSplitViewTemplateProps } from '../templates/ResourceSplitView';
import { ResourceSplitViewMeta } from '../templates/ResourceSplitViewMeta';

import type { AdapterContext } from '../metadata/registry';


export { getPageTemplate, registerPageTemplate };

registerPageTemplate<ResourceListTemplateProps>({
	id: RESOURCE_LIST_TEMPLATE,
	createProps: (json, ctx) => adaptResourceListProps(json, ctx),
	render: (props, runtime) => <ResourceList params={props.params} routePath={runtime.routePath} />,
});

registerPageTemplate<ResourceDetailTemplateProps>({
	id: RESOURCE_DETAIL_TEMPLATE,
	createProps: (json, ctx) => adaptResourceDetailProps(json, ctx),
	render: (props, runtime) => <ResourceDetailMeta params={props.params} childrenNodes={runtime.childrenNodes} />,
});

registerPageTemplate<ResourceSplitViewTemplateProps>({
	id: RESOURCE_SPLIT_VIEW_TEMPLATE,
	createProps: (json, ctx) => new ResourceSplitViewTemplateProps(adaptSplitViewProps(json, ctx)),
	render: (props, runtime) => <ResourceSplitViewMeta params={props.params} routePath={runtime.routePath} />,
});

function adaptSplitViewProps(
	json: Record<string, unknown> | undefined,
	ctx: AdapterContext,
): ResourceSplitViewParams {
	const props = (json ?? {}) as { primary?: Record<string, unknown>, secondary?: Record<string, unknown> };
	return {
		primaryProps: adaptResourceListProps(props.primary, ctx),
		secondaryProps: adaptResourceDetailProps(props.secondary, ctx),
	};
}
