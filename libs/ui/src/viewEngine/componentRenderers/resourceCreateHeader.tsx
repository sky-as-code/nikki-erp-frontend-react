import type { IComponentRenderer } from './IComponentRenderer';
import { ResourceCreateHeader, ResourceCreateHeaderProps } from '../templates/resourceCreateParts';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_CREATE_HEADER = 'resource_create__header';

export const resourceCreateHeaderRenderer: IComponentRenderer = {
	type: RESOURCE_CREATE_HEADER,
	render(node: ComponentNode) {
		const props = (node.props ?? {}) as ResourceCreateHeaderProps;
		return <ResourceCreateHeader titleLvl1={props.titleLvl1} titleLvl3={props.titleLvl3} />;
	},
};
