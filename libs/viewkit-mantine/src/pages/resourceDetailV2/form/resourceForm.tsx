import {
	CrudFormProvider, FormStyleProvider, FormTestIdProvider, useCrudFormRuntime,
} from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor, MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceFormPropsSchema } from '../../../components/resourceFormProps';
import { ResourceFormViewScope } from '../../../components/resourceFormViewContext';
import { RESOURCE_FORM_V2 } from '../../../ids';
import { publishServerErrors } from '../../resourceDetail/publishServerErrors';
import {
	DebugFormErrors, useResourceDetailContext, useResourceDetailTranslationNs,
} from '../../resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../resourceUpdateContext';

import type { ResourceFormProps } from '../../../components/resourceFormProps';
import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFormV2Renderer: IComponentRenderer<ResourceFormProps> = {
	type: RESOURCE_FORM_V2,
	propsSchema: resourceFormPropsSchema,
	render(props, runtime) {
		// Anchored: the form's own root is a pair of context providers that emit no DOM.
		return (
			<ComponentAnchor id={RESOURCE_FORM_V2}>
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
	const context = useResourceUpdateContext();
	const { resource, isWriting, onSubmit } = context;
	const localize = useLocalize(useResourceDetailTranslationNs());
	const [localUpdateMode, setLocalUpdateMode] = React.useState(false);
	const updateMode = context.updateMode ?? localUpdateMode;
	const setUpdateMode = context.setUpdateMode ?? setLocalUpdateMode;
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
					<ResourceFormViewScope updateMode={updateMode} setUpdateMode={setUpdateMode}>
						<ServerErrorRouter />
						{/*
						 * Page-level, not section-level: the one form now spans every section, so a
						 * validation error on a field in an appended `collapsible_section` used to
						 * surface inside the basic-info section's box -- nowhere near the input that
						 * caused it. Rendered here it sits above all sections.
						 */}
						<FormErrorDebugPanel />
						<MetaComponent node={runtime.children} />
					</ResourceFormViewScope>
				</CrudFormProvider>
			</FormTestIdProvider>
		</FormStyleProvider>
	);
}

/** Reads the form runtime so `DebugFormErrors` can stay a dumb presentational component. */
function FormErrorDebugPanel(): React.ReactNode {
	const formRuntime = useCrudFormRuntime();
	return <DebugFormErrors errors={formRuntime?.errors ?? {}} />;
}

/**
 * Routes the last save's rejections: field-scoped items onto their inputs, the rest to the Shell
 * Notice stack.
 *
 * Lives inside `CrudFormProvider` because `setServerErrors` needs the form runtime. Each rejection
 * is routed once: a re-render, a language switch or a StrictMode effect replay must not publish the
 * same notice again.
 */
function ServerErrorRouter(): null {
	const { saveClientErrors } = useResourceUpdateContext();
	const setServerErrors = useCrudFormRuntime()?.setServerErrors;
	const t = useTranslate(useResourceDetailTranslationNs());
	const routedRef = React.useRef<unknown>(null);

	React.useEffect(() => {
		if (!setServerErrors || saveClientErrors.length === 0 || routedRef.current === saveClientErrors) {
			return;
		}
		routedRef.current = saveClientErrors;
		setServerErrors(publishServerErrors(t, saveClientErrors));
	}, [saveClientErrors, setServerErrors, t]);

	return null;
}
