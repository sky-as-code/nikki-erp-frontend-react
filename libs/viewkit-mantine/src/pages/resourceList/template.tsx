import React from 'react';

import { resourceListPropsSchema } from './props';
import { ResourceList } from './ResourceList';
import { RESOURCE_LIST_TEMPLATE } from '../../ids';

import type { ResourceListProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceListTemplate: IPageTemplate<ResourceListProps> = {
	id: RESOURCE_LIST_TEMPLATE,
	propsSchema: resourceListPropsSchema,
	render: (params, runtime) => <ResourceList params={params} routePath={runtime.routePath} />,
};
