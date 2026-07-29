import { CrudFormProvider, FormStyleProvider } from '@nikkierp/ui/components/form';
import { useLocalize } from '@nikkierp/ui/i18n';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_FORM } from '../ids';
import { ResourceFormViewProvider } from './resourceFormViewContext';
import {
	useResourceDetailContext, useResourceDetailTranslationNs,
} from '../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormPropsSchema = z.object({
	variant: z.enum(['create', 'update']).default('update'),
}).strict();

export type ResourceFormProps = z.infer<typeof resourceFormPropsSchema>;

export const resourceFormRenderer: IComponentRenderer<ResourceFormProps> = {
	type: RESOURCE_FORM,
	propsSchema: resourceFormPropsSchema,
	render(props, runtime) {
		return <ResourceForm props={props} runtime={runtime} />;
	},
};

function ResourceForm({ props, runtime }: {
	props: ResourceFormProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { resource, isWriting, onSubmit } = useResourceUpdateContext();
	const localize = useLocalize(useResourceDetailTranslationNs());
	const [updateMode, setUpdateMode] = React.useState(false);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				formVariant={props.variant}
				schemaName={modelSchema.name}
				localize={localize}
				modelValue={resource ?? null}
				isSubmitting={isWriting}
				onSubmit={onSubmit}
			>
				<ResourceFormViewProvider value={{ updateMode, setUpdateMode }}>
					<MetaComponent node={runtime.children} />
				</ResourceFormViewProvider>
			</CrudFormProvider>
		</FormStyleProvider>
	);
}
