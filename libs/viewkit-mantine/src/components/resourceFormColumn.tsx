import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { RESOURCE_CREATE_FORM, RESOURCE_FORM, RESOURCE_FORM_COLUMN } from '../ids';
import { useResourceFormView } from './resourceFormViewContext';
import { ownPropertySectionSchema } from '../pages/resourceDetail/props';
import { ResourceCreateContext } from '../pages/resourceDetail/resourceCreateContext';
import { ResourceCreateBlock } from '../pages/resourceDetail/resourceCreateParts';
import { ResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';
import { OwnPropertiesBlock } from '../pages/resourceDetail/resourceUpdateParts';

import type { OwnPropertySection } from '../pages/resourceDetail/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormColumnRenderer: IComponentRenderer<OwnPropertySection> = {
	type: RESOURCE_FORM_COLUMN,
	propsSchema: ownPropertySectionSchema,
	render(props) {
		// Anchored: the column renders a shared block component, and nothing at all off-form.
		return (
			<ComponentAnchor id={RESOURCE_FORM_COLUMN}>
				<ResourceFormColumn block={props} />
			</ComponentAnchor>
		);
	},
};

/**
 * One column of own properties, in **either** form mode.
 *
 * A page declares its field blocks once and passes the same nodes to `createNodes` and
 * `childrenNodes`, so this renderer has to serve both: under `resource_create__form` there is no
 * record and no edit-mode toggle (every field is editable, and visibility is judged against
 * `create` rather than `update`), which is what `ResourceCreateBlock` already encodes. The mode is
 * read from which context provider is above us rather than from a prop, so a page never has to
 * state it.
 *
 * Both context reads are optional -- `useResourceUpdateContext`/`useResourceCreateContext` throw
 * when their provider is absent, and here exactly one of the two always is.
 */
function ResourceFormColumn({ block }: { block: OwnPropertySection }): React.ReactNode {
	const runtime = useCrudFormRuntime();
	const view = useResourceFormView();
	const updateContext = React.useContext(ResourceUpdateContext);
	const createContext = React.useContext(ResourceCreateContext);

	if (!runtime) {
		console.warn(
			`"${RESOURCE_FORM_COLUMN}" must be rendered inside a `
			+ `"${RESOURCE_FORM}" or "${RESOURCE_CREATE_FORM}".`,
		);
		return null;
	}

	if (createContext && !updateContext) {
		return <ResourceCreateBlock block={block} isLoading={runtime.isLoading} />;
	}

	// `view` carries the page-wide edit-mode toggle, which only the update form provides.
	if (!updateContext || !view) {
		console.warn(`"${RESOURCE_FORM_COLUMN}" must be rendered inside a "${RESOURCE_FORM}".`);
		return null;
	}

	return (
		<OwnPropertiesBlock
			block={block}
			isLoading={runtime.isLoading}
			fieldValues={(updateContext.resource ?? {}) as Record<string, unknown>}
			updateMode={view.updateMode}
		/>
	);
}
