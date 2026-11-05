/**
 * Contribution ids owned by the sales module's own view kit, in the Mantine kit's
 * `{vendor}.{kit}.{kind}.{name}.v{major}` format. A breaking props change ships as a new `.v2` id.
 */
export const SALES_VIEW_KIT_ID = 'nikkierp.sales';

/** The draft order's Promotions section: voucher input, programs, reward choices and totals. */
export const ORDER_PROMOTIONS_PANEL = 'nikkierp.sales.components.orderPromotionsPanel.v1';

/** The order header's Confirm, which sends the accepted quote reference and handles a requote. */
export const ORDER_CONFIRM_ACTION = 'nikkierp.sales.components.orderConfirmAction.v1';

/** The voucher header's Revoke, with its optional note. */
export const REVOKE_VOUCHER_ACTION = 'nikkierp.sales.components.revokeVoucherAction.v1';

/** The promotion header's Generate vouchers, for the voucher-gated program types. */
export const GENERATE_VOUCHERS_ACTION = 'nikkierp.sales.components.generateVouchersAction.v1';

/** The promotion header's "Add all channels" / "Add all sales points" (BR-S02: the current ones only). */
export const SELECT_ALL_CHANNELS_ACTION = 'nikkierp.sales.components.selectAllChannelsAction.v1';
export const SELECT_ALL_POINTS_ACTION = 'nikkierp.sales.components.selectAllPointsAction.v1';

/** The promotion header's "Add a rule" / "Add a reward": the child's create page with the promotion filled in. */
export const ADD_RULE_ACTION = 'nikkierp.sales.components.addPromotionRuleAction.v1';
export const ADD_REWARD_ACTION = 'nikkierp.sales.components.addPromotionRewardAction.v1';
