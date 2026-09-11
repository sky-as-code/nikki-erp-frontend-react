import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceImportPropsSchema } from './props';
import { ResourceImport } from './ResourceImport';
import { RESOURCE_IMPORT_TEMPLATE } from '../../ids';

import type { ResourceImportProps } from './props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const resourceImportTemplate: IPageTemplate<ResourceImportProps> = {
	id: RESOURCE_IMPORT_TEMPLATE,
	propsSchema: resourceImportPropsSchema,
	render: (params, runtime) => (
		<PageAnchor id={RESOURCE_IMPORT_TEMPLATE}>
			<ResourceImport params={params} routePath={runtime.routePath} />
		</PageAnchor>
	),
};
