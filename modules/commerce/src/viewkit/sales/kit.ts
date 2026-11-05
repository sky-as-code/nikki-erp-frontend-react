import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { addRewardActionRenderer, addRuleActionRenderer } from './components/AddPromotionChildAction';
import { generateVouchersActionRenderer } from './components/GenerateVouchersAction';
import { orderConfirmActionRenderer } from './components/promotions/OrderConfirmAction';
import { orderPromotionsPanelRenderer } from './components/promotions/OrderPromotionsPanel';
import { revokeVoucherActionRenderer } from './components/RevokeVoucherAction';
import { selectAllChannelsActionRenderer, selectAllPointsActionRenderer } from './components/SelectAllScopeAction';
import { SALES_VIEW_KIT_ID } from './ids';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


/** Sales-specific view contributions: the promotion components the JSON pages name by id. */
export const salesViewKit: IViewKit = {
	id: SALES_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerComponentRenderer(orderPromotionsPanelRenderer);
		registry.registerComponentRenderer(orderConfirmActionRenderer);
		registry.registerComponentRenderer(revokeVoucherActionRenderer);
		registry.registerComponentRenderer(generateVouchersActionRenderer);
		registry.registerComponentRenderer(selectAllChannelsActionRenderer);
		registry.registerComponentRenderer(selectAllPointsActionRenderer);
		registry.registerComponentRenderer(addRuleActionRenderer);
		registry.registerComponentRenderer(addRewardActionRenderer);
	},
};

/** Installs the kit onto the host-owned engine. `use` is idempotent per kit id. */
export function contributeSalesViewKit(engine: IViewEngine): void {
	engine.use(salesViewKit);
}
