import { Alert, Loader, Stack } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useDetailSavePayload, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import { useAttributeCatalogue } from './attributeCatalogue';
import { AttributeLinesTable } from './AttributeLinesTable';
import { useConfigDraftState, useTemplateRecord } from './configDraftState';
import { ExclusionsTable } from './ExclusionsTable';
import { PreviewConfirmModal } from './PreviewConfirmModal';
import { TEST_ID_PREFIX } from './sectionText';
import { mapConfigErrors } from './templateConfigDrafts';
import { useSectionText } from './useSectionText';
import { TEMPLATE_ATTRIBUTES } from '../../ids';

import type { TemplateRecord } from './configDraftState';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';


export const templateAttributesRenderer: IComponentRenderer<Record<string, never>> = {
	type: TEMPLATE_ATTRIBUTES,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={TEMPLATE_ATTRIBUTES}>
				<TemplateAttributesGuard />
			</ComponentAnchor>
		);
	},
};

/** Needs the template form's save; outside one it renders nothing. */
function TemplateAttributesGuard(): React.ReactNode {
	const save = useDetailSavePayload();
	if (!save) {
		return null;
	}
	return save.mode === 'update' ? <UpdateModeSection save={save} /> : <TemplateAttributesSection save={save} />;
}

/** The saved template, read off the update page. */
function UpdateModeSection({ save }: { save: DetailSavePayload }): React.ReactNode {
	return <TemplateAttributesSection save={save} record={useTemplateRecord()} />;
}

type SectionProps = {
	save: DetailSavePayload,
	record?: TemplateRecord,
};

/**
 * The template's attribute lines and exclusions. In view mode it reads; in create and update mode
 * its edits are drafts that ride the template's own Save, in the same request as the template's
 * fields. An update first previews the variant changes and asks before an identity change, an
 * archive or a delete. Rejected rows keep their drafts and show their errors in place.
 */
function TemplateAttributesSection({ save, record }: SectionProps): React.ReactNode {
	const text = useSectionText();
	const updateMode = useResourceFormView()?.updateMode ?? true;
	const editable = save.mode === 'create' || updateMode;
	const state = useConfigDraftState({ record, save, updateMode: editable, messages: {
		stale: text.t('product_template_config_staleReloaded'),
		previewFailed: text.t('product_template_config_previewFailed'),
	} });
	const [pickedIds, setPickedIds] = React.useState<string[]>([]);
	const requestValues = React.useCallback((attributeId: string) => setPickedIds(ids => (
		!attributeId || ids.includes(attributeId) ? ids : [...ids, attributeId]
	)), []);
	const attributeIds = React.useMemo(() => {
		const named = [...state.saved.lines, ...state.draft.lines].map(line => line.attributeId);
		return [...new Set([...named, ...pickedIds])];
	}, [state.saved, state.draft, pickedIds]);
	const catalogue = useAttributeCatalogue(attributeIds);
	const errors = React.useMemo(
		() => mapConfigErrors([...state.previewErrors, ...(editable ? save.saveClientErrors : [])], state.sent.current),
		[state.previewErrors, save.saveClientErrors, editable, state.sent],
	);
	return (
		<Stack gap='sm' {...testAttrs(TEST_ID_PREFIX)}>
			{catalogue.isLoading || state.isPreviewing ? <Loader size='xs' /> : null}
			{errors.general.length > 0 ? (
				<Alert variant='light' color='red' {...testAttrs(TEST_ID_PREFIX, 'errors')}>
					{errors.general.map((item, index) => <div key={index}>{text.translateError(item)}</div>)}
				</Alert>
			) : null}
			<AttributeLinesTable
				saved={state.saved} draft={state.draft} catalogue={catalogue} editable={editable} mode={save.mode}
				lineErrors={errors.lines} onChange={state.setDraft}
				requestValues={requestValues} text={text}
			/>
			<ExclusionsTable
				draft={state.draft} catalogue={catalogue} editable={editable}
				exclusionErrors={errors.exclusions} onChange={state.setDraft} text={text}
			/>
			<PreviewConfirmModal pending={state.pending} catalogue={catalogue} text={text} />
		</Stack>
	);
}
