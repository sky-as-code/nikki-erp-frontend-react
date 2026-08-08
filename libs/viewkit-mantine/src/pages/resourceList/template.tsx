import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceListPropsSchema } from './props';
import { ResourceList } from './ResourceList';
import { RESOURCE_LIST_TEMPLATE } from '../../ids';

import type { ResourceListProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceListTemplate: IPageTemplate<ResourceListProps> = {
	id: RESOURCE_LIST_TEMPLATE,
	propsSchema: resourceListPropsSchema,
	render: (params, runtime) => (
		<PageAnchor id={RESOURCE_LIST_TEMPLATE}>
			<ResourceList params={params} routePath={runtime.routePath} />
		</PageAnchor>
	),
};
