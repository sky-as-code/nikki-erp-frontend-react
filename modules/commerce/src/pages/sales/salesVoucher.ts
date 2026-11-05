import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import { APPLICATION_STATUS_BADGE, MONEY_RENDERER, VOUCHER_AVAILABILITY_BADGE } from './promotionShared';
import * as c from '../../constants/sales';
import { SalesPromotionApplicationCommands } from '../../features/sales/salesPromotionApplication/commands';
import { SalesVoucherCommands } from '../../features/sales/salesVoucher/commands';
import { REVOKE_VOUCHER_ACTION } from '../../viewkit/sales/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const VOUCHER_STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { active: 'green', revoked: 'red' },
	prefix: 'status.',
} as const;

const VOUCHER_TYPE_BADGE = {
	renderer: 'badge',
	colorMap: { reusable: 'blue', single_use: 'grape' },
	prefix: 'voucher_type.',
} as const;

/**
 * Who a voucher belongs to and where it came from never change after create: a next-order coupon's
 * `source_order_id` is set only by the source order's Confirm, so a client cannot fake its history.
 */
const READ_ONLY_AFTER_CREATE = ['customer_id', 'source_order_id', 'voucher_type'];

export function buildSalesVoucherPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesVoucherListProps(),
		secondary: buildSalesVoucherDetailProps(),
	});

	return [definePage({
		routePath: 'sales_voucher',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesVoucherListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_VOUCHER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesVoucherCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesVoucherCommands.SET_IS_ARCHIVED,
		fieldRenderers: {
			status: VOUCHER_STATUS_BADGE,
			voucher_type: VOUCHER_TYPE_BADGE,
			availability: VOUCHER_AVAILABILITY_BADGE,
		},
	});
}

/** `availability` is the badge that matters: a voucher can be `active` and still expired or exhausted. */
function buildSalesVoucherDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_VOUCHER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'code' },
		titleLvl2: { schemaField: 'availability' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: {
			status: VOUCHER_STATUS_BADGE,
			voucher_type: VOUCHER_TYPE_BADGE,
			availability: VOUCHER_AVAILABILITY_BADGE,
		},
		standardActionCommands: {
			getById: SalesVoucherCommands.GET_BY_ID,
			create: SalesVoucherCommands.CREATE,
			update: SalesVoucherCommands.UPDATE,
			delete: SalesVoucherCommands.DELETE,
			archive: SalesVoucherCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildSalesVoucherActions(),
		createNodes: [buildSalesVoucherFieldsSection(false)],
		childrenNodes: [buildSalesVoucherFieldsSection(true)],
		relatedResources: [buildVoucherApplicationsResource()],
	});
}

function buildSalesVoucherFieldsSection(isUpdate: boolean): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.voucher',
			fields: ['promotion_id', 'code', ...(isUpdate ? ['voucher_type', 'status', 'availability'] : []),
				'customer_id'],
			readOnlyFields: isUpdate ? READ_ONLY_AFTER_CREATE : undefined,
		}),
		resourceFormColumnNode({
			header: 'form.validityUsage',
			// `used_count` is consumed by Confirm and released by Cancel; never written here.
			fields: ['valid_from', 'expires_at', 'usage_limit', ...(isUpdate ? ['used_count'] : [])],
		}),
		...(isUpdate ? [buildSalesVoucherOriginBlock()] : []),
	]);
}

function buildSalesVoucherOriginBlock(): ComponentNode {
	return resourceFormColumnNode({
		header: 'form.origin',
		fields: ['source_order_id', 'issued_at', 'revoked_at', 'revoked_by', 'revocation_reason', 'revocation_note',
			'is_archived'],
		readOnlyFields: READ_ONLY_AFTER_CREATE,
	});
}

/** Revoke is terminal and offered only while active; archiving is the standard action. */
function buildSalesVoucherActions() {
	return {
		// A component: its dialog collects the optional note, which is not a writable voucher field.
		revoke: {
			label: 'actions.revoke',
			component: REVOKE_VOUCHER_ACTION,
			actionCode: 'revoke',
			condition: { field: 'status', operator: 'equal' as const, value: c.VOUCHER_STATUS_ACTIVE },
		},
	};
}

/** Read-only: the confirmed orders this code was used on. Readable with `read` on `sales_order`. */
function buildVoucherApplicationsResource() {
	return {
		label: 'voucher_sections_applications',
		emptyMessage: 'promotion_applications_empty',
		schemaName: c.SALES_PROMOTION_APPLICATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesPromotionApplicationCommands.SEARCH,
		initialGraph: { if: ['voucher_id', '=', '${id}'] },
		fields: ['order_id', 'status', 'discount_total_amount', 'applied_at', 'reversed_at'],
		fieldRenderers: { status: APPLICATION_STATUS_BADGE, discount_total_amount: MONEY_RENDERER },
		linkField: 'order_id',
		linkRoutePath: 'sales_order',
	};
}
