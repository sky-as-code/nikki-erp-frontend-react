import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { groupSavedMoves, SAVED_MOVE_FIELDS } from './moveGroups';
import { PRODUCT_VARIANT_SCHEMA_NAME, STOCK_MOVE_SCHEMA_NAME } from '../../../../constants/inventory';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


/** One transfer's moves fit one page; the page size limit of a search. */
const PAGE_SIZE = 500;
const BY_SEQUENCE: dyn.OrderBy = [['sequence', 'asc']];
const NO_NAMES = new Map<string, unknown>();

type Publish = (name: string, payload: dyn.RestSearchRequest) => Promise<SearchItem[] | null>;

export type SavedMoves = {
	groups: SearchItem[],
	/** `{edge: label field}` of the labelled move read (the variant's and the unit's label fields). */
	edgeLabels: Record<string, string>,
	isLoading: boolean,
	/** The read failed: the table shows no saved move rather than a misleading empty list. */
	failed: boolean,
};

const EMPTY: SavedMoves = { groups: [], edgeLabels: {}, isLoading: false, failed: false };

function useSearchPublisher(): { publish: Publish, lastLabels: React.RefObject<Record<string, string>> } {
	const bus = useCommandBus();
	const lastLabels = React.useRef<Record<string, string>>({});
	const publish = React.useCallback<Publish>(async (name, payload) => {
		const response = await bus.publish<dyn.RestSearchResponse<SearchItem>>({ name, payload });
		const data = response.result?.data;
		if (response.error != null || !data) {
			return null;
		}
		lastLabels.current = data.edge_labels ?? {};
		return data.items ?? [];
	}, [bus]);
	return { publish, lastLabels };
}

/** The transfer's saved moves as rows, from one labelled read. Re-read on `loadCount`. */
export function useSavedMoveGroups(transferId: string, loadCount: number): SavedMoves {
	const { publish, lastLabels } = useSearchPublisher();
	const [state, setState] = React.useState<SavedMoves>(() => ({ ...EMPTY, isLoading: Boolean(transferId) }));
	React.useEffect(() => {
		if (!transferId) {
			setState(EMPTY);
			return;
		}
		let active = true;
		setState(previous => ({ ...previous, isLoading: true }));
		void readSavedMoves(transferId, publish, lastLabels).then((next) => {
			if (active) setState(next);
		});
		return () => {
			active = false;
		};
	}, [transferId, loadCount, publish, lastLabels]);
	return state;
}

async function readSavedMoves(
	transferId: string, publish: Publish, lastLabels: React.RefObject<Record<string, string>>,
): Promise<SavedMoves> {
	const moves = await publish(resourceCommands(STOCK_MOVE_SCHEMA_NAME).SEARCH, {
		page: 0, size: PAGE_SIZE, fields: SAVED_MOVE_FIELDS, with_edge_labels: true,
		graph: { if: ['transfer_id', '=', transferId], order: BY_SEQUENCE },
	});
	if (!moves) {
		return { ...EMPTY, failed: true };
	}
	return { groups: groupSavedMoves(moves), edgeLabels: { ...lastLabels.current }, isLoading: false, failed: false };
}

/**
 * The names of variants the labelled move read never saw (a drafted move's, or a saved move's new
 * one), so their cells read as names rather than ids. Names already read are kept across re-reads.
 */
export function useVariantNames(ids: string[]): Map<string, unknown> {
	const { publish } = useSearchPublisher();
	const [names, setNames] = React.useState(NO_NAMES);
	// Each id is asked for once, so an id the read does not return is not asked for again.
	const requested = React.useRef(new Set<string>());
	const key = ids.join(',');
	React.useEffect(() => {
		const missing = key === '' ? [] : key.split(',').filter(id => !requested.current.has(id));
		if (missing.length === 0) {
			return;
		}
		missing.forEach(id => requested.current.add(id));
		void publish(resourceCommands(PRODUCT_VARIANT_SCHEMA_NAME).SEARCH, {
			page: 0, size: PAGE_SIZE, fields: ['id', 'display_name'], graph: { if: ['id', 'in', ...missing] },
		}).then((items) => {
			if (items && items.length > 0) {
				const read = items.map(item => [String(item.id), item.display_name] as const);
				setNames(previous => new Map([...previous, ...read]));
			}
		});
	}, [key, publish]);
	return names;
}
