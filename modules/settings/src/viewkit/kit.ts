import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import {
	settingsPagePaneRenderer, settingsPageRailRenderer, settingsPageSplitRenderer,
	settingsPageTitleRenderer,
} from './components/settingsPageParts';
import { SETTINGS_VIEW_KIT_ID } from './ids';
import { settingsPageTemplate } from './pages/template';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


/**
 * Settings-specific view contributions.
 *
 * They live in the module rather than in `viewkit-mantine` because a rail of micro-app slugs
 * beside a mounted foreign widget is not a general-purpose template -- the kit exists so the
 * page can stay plain JSON metadata while the behaviour stays owned by the module that needs it.
 */
export const settingsViewKit: IViewKit = {
	id: SETTINGS_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerPageTemplate(settingsPageTemplate);

		registry.registerComponentRenderer(settingsPageTitleRenderer);
		registry.registerComponentRenderer(settingsPageSplitRenderer);
		registry.registerComponentRenderer(settingsPageRailRenderer);
		registry.registerComponentRenderer(settingsPagePaneRenderer);
	},
};

/**
 * Installs the kit onto the host-owned engine. `use` is idempotent per kit id, so calling it
 * again from a re-run `init` is harmless.
 */
export function contributeSettingsViewKit(engine: IViewEngine): void {
	engine.use(settingsViewKit);
}
