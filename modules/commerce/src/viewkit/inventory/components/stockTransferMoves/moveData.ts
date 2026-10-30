import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { groupSavedMoves, SAVED_MOVE_FIELDS, templateIdsOf, VARIANT_VALUE_FIELDS } from './moveGroups';
import {
	PRODUCT_TEMPLATE_SCHEMA_NAME, PRODUCT_VARIANT_ATTRIBUTE_VALUE_SCHEMA_NAME, STOCK_MOVE_SCHEMA_NAME,
} from '../../../../constants/inventory';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


/** One transfer's moves fit one page; the page size limit of a search. */
const PAGE_SIZE = 500;
const BY_SEQUENCE: dyn.OrderBy = [['sequence', 'asc']];

type Publish = (name: string, payload: dyn.RestSearchRequest) => Promise<SearchItem[] | null>;

export type SavedMoves = {
	groups: SearchItem[],
	/** `{edge: label field}` of the labelled move read (the unit's label field). */
	edgeLabels: Record<string, string>,
	templateNames: Map<string, unknown>,
	isLoading: boolean,
	/** The read failed: the table shows no saved move rather than a misleading empty list. */
	failed: boolean,
};

const EMPTY: SavedMoves = { groups: [], edgeLabels: {}, templateNames: new Map(), isLoading: false, failed: false };

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

/**
 * The transfer's saved moves as groups, in two reads (a to-many edge must come last in `fields=`, and
 * each entry is capped at 50 characters): the moves with their variant's template, then the catalogue
 * value behind each variant's attribute values. A third read names the templates. Re-read on `loadCount`.
 */
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
	const edgeLabels = { ...lastLabels.current };
	const variantIds = [...new Set(moves.map(move => String(move.product_variant_id ?? '')).filter(Boolean))];
	const values = variantIds.length === 0 ? [] : await publish(
		resourceCommands(PRODUCT_VARIANT_ATTRIBUTE_VALUE_SCHEMA_NAME).SEARCH,
		{ page: 0, size: PAGE_SIZE, fields: VARIANT_VALUE_FIELDS, graph: { if: ['product_variant_id', 'in', ...variantIds] } },
	);
	const groups = groupSavedMoves(moves, values ?? []);
	const templateNames = await readTemplateNames(templateIdsOf(groups), publish);
	return { groups, edgeLabels, templateNames, isLoading: false, failed: values === null };
}

async function readTemplateNames(ids: string[], publish: Publish): Promise<Map<string, unknown>> {
	if (ids.length === 0) {
		return new Map();
	}
	const items = await publish(resourceCommands(PRODUCT_TEMPLATE_SCHEMA_NAME).SEARCH, {
		page: 0, size: PAGE_SIZE, fields: ['id', 'name'], graph: { if: ['id', 'in', ...ids] },
	});
	return new Map((items ?? []).map(item => [String(item.id), item.name]));
}
