import { Collapse, Stack } from '@mantine/core';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_CREATE_SECTION } from '../ids';
import { ResourceCreateActionBar } from '../pages/resourceDetail/resourceCreateParts';
import classes from '../pages/resourceDetail/ResourceDetail.module.css';
import { PaperWithBorder } from '../pages/resourceDetail/resourceUpdateParts';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';



export const resourceCreateSectionPropsSchema = z.object({
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
}).strict();

export type ResourceCreateSectionProps = z.infer<typeof resourceCreateSectionPropsSchema>;

export const resourceCreateSectionRenderer: IComponentRenderer<ResourceCreateSectionProps> = {
	type: RESOURCE_CREATE_SECTION,
	propsSchema: resourceCreateSectionPropsSchema,
	render(props, runtime) {
		return <ResourceCreateSection props={props} runtime={runtime} />;
	},
};

function ResourceCreateSection({ props, runtime }: {
	props: ResourceCreateSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const formRuntime = useCrudFormRuntime();
	const onSaveClick = formRuntime ? formRuntime.handleSubmit() : () => undefined;

	return (
		<Stack component={PaperWithBorder} gap='md'>
			<ResourceCreateActionBar
				expanded={expanded}
				onToggleCollapse={() => setExpanded(prev => !prev)}
				onSaveClick={onSaveClick}
				isLoading={formRuntime?.isLoading ?? false}
			/>
			<Collapse
				expanded={expanded}
				transitionDuration={props.transitionDuration}
				transitionTimingFunction={props.transitionTimingFunction}
				className={classes.containerInlineSize}
			>
				<div className={classes.formBlockWrapper}>
					<MetaComponent node={runtime.children} />
				</div>
			</Collapse>
		</Stack>
	);
}
