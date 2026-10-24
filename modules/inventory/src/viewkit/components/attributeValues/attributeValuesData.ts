import React from 'react';

import {
	addValue, buildValuesContribution, draftsFor, emptyDrafts, removeValue, updateValue,
} from './attributeValueDrafts';

import type { AttributeValueDrafts, SaveMode, SentRows, ValueFields } from './attributeValueDrafts';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';


export type ValueDraftState = {
	drafts: AttributeValueDrafts,
	/** The rows behind the last contribution's lists, for mapping that save's errors. */
	sent: React.RefObject<SentRows | null>,
	add: (values: ValueFields) => void,
	update: (values: ValueFields) => void,
	remove: (item: Record<string, unknown>) => void,
};

/**
 * The section's unsaved adds, edits and removals. They live for one edit session of one record:
 * leaving update mode (Cancel, or a successful Save) discards them, and they are keyed by attribute
 * id so a split view switching records in place never shows, or sends, another attribute's drafts.
 */
export function useValueDraftState(args: {
	attributeId: string,
	save: DetailSavePayload,
	updateMode: boolean,
	onSaved: () => void,
}): ValueDraftState {
	const { attributeId, save, updateMode, onSaved } = args;
	const [state, setState] = React.useState(() => emptyDrafts(attributeId));
	const drafts = draftsFor(state, attributeId);
	const sent = React.useRef<SentRows | null>(null);

	React.useEffect(() => {
		if (!updateMode) {
			setState(emptyDrafts(attributeId));
		}
	}, [updateMode, attributeId]);

	useDraftContributor({
		drafts, mode: save.mode, register: save.register, sent,
		onSaved: () => {
			setState(emptyDrafts(attributeId));
			onSaved();
		},
	});

	return {
		drafts,
		sent,
		add: values => setState(addValue(drafts, values)),
		update: values => setState(updateValue(drafts, values)),
		remove: item => setState(removeValue(drafts, item)),
	};
}

/** Folds the drafts into the page's own create or update request, so the attribute and its values save in one write. */
function useDraftContributor(args: {
	drafts: AttributeValueDrafts,
	mode: SaveMode,
	register: DetailSavePayload['register'],
	sent: React.RefObject<SentRows | null>,
	onSaved: () => void,
}): void {
	const { register, sent } = args;
	const latest = React.useRef(args);

	React.useEffect(() => {
		latest.current = args;
	});

	React.useEffect(() => register?.({
		build: () => {
			const contribution = buildValuesContribution(latest.current.drafts, latest.current.mode);
			sent.current = contribution?.sent ?? null;
			return contribution?.payload;
		},
		onSaved: () => latest.current.onSaved(),
	}), [register, sent]);
}
