import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockScrapCommands } from '../features/stockScrap/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Stock scrap: the document that writes goods off to a scrap location.
 *
 * Unlike the stock balance, this page binds the full set of write actions â€” a scrap is a document
 * a user raises, edits and may abandon. The backend refuses an edit or a delete once the scrap is
 * done, so those buttons remain offered and the server explains why on the one case that is
 * refused. That is the right way round here: hiding them would leave a user wondering where the
 * action went, where a refusal names the reason. See BR Â§4.2.9.
 */
export function buildStockScrapPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockScrapListProps(),
		secondary: buildStockScrapDetailProps(),
	});

	return [definePage({
		routePath: 'stock_scraps',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockScrapListProps() {
	return resourceListProps({
		schemaName: c.STOCK_SCRAP_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockScrapCommands.SEARCH,
		createEnabled: true,
		deleteCommand: StockScrapCommands.DELETE,
		updateSaveCommand: StockScrapCommands.UPDATE,
		fieldRenderers: {
			// Grey while it is only a plan, red once the goods are gone: a done scrap is the one
			// state that cannot be walked back.
			status: {
				renderer: 'badge',
				colorMap: { draft: 'gray', done: 'red' },
				prefix: 'scrap_status.',
			},
		},
	});
}

function buildStockScrapDetailProps() {
	return resourceDetailProps({
		schemaName: c.STOCK_SCRAP_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'scrap_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: StockScrapCommands.GET_BY_ID,
			create: StockScrapCommands.CREATE,
			update: StockScrapCommands.UPDATE,
			delete: StockScrapCommands.DELETE,
		},
		contextualActions: {
			// Only a draft can be executed, and the condition says so rather than letting the user
			// press a button the backend will refuse.
			do_scrap: {
				label: 'actions.do_scrap',
				command: StockScrapCommands.DO_SCRAP,
				condition: { field: 'status', operator: 'equal' as const, value: 'draft' },
			},
		},
		createNodes: [buildStockScrapFieldsSection()],
		childrenNodes: [buildStockScrapFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildStockScrapFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['scrap_number', 'status', 'origin_reference', 'transfer_id', 'note', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.scrapDetails',
				fields: [
					'product_variant_id', 'quantity', 'base_uom_id',
					'source_location_id', 'scrap_location_id',
				],
			}),
			resourceFormColumnNode({
				// Empty until a lot, package or owner narrows which goods are scrapped â€” a read-mode
				// field with no value is hidden, so an untracked scrap does not show this block.
				header: 'form.identification',
				fields: ['lot_ref', 'package_ref', 'owner_ref'],
			}),
			resourceFormColumnNode({
				header: 'form.reason',
				fields: ['reason_code', 'reason'],
			}),
			resourceFormColumnNode({
				// move_id is the audit trail from the document to the stock it removed; both are
				// written by Do Scrap and by nothing else.
				header: 'form.audit',
				fields: ['move_id', 'completed_at', 'created_at', 'updated_at'],
			}),
		],
	);
}
