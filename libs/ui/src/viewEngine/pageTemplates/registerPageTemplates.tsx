import React from 'react';

import {
	getPageTemplate, registerPageTemplate, RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE,
	RESOURCE_SPLIT_VIEW_TEMPLATE,
} from './registry';
import { ResourceDetail, ResourceDetailTemplateProps } from '../templates/ResourceDetail';
import { ResourceList, ResourceListTemplateProps } from '../templates/ResourceList';
import { ResourceSplitViewTemplateProps } from '../templates/ResourceSplitView';
import { ResourceSplitViewMeta } from '../templates/ResourceSplitViewMeta';


export { getPageTemplate, registerPageTemplate };

registerPageTemplate<ResourceListTemplateProps>({
	id: RESOURCE_LIST_TEMPLATE,
	createProps: (json) => requireListProps(json),
	render: (props, runtime) => <ResourceList params={props.params} routePath={runtime.routePath} />,
});

registerPageTemplate<ResourceDetailTemplateProps>({
	id: RESOURCE_DETAIL_TEMPLATE,
	createProps: (json, childrenNodes) => requireDetailProps(json, childrenNodes),
	render: (props, runtime) => <ResourceDetail params={props.params} childrenNodes={runtime.childrenNodes} />,
});

registerPageTemplate<ResourceSplitViewTemplateProps>({
	id: RESOURCE_SPLIT_VIEW_TEMPLATE,
	createProps: (json) => requireSplitViewProps(json),
	render: (props, runtime) => <ResourceSplitViewMeta params={props.params} routePath={runtime.routePath} />,
});

function requireListProps(json: unknown): ResourceListTemplateProps {
	if (!(json instanceof ResourceListTemplateProps)) {
		throw new Error('Page props must be a ResourceListTemplateProps instance.');
	}
	return json;
}

function requireDetailProps(
	json: unknown,
	childrenNodes?: ResourceDetailTemplateProps['params']['childrenNodes'],
): ResourceDetailTemplateProps {
	if (json instanceof ResourceDetailTemplateProps) {
		if (!childrenNodes || childrenNodes.length === 0) {
			return json;
		}
		return new ResourceDetailTemplateProps({ ...json.params, childrenNodes });
	}
	throw new Error('Page props must be a ResourceDetailTemplateProps instance.');
}

function requireSplitViewProps(json: unknown): ResourceSplitViewTemplateProps {
	if (!(json instanceof ResourceSplitViewTemplateProps)) {
		throw new Error('Page props must be a ResourceSplitViewTemplateProps instance.');
	}
	return json;
}
