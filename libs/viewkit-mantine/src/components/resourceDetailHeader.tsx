import React from 'react';
import { z } from 'zod';

import { RESOURCE_DETAIL_HEADER } from '../ids';
import { linkSpecSchema, schemaFieldSpecSchema } from '../pages/resourceDetail/props';
import { ResourceUpdateHeader } from '../pages/resourceDetail/resourceUpdateParts';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceDetailHeaderPropsSchema = z.object({
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl2: schemaFieldSpecSchema.optional(),
	titleLvl3: linkSpecSchema.optional(),
}).strict();

export type ResourceDetailHeaderProps = z.infer<typeof resourceDetailHeaderPropsSchema>;

export const resourceDetailHeaderRenderer: IComponentRenderer<ResourceDetailHeaderProps> = {
	type: RESOURCE_DETAIL_HEADER,
	propsSchema: resourceDetailHeaderPropsSchema,
	render(props) {
		return (
			<ResourceUpdateHeader
				titleLvl1={props.titleLvl1}
				titleLvl2={props.titleLvl2}
				titleLvl3={props.titleLvl3}
			/>
		);
	},
};
