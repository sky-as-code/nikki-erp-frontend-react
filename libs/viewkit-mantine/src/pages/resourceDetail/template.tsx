import React from 'react';

import { resourceDetailPropsSchema } from './props';
import { ResourceDetail } from './ResourceDetail';
import { RESOURCE_DETAIL_TEMPLATE } from '../../ids';

import type { ResourceDetailProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export const resourceDetailTemplate: IPageTemplate<ResourceDetailProps> = {
	id: RESOURCE_DETAIL_TEMPLATE,
	propsSchema: resourceDetailPropsSchema,
	/** Page-level `children` win over anything the props already carried. */
	createProps: (params: ResourceDetailProps, childrenNodes?: ComponentNode[]) => (
		childrenNodes?.length ? { ...params, childrenNodes } : params
	),
	render: (params, runtime) => <ResourceDetail params={params} childrenNodes={runtime.childrenNodes} />,
};
