import React from 'react';

import {
	addMove, buildMovesContribution, emptyMoveDrafts, moveDraftsFor, removeMove, updateMove,
} from './moveDrafts';

import type { MoveDrafts, SaveMode, SentRows } from './moveDrafts';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';


export type MoveDraftState = {
	drafts: MoveDrafts,
	/** The rows behind the last contribution's lists, for mapping that save's errors. */
	sent: React.RefObject<SentRows | null>,
	add: (values: Record<string, unknown>) => void,
	/** `original`: the group as read, for a saved move's first edit. */
	update: (values: Record<string, unknown>, original: SearchItem | undefined) => void,
	remove: (item: Record<string, unknown>) => void,
};

/**
 * The section's unsaved adds, edits and removals. They live for one edit session of one transfer:
 * leaving update mode (Cancel, or a successful Save) discards them, and they are keyed by transfer
 * id so a split view switching records in place never shows, or sends, another transfer's drafts.
 */
export function useMoveDraftState(args: {
	transferId: string,
	save: DetailSavePayload,
	updateMode: boolean,
	onSaved: () => void,
}): MoveDraftState {
	const { transferId, save, updateMode, onSaved } = args;
	const [state, setState] = React.useState(() => emptyMoveDrafts(transferId));
	const drafts = moveDraftsFor(state, transferId);
	const sent = React.useRef<SentRows | null>(null);

	React.useEffect(() => {
		if (!updateMode) {
			setState(emptyMoveDrafts(transferId));
		}
	}, [updateMode, transferId]);

	useMoveDraftContributor({
		drafts, mode: save.mode, register: save.register, sent,
		onSaved: () => {
			setState(emptyMoveDrafts(transferId));
			onSaved();
		},
	});

	return {
		drafts,
		sent,
		// Functional: two writes in one tick (a pick that also clears a dependent field) must both land.
		add: values => setState(prev => addMove(moveDraftsFor(prev, transferId), values)),
		update: (values, original) => setState(prev => updateMove(moveDraftsFor(prev, transferId), values, original)),
		remove: item => setState(prev => removeMove(moveDraftsFor(prev, transferId), item)),
	};
}

/** Folds the drafts into the transfer's own create or update request, so the header and its moves save in one write. */
function useMoveDraftContributor(args: {
	drafts: MoveDrafts,
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
			const contribution = buildMovesContribution(latest.current.drafts, latest.current.mode);
			sent.current = contribution?.sent ?? null;
			return contribution?.payload;
		},
		onSaved: () => latest.current.onSaved(),
	}), [register, sent]);
}
