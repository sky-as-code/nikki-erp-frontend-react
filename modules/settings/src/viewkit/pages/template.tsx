import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { SettingsPage } from './SettingsPage';
import { SETTINGS_PAGE_TEMPLATE } from '../ids';
import { settingsPagePropsSchema } from '../props';

import type { SettingsPageProps } from '../props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const settingsPageTemplate: IPageTemplate<SettingsPageProps> = {
	id: SETTINGS_PAGE_TEMPLATE,
	propsSchema: settingsPagePropsSchema,
	/**
	 * No extra route segment: every pane lives at the same URL, so `node.routePath` is used
	 * verbatim. The active pane is React state, which means a pane is not linkable and a reload
	 * returns to the first entry -- the accepted trade-off for this page. Making one linkable is
	 * a `routePattern` here plus a `useParams` read in the page, and nothing else.
	 */
	render: params => (
		<PageAnchor id={SETTINGS_PAGE_TEMPLATE}>
			<SettingsPage props={params} />
		</PageAnchor>
	),
};
