import { Collapse, Stack } from '@mantine/core';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { PaperWithBorder } from './paperWithBorder';
import { useResourceFormView } from './resourceFormViewContext';
import { RESOURCE_FORM_SECTION } from '../ids';
import classes from '../pages/resourceDetail/ResourceDetail.module.css';
import { DebugFormErrors, printDebugFormValues } from '../pages/resourceDetail/ResourceDetailProvider';
import { SectionActionBar } from '../pages/resourceDetail/resourceUpdateParts';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormSectionPropsSchema = z.object({
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
}).strict();

export type ResourceFormSectionProps = z.infer<typeof resourceFormSectionPropsSchema>;

/**
 * The resource form's own section: it always renders the `SectionActionBar` bound to the enclosing
 * form, so it must only appear inside `resource_form` — `ResourceUpdate` is its sole emitter, which
 * is why no page-authoring builder exists for it. For a general bordered block anywhere in a page
 * tree, reach for `collapsible_section`.
 */
export const resourceFormSectionRenderer: IComponentRenderer<ResourceFormSectionProps> = {
	type: RESOURCE_FORM_SECTION,
	propsSchema: resourceFormSectionPropsSchema,
	render(props, runtime) {
		return <ResourceFormSection props={props} runtime={runtime} />;
	},
};

function ResourceFormSection({ props, runtime }: {
	props: ResourceFormSectionProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const [expanded, setExpanded] = React.useState(props.expanded);
	const formRuntime = useCrudFormRuntime();

	return (
		<Stack component={PaperWithBorder} gap='md' {...componentAttrs(RESOURCE_FORM_SECTION)}>
			<FormSectionActionBar expanded={expanded} onToggleCollapse={() => setExpanded(prev => !prev)} />
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

function FormSectionActionBar({ expanded, onToggleCollapse }: {
	expanded: boolean,
	onToggleCollapse: () => void,
}): React.ReactNode {
	const formRuntime = useCrudFormRuntime();
	const [localMode, setLocalMode] = React.useState(false);
	const view = useResourceFormView();

	return (
		<SectionActionBar
			expanded={expanded}
			onToggleCollapse={onToggleCollapse}
			onSaveClick={formRuntime ? formRuntime.handleSubmit(printDebugFormValues) : () => undefined}
			isLoading={formRuntime?.isLoading ?? false}
			updateMode={view?.updateMode ?? localMode}
			setUpdateMode={view?.setUpdateMode ?? setLocalMode}
		/>
	);
}
