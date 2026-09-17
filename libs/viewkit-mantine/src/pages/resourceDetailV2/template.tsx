import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceDetailV2PropsSchema } from './props';
import { ResourceDetailV2 } from './ResourceDetailV2';
import { RESOURCE_DETAIL_V2_TEMPLATE } from '../../ids';

import type { ResourceDetailV2Props } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export const resourceDetailV2Template: IPageTemplate<ResourceDetailV2Props> = {
	id: RESOURCE_DETAIL_V2_TEMPLATE,
	propsSchema: resourceDetailV2PropsSchema,
	/** Page-level `children` win over anything the props already carried. */
	createProps: (params: ResourceDetailV2Props, childrenNodes?: ComponentNode[]) => (
		childrenNodes?.length ? { ...params, childrenNodes } : params
	),
	render: (params, runtime) => (
		<PageAnchor id={RESOURCE_DETAIL_V2_TEMPLATE}>
			<ResourceDetailV2 params={params} childrenNodes={runtime.childrenNodes} />
		</PageAnchor>
	),
};
