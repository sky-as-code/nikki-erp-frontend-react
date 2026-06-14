import React from 'react';

import type { ComponentRenderContext, IComponentRenderer } from './IComponentRenderer';
import { RenderComponentTree } from './renderComponent';
import { CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useLocalize } from '../../i18n';
import { useResourceDetailContext, useResourceDetailTranslationNs } from '../templates/ResourceDetailProvider';
import { useResourceCreateContext } from '../templates/resourceCreateContext';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_CREATE_FORM = 'resource_create__form';

export const resourceCreateFormRenderer: IComponentRenderer = {
	type: RESOURCE_CREATE_FORM,
	render(node, ctx) {
		return <ResourceCreateForm node={node} ctx={ctx} />;
	},
};

function ResourceCreateForm({ node, ctx }: { node: ComponentNode, ctx: ComponentRenderContext }): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { onSubmit, isSubmitting } = useResourceCreateContext();
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				formVariant='create'
				schemaName={modelSchema.name}
				localize={localize}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			>
				<RenderComponentTree nodes={node.children} ctx={ctx.ctx} />
			</CrudFormProvider>
		</FormStyleProvider>
	);
}
