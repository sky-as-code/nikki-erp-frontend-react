import React from 'react';

import type { IComponentRenderer } from './IComponentRenderer';
import { MetaComponent } from './renderComponent';
import { ResourceFormViewProvider } from './resourceFormViewContext';
import { CrudFormProvider, FormStyleProvider, FormVariant } from '../../components/form';
import { useResourceDetailContext, useResourceDetailTranslationNs } from '../templates/ResourceDetailProvider';
import { useResourceUpdateContext } from '../templates/resourceUpdateContext';
import { useLocalize } from '../../i18n';

import type { ComponentNode } from '../metadata/types';


export const RESOURCE_FORM = 'resource_form';

type ResourceFormProps = {
	variant?: FormVariant,
};

export const resourceFormRenderer: IComponentRenderer = {
	type: RESOURCE_FORM,
	render(node) {
		return <ResourceForm node={node} />;
	},
};

function ResourceForm({ node }: { node: ComponentNode }): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { resource, isWriting, onSubmit } = useResourceUpdateContext();
	const localize = useLocalize(useResourceDetailTranslationNs());
	const [updateMode, setUpdateMode] = React.useState(false);
	const modelSchema = schemaPack?.modelSchema;
	const props = (node.props ?? {}) as ResourceFormProps;

	if (!modelSchema) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<CrudFormProvider
				formVariant={props.variant ?? 'update'}
				schemaName={modelSchema.name}
				localize={localize}
				modelValue={resource ?? null}
				isSubmitting={isWriting}
				onSubmit={onSubmit}
			>
				<ResourceFormViewProvider value={{ updateMode, setUpdateMode }}>
					<MetaComponent node={node.children} />
				</ResourceFormViewProvider>
			</CrudFormProvider>
		</FormStyleProvider>
	);
}
