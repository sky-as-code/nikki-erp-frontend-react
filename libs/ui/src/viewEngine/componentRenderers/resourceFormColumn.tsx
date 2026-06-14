import React from 'react';

import type { IComponentRenderer } from './IComponentRenderer';
import { useResourceFormView } from './resourceFormViewContext';
import { useCrudFormRuntime } from '../../components/form';
import { useResourceUpdateContext } from '../templates/resourceUpdateContext';
import { OwnPropertiesBlock } from '../templates/resourceUpdateParts';

import type { OwnPropertySection } from '../templates/ResourceDetail';
import type { ComponentNode } from '../metadata/types';


export const RESOURCE_FORM_COLUMN = 'resource_form__column';

export const resourceFormColumnRenderer: IComponentRenderer = {
	type: RESOURCE_FORM_COLUMN,
	render(node) {
		return <ResourceFormColumn node={node} />;
	},
};

function ResourceFormColumn({ node }: { node: ComponentNode }): React.ReactNode {
	const block = (node.props ?? {}) as OwnPropertySection;
	const runtime = useCrudFormRuntime();
	const view = useResourceFormView();
	const { resource } = useResourceUpdateContext();

	if (!runtime || !view) {
		console.warn(`"${RESOURCE_FORM_COLUMN}" must be rendered inside a "resource_form".`);
		return null;
	}

	return (
		<OwnPropertiesBlock
			block={block}
			isLoading={runtime.isLoading}
			fieldValues={(resource ?? {}) as Record<string, unknown>}
			updateMode={view.updateMode}
		/>
	);
}
