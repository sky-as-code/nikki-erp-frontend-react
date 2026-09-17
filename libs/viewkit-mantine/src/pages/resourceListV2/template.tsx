import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceListV2PropsSchema } from './props';
import { ResourceListV2 } from './ResourceListV2';
import { RESOURCE_LIST_V2_TEMPLATE } from '../../ids';

import type { ResourceListV2Props } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceListV2Template: IPageTemplate<ResourceListV2Props> = {
	id: RESOURCE_LIST_V2_TEMPLATE,
	propsSchema: resourceListV2PropsSchema,
	render: (params, runtime) => (
		<PageAnchor id={RESOURCE_LIST_V2_TEMPLATE}>
			<ResourceListV2 params={params} routePath={runtime.routePath} />
		</PageAnchor>
	),
};
