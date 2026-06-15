import React from 'react';

import type { IComponentRenderer } from './IComponentRenderer';
import { MetaComponent } from './renderComponent';
import { CrudFormProvider, FormStyleProvider } from '../../components/form';
import { useLocalize } from '../../i18n';
import { useResourceDetailContext, useResourceDetailTranslationNs } from '../templates/ResourceDetailProvider';
import { useResourceCreateContext } from '../templates/resourceCreateContext';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_CREATE_FORM = 'resource_create__form';

export const resourceCreateFormRenderer: IComponentRenderer = {
	type: RESOURCE_CREATE_FORM,
	render(node) {
		return <ResourceCreateForm node={node} />;
	},
};

function ResourceCreateForm({ node }: { node: ComponentNode }): React.ReactNode {
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
				<MetaComponent node={node.children} />
			</CrudFormProvider>
		</FormStyleProvider>
	);
}
