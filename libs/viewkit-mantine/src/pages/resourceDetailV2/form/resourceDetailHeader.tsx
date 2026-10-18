import { dirtyFieldUpdateValue, useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { PageHeader } from '../../../components/pageHeader/PageHeader';
import { PageHeaderProvider } from '../../../components/pageHeader/pageHeaderContext';
import { useResourceFormView } from '../../../components/resourceFormViewContext';
import { RESOURCE_DETAIL_HEADER_V2, RESOURCE_FORM_COLUMN, RESOURCE_FORM_COLUMN_V2 } from '../../../ids';
import { linkSpecSchema, schemaFieldSpecSchema } from '../../resourceDetail/props';
import { useResourceDetailContext } from '../../resourceDetail/ResourceDetailProvider';
import { SplitPaneCloseButton } from '../../resourceDetail/SplitPaneCloseButton';
import { useResourceUpdateContext } from '../resourceUpdateContext';
import { CreateActionButton, ResourceActionBar } from '../resourceUpdateParts';

import type { PageHeaderContextValue } from '../../../components/pageHeader/pageHeaderContext';
import type { ResourceUpdateContextValue } from '../resourceUpdateContext';
import type { FormProviderRenderProps } from '@nikkierp/ui/components/form';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export const resourceDetailHeaderPropsSchema = z.object({
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl2: schemaFieldSpecSchema.optional(),
	backLinkTitle: linkSpecSchema.optional(),
}).strict();

export type ResourceDetailHeaderProps = z.infer<typeof resourceDetailHeaderPropsSchema>;

/**
 * The resource-detail flavour of {@link PageHeader}.
 *
 * All this adds is the adapter: it feeds the generic header the fetched record and model schema,
 * and supplies the two buttons that only make sense on a resource page. Create and Close stay
 * here rather than moving into the generic header because both read resource-detail contexts
 * that a plain page has no reason to provide.
 */
export const resourceDetailHeaderV2Renderer: IComponentRenderer<ResourceDetailHeaderProps> = {
	type: RESOURCE_DETAIL_HEADER_V2,
	propsSchema: resourceDetailHeaderPropsSchema,
	render(props) {
		return <ResourceDetailHeader {...props} />;
	},
};

function ResourceDetailHeader(props: ResourceDetailHeaderProps): React.ReactNode {
	const { schemaPack, translationNs, testId } = useResourceDetailContext();
	const context = useResourceUpdateContext();
	const modelSchema = schemaPack?.modelSchema;
	const headerContext = React.useMemo(
		(): PageHeaderContextValue => ({ translationNs, record: context.resource, modelSchema, testId }),
		[translationNs, context.resource, modelSchema, testId],
	);
	// Title overrides fall back to the values held in the resource-update context.
	const backLinkTitle = props.backLinkTitle ?? context.backLinkTitle;
	const formRuntime = useCrudFormRuntime();
	const view = useResourceFormView();
	const [localUpdateMode, setLocalUpdateMode] = React.useState(false);
	const updateMode = view?.updateMode ?? localUpdateMode;
	const setUpdateMode = view?.setUpdateMode ?? setLocalUpdateMode;
	const resource = context.resource;
	// The fields this form owns, read off the page's own `resource_form__column` nodes. It used to
	// come from `formSections`; with that gone the node tree is the only declaration of which
	// fields belong to the resource form -- and it is what actually renders, so the two cannot
	// drift.
	const blocks = React.useMemo(
		() => collectColumnFields(context.childrenNodes ?? []),
		[context.childrenNodes],
	);
	// `dirtyFields` comes off the runtime, which subscribed it during render. Reading
	// `form.formState.dirtyFields` here instead would hit an unactivated Proxy and report nothing
	// changed, turning every save into a no-op that still reports success.
	const dirtyFields = formRuntime?.dirtyFields;
	const hasChanges = hasDirtySectionField(blocks, dirtyFields);
	const onSaveClick = formRuntime
		? () => {
			// Saving an untouched form has nothing to send, so it skips the request and simply
			// leaves edit mode — the outcome the user expects from Save either way.
			if (!hasChanges) {
				const pendingSave = saveWithoutFieldChanges(context, resource);
				if (!pendingSave) {
					setUpdateMode(false);
					return;
				}
				void pendingSave.then(succeeded => {
					if (succeeded) {
						setUpdateMode(false);
					}
				});
				return;
			}
			void formRuntime
				.handleSubmitWithResult(data => buildPartialSavePayload(
					data, blocks, dirtyFields, resource, formRuntime.form.getValues(),
				))()
				.then(succeeded => {
					// Only on success: a rejected save keeps the fields editable so the user can
					// fix what the server complained about.
					if (succeeded) {
						setUpdateMode(false);
					}
				});
		}
		: () => undefined;
	// Reset before leaving update mode: read mode renders `context.resource`, not form state, so
	// this is invisible today, but it stops re-entering update mode from resurrecting discarded
	// edits from the previous session.
	const onCancel = view?.cancelUpdate ?? (() => {
		formRuntime?.reset();
		setUpdateMode(false);
	});

	return (
		<PageHeaderProvider value={headerContext}>
			<PageHeader
				{...componentAttrs(RESOURCE_DETAIL_HEADER_V2)}
				titleLvl1={props.titleLvl1 ?? context.titleLvl1}
				titleLvl2={props.titleLvl2 ?? context.titleLvl2}
				backLinkTitle={backLinkTitle && modelSchema ? { linkHref: backLinkTitle.linkHref } : undefined}
				actions={(
					<>
						{context.commands.create ? (
							<CreateActionButton disabled={context.isReading || context.isWriting} />
						) : null}
						<ResourceActionBar
							onSaveClick={onSaveClick}
							onCancel={onCancel}
							isLoading={formRuntime?.isLoading ?? false}
							updateMode={updateMode}
							setUpdateMode={setUpdateMode}
						/>
					</>
				)}
				trailing={<SplitPaneCloseButton />}
				rowSpacing='md'
			/>
		</PageHeaderProvider>
	);
}

/**
 * The save for a form whose own fields are untouched: a section's update-payload contribution
 * (sent as `{id, etag, ...contribution}`), else the after-save hooks alone, else nothing (`null`).
 */
function saveWithoutFieldChanges(
	context: ResourceUpdateContextValue, resource: Record<string, unknown> | undefined,
): Promise<boolean> | null {
	if (context.hasPendingUpdatePayload?.()) {
		const id = resource?.id;
		const etag = resource?.etag;
		if (typeof id !== 'string' || typeof etag !== 'string') {
			return Promise.resolve(false);
		}
		return context.onSubmit({ id, etag });
	}
	return context.hasPendingAfterSave() ? context.submitAfterSaveOnly() : null;
}

/**
 * Every `resource_form__column`'s `fields`, depth-first through the page's node tree.
 *
 * Columns are nested inside `collapsible_section`s, so a shallow scan of the top-level nodes
 * would miss all of them.
 *
 * A child node is not always in `children`: `tabCollapsibleSection` carries one per tab under
 * `props.tabs[].content`. Walking `children` alone returned **no columns at all** for a page
 * whose sections live in tabs — which made `hasDirtySectionField` always false, so Save took the
 * "nothing changed" path and left edit mode without issuing a request. Any node holding another
 * node in its props has to be followed, so the scan looks for component nodes by shape rather
 * than by knowing each container's prop name.
 */
export function collectColumnFields(nodes: ComponentNode[]): { fields?: string[] }[] {
	const out: { fields?: string[] }[] = [];
	const seen = new Set<unknown>();

	const walkValue = (value: unknown): void => {
		if (!value || typeof value !== 'object' || seen.has(value)) {
			return;
		}
		seen.add(value);
		if (Array.isArray(value)) {
			value.forEach(walkValue);
			return;
		}
		const node = value as Partial<ComponentNode> & Record<string, unknown>;
		if (typeof node.component === 'string') {
			// Both ids: this scan reads the page's own nodes, which carry the v1 id the shared
			// `resourceFormColumnNode()` builder emits, while the rendered tree carries the v2 id
			// `toV2FormNodes` swapped in.
			if (node.component === RESOURCE_FORM_COLUMN_V2 || node.component === RESOURCE_FORM_COLUMN) {
				out.push((node.props ?? {}) as { fields?: string[] });
			}
			const formFields = (node.props as { formFields?: unknown } | undefined)?.formFields;
			if (Array.isArray(formFields)) {
				out.push({ fields: formFields.filter((field): field is string => typeof field === 'string') });
			}
			// `props` is walked too: a column reached through `tabs[].content` lives there.
			walkValue(node.props);
			walkValue(node.children);
			return;
		}
		Object.values(node).forEach(walkValue);
	};

	walkValue(nodes);
	return out;
}

/** Whether any `resource_form__column`-scoped field has been edited since the last reset. */
function hasDirtySectionField(
	blocks: { fields?: string[] }[],
	dirtyFields: FormProviderRenderProps['dirtyFields'] | undefined,
): boolean {
	const dirty = (dirtyFields ?? {}) as Record<string, unknown>;
	return blocks.some(block => (block.fields ?? []).some(field => Boolean(dirty[field])));
}

/**
 * Scopes the save payload to the fields declared on `resource_form__column` nodes, filtered to
 * what react-hook-form marked dirty, plus `id`/`etag`.
 *
 * A node that renders no `resource_form__column` — a related-records table, a custom widget —
 * contributes no fields and registers none on this form, so it needs no explicit exclusion. The
 * reduced payload rides the existing partial PATCH path (`RestApi.update` sends only the keys
 * present in the request body) — no backend change needed.
 *
 * Returns `undefined` — which `CrudFormProvider` reads as "do not submit" — when nothing changed.
 * Sending `{id, etag}` alone would be a write that stores nothing yet reports success, which is
 * indistinguishable to the user from a save that worked.
 */
export function buildPartialSavePayload(
	data: Record<string, any>,
	blocks: { fields?: string[] }[],
	dirtyFields: FormProviderRenderProps['dirtyFields'] | undefined,
	resource: Record<string, unknown> | undefined,
	/** The form's unparsed values, which tell a cleared field (sent as `null`) from an untouched one. */
	rawValues?: Record<string, unknown>,
): Record<string, any> | undefined {
	const id = resource?.id;
	const etag = resource?.etag;
	if (typeof id !== 'string' || typeof etag !== 'string') {
		return undefined;
	}
	const sectionFields = new Set(blocks.flatMap(block => block.fields ?? []));
	const dirty = (dirtyFields ?? {}) as Record<string, unknown>;
	const payload: Record<string, any> = { id, etag };
	let changedCount = 0;
	for (const field of sectionFields) {
		const value = dirty[field] ? dirtyFieldUpdateValue(data, rawValues, field) : undefined;
		if (value !== undefined) {
			payload[field] = value;
			changedCount += 1;
		}
	}
	return changedCount > 0 ? payload : undefined;
}
