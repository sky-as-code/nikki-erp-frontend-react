import { LinkModeScope } from '@nikkierp/ui/breadcrumbs';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { RELATED_TABLE } from '../../ids';
import { relatedResourceSchema } from '../../pages/resourceDetailV2/props';
import { RelatedResourceTable } from '../../pages/resourceDetailV2/RelatedResourcesTabs';

import type { RelatedResource } from '../../pages/resourceDetailV2/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/** A related resource's embedded table outside the tabs; its links lead deeper, as the tabs' do. */
export const relatedTableRenderer: IComponentRenderer<RelatedResource> = {
	type: RELATED_TABLE,
	propsSchema: relatedResourceSchema,
	render(props) {
		return (
			<ComponentAnchor id={RELATED_TABLE}>
				<LinkModeScope mode='append'>
					<RelatedResourceTable resource={props} />
				</LinkModeScope>
			</ComponentAnchor>
		);
	},
};
