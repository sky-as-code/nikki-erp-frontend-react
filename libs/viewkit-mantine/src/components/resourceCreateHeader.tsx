import React from 'react';
import { z } from 'zod';

import { RESOURCE_CREATE_HEADER } from '../ids';
import { linkSpecSchema, schemaFieldSpecSchema } from '../pages/resourceDetail/props';
import { ResourceCreateHeader } from '../pages/resourceDetail/resourceCreateParts';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceCreateHeaderPropsSchema = z.object({
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl3: linkSpecSchema.optional(),
}).strict();

export type ResourceCreateHeaderProps = z.infer<typeof resourceCreateHeaderPropsSchema>;

export const resourceCreateHeaderRenderer: IComponentRenderer<ResourceCreateHeaderProps> = {
	type: RESOURCE_CREATE_HEADER,
	propsSchema: resourceCreateHeaderPropsSchema,
	render(props) {
		return <ResourceCreateHeader titleLvl1={props.titleLvl1} titleLvl3={props.titleLvl3} />;
	},
};
