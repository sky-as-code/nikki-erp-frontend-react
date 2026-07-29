import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import React from 'react';

import { RESOURCE_CREATE_COLUMN, RESOURCE_CREATE_FORM } from '../ids';
import { ownPropertySectionSchema } from '../pages/resourceDetail/props';
import { ResourceCreateBlock } from '../pages/resourceDetail/resourceCreateParts';

import type { OwnPropertySection } from '../pages/resourceDetail/props';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceCreateColumnRenderer: IComponentRenderer<OwnPropertySection> = {
	type: RESOURCE_CREATE_COLUMN,
	propsSchema: ownPropertySectionSchema,
	render(props) {
		return <ResourceCreateColumn block={props} />;
	},
};

function ResourceCreateColumn({ block }: { block: OwnPropertySection }): React.ReactNode {
	const runtime = useCrudFormRuntime();

	if (!runtime) {
		console.warn(`"${RESOURCE_CREATE_COLUMN}" must be rendered inside a "${RESOURCE_CREATE_FORM}".`);
		return null;
	}

	return <ResourceCreateBlock block={block} isLoading={runtime.isLoading} />;
}
