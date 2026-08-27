import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { TaxSimulatorPage } from './TaxSimulatorPage';
import { TAX_SIMULATOR_TEMPLATE } from '../ids';
import { taxSimulatorPropsSchema } from '../props';

import type { TaxSimulatorProps } from '../props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const taxSimulatorTemplate: IPageTemplate<TaxSimulatorProps> = {
	id: TAX_SIMULATOR_TEMPLATE,
	propsSchema: taxSimulatorPropsSchema,
	/**
	 * No extra route segment and no route params: the simulator prices a hypothetical document
	 * the user types in, so there is no record for the URL to identify.
	 */
	render: params => (
		<PageAnchor id={TAX_SIMULATOR_TEMPLATE}>
			<TaxSimulatorPage props={params} />
		</PageAnchor>
	),
};
