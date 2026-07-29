import { Collapse, Stack } from '@mantine/core';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { COLLAPSIBLE_SECTION } from '../ids';
import { useResourceFormView } from './resourceFormViewContext';
import classes from '../pages/resourceDetail/ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues } from '../pages/resourceDetail/ResourceDetailProvider';
import { PaperWithBorder, SectionActionBar } from '../pages/resourceDetail/resourceUpdateParts';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';



export const collapsibleSectionPropsSchema = z.object({
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
}).strict();

export type CollapsibleSectionProps = z.infer<typeof collapsibleSectionPropsSchema>;

export const collapsibleSectionRenderer: IComponentRenderer<CollapsibleSectionProps> = {
	type: COLLAPSIBLE_SECTION,
	propsSchema: collapsibleSectionPropsSchema,
	render(props, runtime) {
		return <CollapsibleSection props={props} runtime={runtime} />;
	},
};

function CollapsibleSection({ props, runtime }: {
	props: CollapsibleSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const [localMode, setLocalMode] = React.useState(false);
	const formRuntime = useCrudFormRuntime();
	const view = useResourceFormView();
	const updateMode = view?.updateMode ?? localMode;
	const setUpdateMode = view?.setUpdateMode ?? setLocalMode;
	const onSaveClick = formRuntime ? formRuntime.handleSubmit(printDebugFormValues) : () => undefined;

	return (
		<Stack component={PaperWithBorder} gap='md'>
			<SectionActionBar
				expanded={expanded}
				onToggleCollapse={() => setExpanded(prev => !prev)}
				onSaveClick={onSaveClick}
				isLoading={formRuntime?.isLoading ?? false}
				updateMode={updateMode}
				setUpdateMode={setUpdateMode}
			/>
			<Collapse
				expanded={expanded}
				transitionDuration={props.transitionDuration}
				transitionTimingFunction={props.transitionTimingFunction}
				className={classes.containerInlineSize}
			>
				<DebugFormErrors errors={formRuntime?.errors ?? {}} />
				<div className={classes.formBlockWrapper}>
					<MetaComponent node={runtime.children} />
				</div>
			</Collapse>
		</Stack>
	);
}
