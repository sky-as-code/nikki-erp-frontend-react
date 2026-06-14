import React from 'react';

import type { IComponentRenderer } from './IComponentRenderer';
import { ResourceUpdateHeader, ResourceUpdateHeaderProps } from '../templates/resourceUpdateParts';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_DETAIL_HEADER = 'resource_detail__header';

export const resourceDetailHeaderRenderer: IComponentRenderer = {
	type: RESOURCE_DETAIL_HEADER,
	render(node: ComponentNode) {
		const props = (node.props ?? {}) as ResourceUpdateHeaderProps;
		return (
			<ResourceUpdateHeader
				titleLvl1={props.titleLvl1}
				titleLvl2={props.titleLvl2}
				titleLvl3={props.titleLvl3}
			/>
		);
	},
};
