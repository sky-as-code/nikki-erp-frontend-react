import { PageAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { RoleAssignmentPage } from './RoleAssignmentPage';
import { ROLE_ASSIGNMENT_TEMPLATE } from '../ids';
import { roleAssignmentPropsSchema } from '../props';

import type { RoleAssignmentProps } from '../props';
import type { IPageTemplate } from '@nikkierp/viewengine/core';


export const roleAssignmentTemplate: IPageTemplate<RoleAssignmentProps> = {
	id: ROLE_ASSIGNMENT_TEMPLATE,
	propsSchema: roleAssignmentPropsSchema,
	/**
	 * No extra route segment: both stages live at the same URL, so `node.routePath` is used
	 * verbatim. The principal id comes from the authored path (`users/:id/roles`), which the
	 * page reads with `useParams` — the engine exposes no param hook of its own.
	 */
	render: params => (
		<PageAnchor id={ROLE_ASSIGNMENT_TEMPLATE}>
			<RoleAssignmentPage props={params} />
		</PageAnchor>
	),
};
