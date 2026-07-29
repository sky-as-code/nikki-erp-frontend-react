import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import React from 'react';

import { RESOURCE_FORM, RESOURCE_FORM_COLUMN } from '../ids';
import { useResourceFormView } from './resourceFormViewContext';
import { ownPropertySectionSchema } from '../pages/resourceDetail/props';
import { useResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';
import { OwnPropertiesBlock } from '../pages/resourceDetail/resourceUpdateParts';

import type { OwnPropertySection } from '../pages/resourceDetail/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormColumnRenderer: IComponentRenderer<OwnPropertySection> = {
	type: RESOURCE_FORM_COLUMN,
	propsSchema: ownPropertySectionSchema,
	render(props) {
		return <ResourceFormColumn block={props} />;
	},
};

function ResourceFormColumn({ block }: { block: OwnPropertySection }): React.ReactNode {
	const runtime = useCrudFormRuntime();
	const view = useResourceFormView();
	const { resource } = useResourceUpdateContext();

	if (!runtime || !view) {
		console.warn(`"${RESOURCE_FORM_COLUMN}" must be rendered inside a "${RESOURCE_FORM}".`);
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
