import { Alert } from '@mantine/core';
import {
	CrudFormProvider, FormStyleProvider, FormTestIdProvider, useCrudFormRuntime,
} from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor, MetaComponent } from '@nikkierp/viewengine/render';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

import { RESOURCE_FORM } from '../ids';
import { resourceFormPropsSchema } from './resourceFormProps';
import { ResourceFormViewProvider } from './resourceFormViewContext';
import {
	useResourceDetailContext, useResourceDetailTranslationNs,
} from '../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';

import type { ResourceFormProps } from './resourceFormProps';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormRenderer: IComponentRenderer<ResourceFormProps> = {
	type: RESOURCE_FORM,
	propsSchema: resourceFormPropsSchema,
	render(props, runtime) {
		// Anchored: the form's own root is a pair of context providers that emit no DOM.
		return (
			<ComponentAnchor id={RESOURCE_FORM}>
				<ResourceForm props={props} runtime={runtime} />
			</ComponentAnchor>
		);
	},
};

function ResourceForm({ props, runtime }: {
	props: ResourceFormProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const { schemaPack, testId } = useResourceDetailContext();
	const { resource, isWriting, onSubmit } = useResourceUpdateContext();
	const localize = useLocalize(useResourceDetailTranslationNs());
	const [updateMode, setUpdateMode] = React.useState(false);
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<FormTestIdProvider testId={testId}>
				<CrudFormProvider
					formVariant={props.variant}
					schemaName={modelSchema.name}
					localize={localize}
					modelValue={resource ?? null}
					isSubmitting={isWriting}
					onSubmit={onSubmit}
				>
					<ResourceFormViewProvider value={{ updateMode, setUpdateMode }}>
						<ServerErrorAlert />
						<MetaComponent node={runtime.children} />
					</ResourceFormViewProvider>
				</CrudFormProvider>
			</FormTestIdProvider>
		</FormStyleProvider>
	);
}

/**
 * Routes the last save's rejections into the form: field-scoped items onto their
 * inputs, the rest into an alert above the form.
 *
 * Lives inside `CrudFormProvider` because `setServerErrors` needs the form runtime.
 */
function ServerErrorAlert(): React.ReactNode {
	const { saveClientErrors } = useResourceUpdateContext();
	const formRuntime = useCrudFormRuntime();
	const t = useTranslate(useResourceDetailTranslationNs());
	const [unattached, setUnattached] = React.useState<ClientErrorItem[]>([]);
	const setServerErrors = formRuntime?.setServerErrors;

	React.useEffect(() => {
		if (!setServerErrors) return;
		setUnattached(saveClientErrors.length > 0 ? setServerErrors(saveClientErrors) : []);
	}, [saveClientErrors, setServerErrors]);

	if (unattached.length === 0) {
		return null;
	}

	return (
		<Alert variant='light' color='red' icon={<IconAlertCircle />} mb='md'>
			{unattached.map((item, index) => (
				<div key={index}>{item.key ? t(item.key) : item.message}</div>
			))}
		</Alert>
	);
}
