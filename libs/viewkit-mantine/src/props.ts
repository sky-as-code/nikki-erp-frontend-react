import { RESOURCE_DETAIL_TEMPLATE, RESOURCE_LIST_TEMPLATE, RESOURCE_SPLIT_VIEW_TEMPLATE } from './ids';
import { resourceDetailPropsSchema } from './pages/resourceDetail/props';
import { resourceListPropsSchema } from './pages/resourceList/props';
import { resourceSplitViewPropsSchema } from './pages/resourceSplitView/props';

import type {
	ResourceDetailProps, ResourceDetailPropsInput,
} from './pages/resourceDetail/props';
import type { ResourceListProps, ResourceListPropsInput } from './pages/resourceList/props';
import type { ResourceSplitViewProps } from './pages/resourceSplitView/props';
import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * Typed authoring helpers for this kit's page templates.
 *
 * This module is deliberately React-free and is exposed on its own
 * `@nikkierp/viewkit-mantine/props` subpath: a module's page-definition files
 * need the schemas and builders but must never pull Mantine components into
 * what is supposed to be plain data.
 *
 * Each builder parses eagerly, so a bad page fails where it is authored rather
 * than at render time, and returns a `JSON.stringify`-able object.
 */
export function resourceListProps(input: ResourceListPropsInput): TemplateRef<ResourceListProps> {
	return { template: RESOURCE_LIST_TEMPLATE, props: resourceListPropsSchema.parse(input) };
}

export function resourceDetailProps(input: ResourceDetailPropsInput): TemplateRef<ResourceDetailProps> {
	return { template: RESOURCE_DETAIL_TEMPLATE, props: resourceDetailPropsSchema.parse(input) };
}

export function resourceSplitViewProps(input: {
	primary: TemplateRef<ResourceListProps>,
	secondary: TemplateRef<ResourceDetailProps>,
}): TemplateRef<ResourceSplitViewProps> {
	return { template: RESOURCE_SPLIT_VIEW_TEMPLATE, props: resourceSplitViewPropsSchema.parse(input) };
}

export * from './pages/resourceDetail/props';
export * from './pages/resourceList/props';
export * from './pages/resourceSplitView/props';
export * from './ids';
