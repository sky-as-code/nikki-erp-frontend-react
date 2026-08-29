import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesPromotionProgramCommands } from '../features/salesPromotionProgram/commands';
import { SalesPromotionRewardCommands } from '../features/salesPromotionReward/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * One engine serves automatic, conditional and voucher-activated programs: the activation type is
 * data, not three implementations. `stack_policy` and `exclusive_group` decide what may combine
 * with what, and an empty group is not a group.
 */
export function buildSalesPromotionProgramPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPromotionProgramListProps(),
		secondary: buildSalesPromotionProgramDetailProps(),
	});

	return [definePage({
		routePath: 'sales_promotion_programs',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPromotionProgramListProps() {
	return resourceListProps({
		schemaName: c.SALES_PROMOTION_PROGRAM_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPromotionProgramCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesPromotionProgramCommands.SET_IS_ARCHIVED,
		fieldRenderers: {
			activation_type: {
				renderer: 'badge',
				colorMap: { automatic: 'blue', voucher_code: 'grape' },
				prefix: 'activation_type.',
			},
		},
	});
}

function buildSalesPromotionProgramDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_PROMOTION_PROGRAM_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesPromotionProgramCommands.GET_BY_ID,
			create: SalesPromotionProgramCommands.CREATE,
			update: SalesPromotionProgramCommands.UPDATE,
			archive: SalesPromotionProgramCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildSalesPromotionProgramFieldsSection()],
		childrenNodes: [buildSalesPromotionProgramFieldsSection(), ...buildSalesPromotionRewardsSection()],
	});
}

function buildSalesPromotionProgramFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.SALES_MODULE,
		tabs: [
			{
				key: 'program',
				header: 'form.program',
				content: resourceFormColumnNode({
					header: 'form.program',
					fields: ['code', 'name', 'activation_type', 'priority'],
				}),
			},
			{
				key: 'stacking',
				header: 'form.stacking',
				content: resourceFormColumnNode({
					header: 'form.stacking',
					// Resolution order is fixed: explicit `denied` wins, then explicit `allowed`, then
					// this policy — and the question is asked in both directions.
					fields: ['stack_policy', 'exclusive_group'],
				}),
			},
			{
				key: 'validity',
				header: 'form.validity',
				content: resourceFormColumnNode({
					header: 'form.validity',
					fields: ['valid_from', 'valid_until', 'usage_limit', 'usage_limit_per_customer'],
				}),
			},
			{
				key: 'returns',
				header: 'form.returns',
				content: resourceFormColumnNode({
					header: 'form.returns',
					// Returns are not built yet, so these are recorded and not yet acted on.
					fields: ['return_behavior', 'restore_on_full_return',
						'restore_on_partial_return'],
				}),
			},
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					header: 'form.other_information',
					fields: ['is_archived', 'org_id', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}

/**
 * The conditions live one level deeper, in `sales_promotion_condition_group`, and each group's
 * conditions hang off `group_id` rather than the usual `{parent}_id`. They get a page of their own
 * rather than being nested here.
 */
function buildSalesPromotionRewardsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_promotion_program_sections_rewards',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesPromotionRewardCommands.SEARCH,
				filterGraph: { if: ['sales_promotion_program_id', '=', '${id}'] },
				fields: ['sequence', 'reward_type', 'value', 'target_scope'],
			})],
		),
	];
}
