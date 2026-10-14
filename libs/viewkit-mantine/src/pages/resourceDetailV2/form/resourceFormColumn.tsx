import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { useResourceFormView } from '../../../components/resourceFormViewContext';
import { RESOURCE_CREATE_FORM_V2, RESOURCE_FORM_V2, RESOURCE_FORM_COLUMN_V2 } from '../../../ids';
import { ownPropertySectionSchema } from '../../resourceDetail/props';
import { ResourceCreateContext } from '../resourceCreateContext';
import { ResourceCreateBlock } from '../resourceCreateParts';
import { ResourceUpdateContext } from '../resourceUpdateContext';
import { OwnPropertiesBlock } from '../resourceUpdateParts';

import type { OwnPropertySection } from '../../resourceDetail/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormColumnV2Renderer: IComponentRenderer<OwnPropertySection> = {
	type: RESOURCE_FORM_COLUMN_V2,
	propsSchema: ownPropertySectionSchema,
	render(props) {
		// Anchored: the column renders a shared block component, and nothing at all off-form.
		return (
			<ComponentAnchor id={RESOURCE_FORM_COLUMN_V2}>
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
			`"${RESOURCE_FORM_COLUMN_V2}" must be rendered inside a `
			+ `"${RESOURCE_FORM_V2}" or "${RESOURCE_CREATE_FORM_V2}".`,
		);
		return null;
	}

	if (createContext && !updateContext) {
		return <ResourceCreateBlock block={block} isLoading={runtime.isLoading} />;
	}

	// `view` carries the page-wide edit-mode toggle, which only the update form provides.
	if (!updateContext || !view) {
		console.warn(`"${RESOURCE_FORM_COLUMN_V2}" must be rendered inside a "${RESOURCE_FORM_V2}".`);
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
