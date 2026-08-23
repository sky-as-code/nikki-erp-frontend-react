import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { componentAttrs } from '@nikkierp/viewengine/core';
import React from 'react';
import { z } from 'zod';

import { RESOURCE_DETAIL_HEADER, RESOURCE_FORM_COLUMN } from '../ids';
import { PageHeader } from './pageHeader/PageHeader';
import { PageHeaderProvider } from './pageHeader/pageHeaderContext';
import { useResourceFormView } from './resourceFormViewContext';
import { linkSpecSchema, schemaFieldSpecSchema } from '../pages/resourceDetail/props';
import { useResourceDetailContext } from '../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../pages/resourceDetail/resourceUpdateContext';
import { CreateActionButton, ResourceActionBar } from '../pages/resourceDetail/resourceUpdateParts';
import { SplitPaneCloseButton } from '../pages/resourceDetail/SplitPaneCloseButton';

import type { PageHeaderContextValue } from './pageHeader/pageHeaderContext';
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
export const resourceDetailHeaderRenderer: IComponentRenderer<ResourceDetailHeaderProps> = {
	type: RESOURCE_DETAIL_HEADER,
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
				setUpdateMode(false);
				return;
			}
			void formRuntime
				.handleSubmitWithResult(data => buildPartialSavePayload(data, blocks, dirtyFields, resource))()
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
	const onCancel = () => {
		formRuntime?.reset();
		setUpdateMode(false);
	};

	return (
		<PageHeaderProvider value={headerContext}>
			<PageHeader
				{...componentAttrs(RESOURCE_DETAIL_HEADER)}
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
			/>
		</PageHeaderProvider>
	);
}

/** Whether any `resource_form__column`-scoped field has been edited since the last reset. */
/**
 * Every `resource_form__column`'s `fields`, depth-first through the page's node tree.
 *
 * Columns are nested inside `collapsible_section`s (and possibly `resource_form__tabs`), so a
 * shallow scan of the top-level nodes would miss all of them.
 */
export function collectColumnFields(nodes: ComponentNode[]): { fields?: string[] }[] {
	const out: { fields?: string[] }[] = [];
	const walk = (list: ComponentNode[]): void => {
		for (const node of list) {
			if (node.component === RESOURCE_FORM_COLUMN) {
				out.push((node.props ?? {}) as { fields?: string[] });
			}
			if (node.children) {
				walk(node.children);
			}
		}
	};
	walk(nodes);
	return out;
}

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
		if (dirty[field] && field in data) {
			payload[field] = data[field];
			changedCount += 1;
		}
	}
	return changedCount > 0 ? payload : undefined;
}
