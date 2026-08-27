import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { taxSimulatorFormRenderer } from './components/TaxSimulatorForm';
import { taxSimulatorResultRenderer } from './components/TaxSimulatorResult';
import { taxSimulatorTraceRenderer } from './components/TaxSimulatorTrace';
import { ACCOUNTING_VIEW_KIT_ID } from './ids';
import { taxSimulatorTemplate } from './pages/template';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


/**
 * Tax-specific view contributions.
 *
 * They live in the module rather than in `viewkit-mantine` because a simulator that explains a
 * determination pipeline is not a general-purpose template — the kit exists so the eight CRUD
 * pages can stay plain JSON metadata while this one behaviour stays owned by the module that
 * needs it.
 */
export const accountingViewKit: IViewKit = {
	id: ACCOUNTING_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerPageTemplate(taxSimulatorTemplate);

		registry.registerComponentRenderer(taxSimulatorFormRenderer);
		registry.registerComponentRenderer(taxSimulatorResultRenderer);
		registry.registerComponentRenderer(taxSimulatorTraceRenderer);
	},
};

/**
 * Installs the kit onto the host-owned engine. `use` is idempotent per kit id, so calling it
 * again from a re-run `init` is harmless.
 */
export function contributeAccountingViewKit(engine: IViewEngine): void {
	engine.use(accountingViewKit);
}
