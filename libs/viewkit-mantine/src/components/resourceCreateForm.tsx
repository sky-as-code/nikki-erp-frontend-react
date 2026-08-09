import { CrudFormProvider, FormStyleProvider, FormTestIdProvider } from '@nikkierp/ui/components/form';
import { useLocalize } from '@nikkierp/ui/i18n';
import { ComponentAnchor, MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_CREATE_FORM } from '../ids';
import { useResourceCreateContext } from '../pages/resourceDetail/resourceCreateContext';
import {
	useResourceDetailContext, useResourceDetailTranslationNs,
} from '../pages/resourceDetail/ResourceDetailProvider';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceCreateFormPropsSchema = z.object({}).strict();

export type ResourceCreateFormProps = z.infer<typeof resourceCreateFormPropsSchema>;

export const resourceCreateFormRenderer: IComponentRenderer<ResourceCreateFormProps> = {
	type: RESOURCE_CREATE_FORM,
	propsSchema: resourceCreateFormPropsSchema,
	render(_props, runtime) {
		// Anchored: the form's own root is a pair of context providers that emit no DOM.
		return (
			<ComponentAnchor id={RESOURCE_CREATE_FORM}>
				<ResourceCreateForm runtime={runtime} />
			</ComponentAnchor>
		);
	},
};

function ResourceCreateForm({ runtime }: { runtime: ComponentRenderRuntime }): React.ReactNode {
	const { schemaPack, testId } = useResourceDetailContext();
	const { onSubmit, isSubmitting } = useResourceCreateContext();
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<FormTestIdProvider testId={testId}>
				<CrudFormProvider
					formVariant='create'
					schemaName={modelSchema.name}
					localize={localize}
					isSubmitting={isSubmitting}
					onSubmit={onSubmit}
				>
					<MetaComponent node={runtime.children} />
				</CrudFormProvider>
			</FormTestIdProvider>
		</FormStyleProvider>
	);
}
