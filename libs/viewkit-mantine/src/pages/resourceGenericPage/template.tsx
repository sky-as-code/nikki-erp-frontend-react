import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceGenericPagePropsSchema } from './props';
import { ResourceGenericPage } from './ResourceGenericPage';
import { RESOURCE_GENERIC_PAGE_TEMPLATE } from '../../ids';

import type { ResourceGenericPageProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceGenericPageTemplate: IPageTemplate<ResourceGenericPageProps> = {
	id: RESOURCE_GENERIC_PAGE_TEMPLATE,
	propsSchema: resourceGenericPagePropsSchema,
	render: (params, runtime) => (
		<PageAnchor id={RESOURCE_GENERIC_PAGE_TEMPLATE}>
			<ResourceGenericPage
				params={params}
				childrenNodes={runtime.childrenNodes}
				routePath={runtime.routePath}
			/>
		</PageAnchor>
	),
};
