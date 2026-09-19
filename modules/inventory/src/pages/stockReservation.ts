import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockReservationCommands } from '../features/stockReservation/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Stock reservation: a quantity of one variant committed at one warehouse to one demand line, with
 * no location chosen (CR-INV-SALES-WH-RESERVATION §4.2).
 *
 * Read-mostly. The backend withholds create, update and delete; a row changes only through the
 * reservation operations, of which release is the one offered here. The two status columns are
 * deliberately both shown: `status` is what is stored, `effective_status` is what the clock says,
 * and a reservation past its deadline reads `expired` on the second while the first still says
 * `active` until the sweep catches up.
 */
export function buildStockReservationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockReservationListProps(),
		secondary: buildStockReservationDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_stock_reservation',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockReservationListProps() {
	return resourceListV2Props({
		schemaName: c.STOCK_RESERVATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockReservationCommands.SEARCH,
		createEnabled: false,
		fieldRenderers: buildStatusRenderers(),
	});
}

function buildStockReservationDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.STOCK_RESERVATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'source_id' },
		titleLvl2: { schemaField: 'effective_status' },
		backLinkTitle: { linkHref: '../' },
		allStatuses: [
			{ value: 'active', label: 'reservation_status.active', color: 'green' },
			{ value: 'consumed', label: 'reservation_status.consumed', color: 'blue' },
			{ value: 'released', label: 'reservation_status.released', color: 'gray' },
			{ value: 'expired', label: 'reservation_status.expired', color: 'orange' },
		],
		currentStatus: { schemaField: 'effective_status' },
		standardActionCommands: {
			getById: StockReservationCommands.GET_BY_ID,
		},
		contextualActions: {
			// Only a hold still in force has anything to give back; the backend answers a repeated
			// release with released_now = 0 rather than an error, so the condition is a courtesy.
			release: {
				label: 'actions.release',
				command: StockReservationCommands.RELEASE,
				condition: { field: 'effective_status', operator: 'equal' as const, value: 'active' },
				prompt: {
					title: 'actions.release.title',
					fields: [{ name: 'release_reason' }],
				},
			},
		},
		childrenNodes: [buildStockReservationFieldsSection()],
	});
}

/** Two badges over two columns, one colour map: the stored status never reads `expired`. */
function buildStatusRenderers() {
	const colorMap = { active: 'green', consumed: 'blue', released: 'gray', expired: 'orange' };
	return {
		status: { renderer: 'badge', colorMap, prefix: 'reservation_status.' },
		effective_status: { renderer: 'badge', colorMap, prefix: 'reservation_status.' },
	};
}

function buildStockReservationFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		tabs: [
			{
				key: 'reservation',
				header: 'form.reservation',
				content: resourceFormColumnNode({
					header: 'form.reservation',
					fields: ['warehouse_id', 'product_variant_id', 'base_uom_id', 'quantity', 'consumed_quantity',
						'released_quantity', 'remaining_quantity', 'effective_reserved_quantity'],
				}),
			},
			{
				key: 'lifecycle',
				header: 'form.lifecycle',
				content: resourceFormColumnNode({
					header: 'form.lifecycle',
					fields: ['status', 'effective_status', 'reserved_until', 'release_reason', 'released_at',
						'expiry_recorded_at'],
				}),
			},
			{
				key: 'source',
				header: 'form.source',
				content: resourceFormColumnNode({
					header: 'form.source',
					fields: ['source_module', 'source_type', 'source_id', 'source_line_id', 'source_revision',
						'idempotency_key', 'request_fingerprint', 'org_id', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}
