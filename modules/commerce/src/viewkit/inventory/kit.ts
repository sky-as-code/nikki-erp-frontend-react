import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { attributeValuesRenderer } from './components/attributeValues/AttributeValues';
import { templateAttributesRenderer } from './components/templateAttributes/TemplateAttributes';
import { INVENTORY_VIEW_KIT_ID } from './ids';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


/**
 * Inventory-specific view contributions: sections whose behaviour belongs to this module, so the
 * pages can stay plain JSON metadata.
 */
export const inventoryViewKit: IViewKit = {
	id: INVENTORY_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerComponentRenderer(attributeValuesRenderer);
		registry.registerComponentRenderer(templateAttributesRenderer);
	},
};

/** Installs the kit onto the host-owned engine. `use` is idempotent per kit id. */
export function contributeInventoryViewKit(engine: IViewEngine): void {
	engine.use(inventoryViewKit);
}
