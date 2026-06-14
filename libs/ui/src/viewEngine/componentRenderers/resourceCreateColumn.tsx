import { useCrudFormRuntime } from '../../components/form';
import { ResourceCreateBlock } from '../templates/resourceCreateParts';

import type { IComponentRenderer } from './IComponentRenderer';
import type { ComponentNode } from '../metadata/types';
import type { OwnPropertySection } from '../templates/ResourceDetail';


export const RESOURCE_CREATE_COLUMN = 'resource_create__column';

export const resourceCreateColumnRenderer: IComponentRenderer = {
	type: RESOURCE_CREATE_COLUMN,
	render(node) {
		return <ResourceCreateColumn node={node} />;
	},
};

function ResourceCreateColumn({ node }: { node: ComponentNode }): React.ReactNode {
	const block = (node.props ?? {}) as OwnPropertySection;
	const runtime = useCrudFormRuntime();

	if (!runtime) {
		console.warn(`"${RESOURCE_CREATE_COLUMN}" must be rendered inside a "resource_create__form".`);
		return null;
	}

	return <ResourceCreateBlock block={block} isLoading={runtime.isLoading} />;
}
