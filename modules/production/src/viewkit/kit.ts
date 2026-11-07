import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { actionDialogsRenderer } from './components/ActionDialogs';
import { bomStructureRenderer } from './components/bomStructure/BomStructure';
import { PRODUCTION_VIEW_KIT_ID } from './ids';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


export const productionViewKit: IViewKit = {
	id: PRODUCTION_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerComponentRenderer(actionDialogsRenderer);
		registry.registerComponentRenderer(bomStructureRenderer);
	},
};

/** Installs the kit onto the host-owned engine; `use` is idempotent per kit id. */
export function contributeProductionViewKit(engine: IViewEngine): void {
	engine.use(productionViewKit);
}
