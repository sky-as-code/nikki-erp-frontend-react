import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesVoucherCodeCommands } from '../features/salesVoucherCode/commands';
import { SalesVoucherRedemptionCommands } from '../features/salesVoucherRedemption/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * `usage_count` is maintained by redemption, not written here. The limit is enforced by a
 * conditional update that fails once the count reaches it, which is what keeps a single-use code
 * single-use when two tills try it at the same moment.
 */
export function buildSalesVoucherCodePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesVoucherCodeListProps(),
		secondary: buildSalesVoucherCodeDetailProps(),
	});

	return [definePage({
		routePath: 'sales_voucher_codes',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesVoucherCodeListProps() {
	return resourceListProps({
		schemaName: c.SALES_VOUCHER_CODE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesVoucherCodeCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesVoucherCodeCommands.SET_IS_ARCHIVED,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { active: 'green', disabled: 'gray', exhausted: 'orange' },
				prefix: 'status.',
			},
		},
	});
}

function buildSalesVoucherCodeDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_VOUCHER_CODE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'code' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesVoucherCodeCommands.GET_BY_ID,
			create: SalesVoucherCodeCommands.CREATE,
			update: SalesVoucherCodeCommands.UPDATE,
			archive: SalesVoucherCodeCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildSalesVoucherCodeFieldsSection()],
		childrenNodes: [buildSalesVoucherCodeFieldsSection(), ...buildSalesVoucherRedemptionsSection()],
	});
}

function buildSalesVoucherCodeFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.voucher',
				fields: ['code', 'sales_promotion_program_id', 'status'],
			}),
			resourceFormColumnNode({
				header: 'form.usage',
				// `usage_count` is written by redemption; editing it by hand grants another use of
				// a code that was already spent.
				fields: ['usage_limit', 'usage_count'],
			}),
			resourceFormColumnNode({
				header: 'form.validity',
				fields: ['valid_from', 'valid_until'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['is_archived', 'org_id', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * Filtered on `voucher_code_id`, not `sales_voucher_code_id`: this child breaks the
 * `{parent_schema}_id` convention, and the conventional name would return an empty table rather
 * than an error. Read-only, because redemption is what enforces the usage limit.
 */
function buildSalesVoucherRedemptionsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_voucher_code_sections_redemptions',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_VOUCHER_REDEMPTION_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesVoucherRedemptionCommands.SEARCH,
				filterGraph: { if: ['voucher_code_id', '=', '${id}'] },
				fields: ['sales_order_id', 'status', 'reserved_at', 'redeemed_at', 'released_at',
					'reversed_at'],
				fieldRenderers: {
					status: {
						renderer: 'badge',
						colorMap: {
							reserved: 'orange',
							redeemed: 'green',
							released: 'gray',
							reversed: 'red',
						},
						prefix: 'status.',
					},
				},
			})],
		),
	];
}
