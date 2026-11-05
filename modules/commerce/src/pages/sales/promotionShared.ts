import * as ic from '../../constants/inventory';
import * as c from '../../constants/sales';


/** One colour map for the list badge and the detail status strip, so both read alike. */
export const PROMOTION_STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { draft: 'gray', active: 'green', suspended: 'orange' },
	prefix: 'status.',
} as const;

export const PROGRAM_TYPE_BADGE = {
	renderer: 'badge',
	colorMap: {
		automatic: 'blue',
		discount_code: 'grape',
		coupon: 'violet',
		buy_x_get_y: 'teal',
		next_order_coupon: 'indigo',
	},
	prefix: 'program_type.',
} as const;

export const REWARD_TYPE_BADGE = {
	renderer: 'badge',
	colorMap: { discount: 'green', free_product: 'teal', free_shipping: 'gray' },
	prefix: 'promotion_reward_type.',
} as const;

/** Derived by the server, archived first: the first reason that applies is the one shown. */
export const VOUCHER_AVAILABILITY_BADGE = {
	renderer: 'badge',
	colorMap: {
		available: 'green',
		promotion_unavailable: 'orange',
		not_started: 'blue',
		expired: 'gray',
		exhausted: 'orange',
		revoked: 'red',
		archived: 'dark',
	},
	prefix: 'voucher_availability.',
} as const;

/** The promotion's own derived availability; `status` alone does not tell expired or exhausted apart. */
export const PROMOTION_AVAILABILITY_BADGE = {
	renderer: 'badge',
	colorMap: { available: 'green', not_started: 'blue', expired: 'gray', exhausted: 'orange', archived: 'dark' },
	prefix: 'promotion_availability.',
} as const;

export const APPLICATION_STATUS_BADGE = {
	renderer: 'badge',
	colorMap: { confirmed: 'green', reversed: 'gray' },
	prefix: 'status.',
} as const;

export const MONEY_RENDERER = { renderer: 'money' } as const;
export const QUANTITY_RENDERER = { renderer: 'float' } as const;

/** The parent's draft-or-suspended gate is the backend's (`config_locked`); the lock here is `update` on it. */
export const PROMOTION_UPDATE_LOCK = {
	actionCode: 'update',
	actionResource: c.SALES_PROMOTION_SCHEMA_NAME,
} as const;

type SelectorOwner = {
	/** The selector rows' FK to their owner: `rule_id` or `reward_id`. */
	ownerField: 'rule_id' | 'reward_id',
	productSchemaName: string,
	categorySchemaName: string,
	searchProducts: string,
	searchCategories: string,
	manageTemplates: string,
	manageVariants: string,
	manageCategories: string,
};

/**
 * The selector tabs of a rule or a reward. Rows are selector records: removing one sends its own id, adding
 * sends the picked template, variant or category id. A template row and a variant row live in the same table,
 * so each tab lists only the rows of its own kind.
 */
export function selectorResources(owner: SelectorOwner) {
	return [
		productSelectorResource(owner, 'product_template_id', ic.PRODUCT_TEMPLATE_SCHEMA_NAME, owner.manageTemplates),
		productSelectorResource(owner, 'product_variant_id', ic.PRODUCT_VARIANT_SCHEMA_NAME, owner.manageVariants),
		{
			label: 'promotion_sections_categories',
			emptyMessage: 'promotion_selector_empty',
			schemaName: owner.categorySchemaName,
			translationNs: c.SALES_MODULE,
			searchCommand: owner.searchCategories,
			initialGraph: { if: [owner.ownerField, '=', '${id}'] },
			fields: ['category_id'],
			assignment: {
				...PROMOTION_UPDATE_LOCK,
				pickerSchemaName: ic.PRODUCT_CATEGORY_SCHEMA_NAME,
				manageCommand: owner.manageCategories,
				newRowPrompt: 'promotion_assign_category',
				newRowSearchField: 'category_id',
				btnDeleteLabel: 'common:action.unassign',
			},
		},
	];
}

function productSelectorResource(
	owner: SelectorOwner, field: 'product_template_id' | 'product_variant_id', pickerSchemaName: string,
	manageCommand: string,
) {
	const isTemplate = field === 'product_template_id';
	return {
		label: isTemplate ? 'promotion_sections_productTemplates' : 'promotion_sections_productVariants',
		emptyMessage: 'promotion_selector_empty',
		schemaName: owner.productSchemaName,
		translationNs: c.SALES_MODULE,
		searchCommand: owner.searchProducts,
		initialGraph: { and: [{ if: [owner.ownerField, '=', '${id}'] }, { if: [field, 'is_set'] }] },
		fields: [field],
		assignment: {
			...PROMOTION_UPDATE_LOCK,
			pickerSchemaName,
			manageCommand,
			newRowPrompt: isTemplate ? 'promotion_assign_productTemplate' : 'promotion_assign_productVariant',
			newRowSearchField: field,
			btnDeleteLabel: 'common:action.unassign',
		},
	};
}
