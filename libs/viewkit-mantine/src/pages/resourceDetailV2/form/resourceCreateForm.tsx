import { getCurrentOrgId, isOrgScoped } from '@nikkierp/common/service';
import { CrudFormProvider, FormStyleProvider, FormTestIdProvider } from '@nikkierp/ui/components/form';
import { useLocalize } from '@nikkierp/ui/i18n';
import { ComponentAnchor, MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { PinnedBlock } from '../../../components/pageHeader/PinnedBlock';
import { FIELD_DATA_PARAM, parseFieldDataParam, pickSchemaFieldValues } from '../../../data/fieldDataParam';
import { RESOURCE_CREATE_FORM_V2, RESOURCE_CREATE_HEADER_V2 } from '../../../ids';
import {
	useResourceDetailContext, useResourceDetailTranslationNs,
} from '../../resourceDetail/ResourceDetailProvider';
import { BindCreateServerErrors, useResourceCreateContext } from '../resourceCreateContext';
import { ResourceCreateSaveBar } from '../resourceCreateParts';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export const resourceCreateFormPropsSchema = z.object({}).strict();

export type ResourceCreateFormProps = z.infer<typeof resourceCreateFormPropsSchema>;

export const resourceCreateFormV2Renderer: IComponentRenderer<ResourceCreateFormProps> = {
	type: RESOURCE_CREATE_FORM_V2,
	propsSchema: resourceCreateFormPropsSchema,
	render(_props, runtime) {
		// Anchored: the form's own root is a pair of context providers that emit no DOM.
		return (
			<ComponentAnchor id={RESOURCE_CREATE_FORM_V2}>
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
	const orgScoped = Boolean(
		schemaPack && modelSchema && isOrgScoped(schemaPack, modelSchema.name),
	);
	const orgSeed = useResolvedOrgId(orgScoped);
	const fieldData = useFieldDataSeed(modelSchema);

	// For an org-scoped resource, hold the form back until the active org is known: mounting it
	// with no `org_id` seed lets validation fail on a field the user cannot see, which silently
	// blocks Save. A resource that needs no seed renders straight away.
	const [headerNodes, bodyNodes] = splitHeaderNodes(runtime.children);
	if (!modelSchema || (orgScoped && orgSeed === undefined)) {
		return modelSchema ? <PinnedBlock><MetaComponent node={headerNodes} /></PinnedBlock> : null;
	}

	// The org seed goes last: the active org is not something a link may choose.
	const modelValue = fieldData || orgSeed ? { ...fieldData, ...orgSeed } : undefined;

	return (
		<FormStyleProvider layout='onecol'>
			<FormTestIdProvider testId={testId}>
				<CrudFormProvider
					formVariant='create'
					schemaName={modelSchema.name}
					localize={localize}
					isSubmitting={isSubmitting}
					modelValue={modelValue}
					onSubmit={onSubmit}
				>
					{/*
					 * Page-level, like the update form's action bar: a `createNodes` body is an
					 * arbitrary node tree with no section guaranteed to host Save.
					 */}
					<BindCreateServerErrors />
					<PinnedBlock>
						<MetaComponent node={headerNodes} />
						<ResourceCreateSaveBar />
					</PinnedBlock>
					<MetaComponent node={bodyNodes} />
				</CrudFormProvider>
			</FormTestIdProvider>
		</FormStyleProvider>
	);
}

/** The create header pins with the Save row, so it is split off the form's children and rendered with it. */
function splitHeaderNodes(children: ComponentNode[] | undefined): [ComponentNode[], ComponentNode[]] {
	const nodes = children ?? [];
	return [
		nodes.filter(node => node.component === RESOURCE_CREATE_HEADER_V2),
		nodes.filter(node => node.component !== RESOURCE_CREATE_HEADER_V2),
	];
}

/**
 * The form values a `?field_data=` link pre-fills, limited to the model's own fields. They are form
 * values, not request defaults, so the inputs show them and submit validation checks them; the
 * page's `createDefaults` still merge under them at submit.
 */
export function useFieldDataSeed(
	modelSchema: Pick<dyn.ModelSchema, 'fields'> | undefined,
): Record<string, unknown> | undefined {
	const [searchParams] = useSearchParams();
	const raw = searchParams.get(FIELD_DATA_PARAM);
	return React.useMemo(
		() => (modelSchema ? pickSchemaFieldValues(parseFieldDataParam(raw), modelSchema) : undefined),
		[raw, modelSchema],
	);
}

/**
 * The `{ org_id }` seed a create form needs for an org-scoped resource, or `null` once it is
 * known that none can be supplied; `undefined` until then.
 *
 * The base `org_base_model` mixin marks `org_id` `required_for_create` with no default, so the
 * generated validation schema rejects a submit that omits it. No create form renders an input for
 * it — the value is the active organization, not a user choice — so without this seed the Save
 * button silently no-ops: validation fails on a field the user cannot see, `onSubmit` never fires
 * and no request is sent. `CrudServiceBase.create` also folds in the org via `withOrgId`, but only
 * after client-side validation has already passed.
 */
function useResolvedOrgId(enabled: boolean): Record<string, unknown> | null | undefined {
	const [seed, setSeed] = React.useState<Record<string, unknown> | null | undefined>(undefined);

	React.useEffect(() => {
		if (!enabled) {
			return;
		}
		let active = true;
		void getCurrentOrgId()
			.then((orgId) => {
				if (active) {
					setSeed(orgId ? { org_id: orgId } : null);
				}
			})
			.catch(() => {
				// No org resolved (e.g. rendered outside an org route): fall through with no seed
				// and let validation surface the missing field.
				if (active) {
					setSeed(null);
				}
			});
		return () => {
			active = false;
		};
	}, [enabled]);

	return seed;
}
