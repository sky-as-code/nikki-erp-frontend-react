import { renderTemplateRef } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceSplitViewPropsSchema } from './props';
import { SplitViewBody } from './SplitViewBody';
import { RESOURCE_SPLIT_VIEW_TEMPLATE } from '../../ids';

import type { ResourceSplitViewProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceSplitViewTemplate: IPageTemplate<ResourceSplitViewProps> = {
	id: RESOURCE_SPLIT_VIEW_TEMPLATE,
	propsSchema: resourceSplitViewPropsSchema,
	/**
	 * The optional `:id` segment is contributed here, by the template that needs
	 * it -- the engine core no longer special-cases this template's id.
	 */
	routePattern: node => `${node.routePath}/:id?`,
	render: (params, runtime) => (
		<SplitViewBody
			primary={renderTemplateRef(params.primary, runtime)}
			secondary={renderTemplateRef(params.secondary, runtime)}
		/>
	),
};
