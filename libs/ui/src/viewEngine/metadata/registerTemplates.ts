import {
	AdapterContext, registerTemplate, RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE,
} from './registry';
import { adaptResourceDetailProps, ResourceDetail } from '../templates/ResourceDetail';
import { adaptResourceListProps, ResourceList } from '../templates/ResourceList';
import { ResourceSplitView } from '../templates/ResourceSplitView';


registerTemplate(RESOURCE_LIST_TEMPLATE, {
	Component: ResourceList,
	adaptProps: adaptResourceListProps,
});

registerTemplate(RESOURCE_DETAIL_TEMPLATE, {
	Component: ResourceDetail,
	adaptProps: (json, ctx) => adaptResourceDetailProps(json, ctx),
});

registerTemplate(RESOURCE_SPLIT_VIEW_TEMPLATE, {
	Component: ResourceSplitView,
	adaptProps: adaptSplitViewProps,
});

function adaptSplitViewProps(json: Record<string, unknown> | undefined, ctx: AdapterContext) {
	const props = (json ?? {}) as {
		primary?: Record<string, unknown>,
		secondary?: Record<string, unknown>,
	};
	return {
		primaryProps: adaptResourceListProps(props.primary, ctx),
		secondaryProps: adaptResourceDetailProps(props.secondary, ctx),
	};
}
