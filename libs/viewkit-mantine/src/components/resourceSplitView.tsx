import { renderTemplateRef } from '@nikkierp/viewengine/render';
import { templateRefSchema } from '@nikkierp/viewengine/schema';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_SPLIT_VIEW } from '../ids';
import { SplitViewBody } from '../pages/resourceSplitView/SplitViewBody';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceSplitViewComponentPropsSchema = z.object({
	primary: templateRefSchema,
	secondary: templateRefSchema,
	routePath: z.string().default(''),
}).strict();

export type ResourceSplitViewComponentProps = z.infer<typeof resourceSplitViewComponentPropsSchema>;

/**
 * Inline split view for use inside a custom page. Both panes are template refs
 * resolved through the same engine, which replaces the previous pair of
 * `instanceof` checks -- those could never succeed across a bundle boundary.
 */
export const resourceSplitViewRenderer: IComponentRenderer<ResourceSplitViewComponentProps> = {
	type: RESOURCE_SPLIT_VIEW,
	propsSchema: resourceSplitViewComponentPropsSchema,
	render(props, runtime) {
		const pageRuntime = { routePath: props.routePath, engine: runtime.engine };
		return (
			<SplitViewBody
				primary={renderTemplateRef(props.primary, pageRuntime)}
				secondary={renderTemplateRef(props.secondary, pageRuntime)}
			/>
		);
	},
};
