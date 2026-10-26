import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import { PageNode } from '@nikkierp/viewengine/metadata';

import { TAX_SCHEMA_NAME } from '../constants/accounting';
import { buildTaxPages } from '../pages/accounting/tax';
import { buildTaxGroupPages } from '../pages/accounting/taxGroup';
import { buildTaxJurisdictionPages } from '../pages/accounting/taxJurisdiction';
import { buildTaxMappingPages } from '../pages/accounting/taxMapping';
import { buildTaxProductClassificationPages } from '../pages/accounting/taxProductClassification';
import { buildTaxRateVersionPages } from '../pages/accounting/taxRateVersion';
import { buildTaxRoundingPolicyPages } from '../pages/accounting/taxRoundingPolicy';
import { buildTaxRulePages } from '../pages/accounting/taxRule';
import { buildTaxSimulatorPages } from '../pages/accounting/taxSimulator';


/**
 * Tax pages proxied from the accounting micro-app, which keeps its schemas, services, handlers and
 * view kit: Commerce registers none of them.
 */
export function buildAccountingPages(): PageNode[] {
	return [
		...buildTaxJurisdictionPages(),
		...buildTaxGroupPages(),
		...buildTaxProductClassificationPages(),
		...buildTaxPages(),
		...buildTaxRateVersionPages(),
		...buildTaxRulePages(),
		...buildTaxMappingPages(),
		...buildTaxRoundingPolicyPages(),
		...buildTaxSimulatorPages(),
	];
}

/**
 * Loads the accounting micro-app ahead of need. The Tax Simulator page renders accounting's own
 * page template, which exists only once that micro-app's `init` has installed its kit, and a page
 * does not re-render when a kit arrives later. Asking for an accounting schema is the owner-loading
 * path the schema registry already provides; a failure only leaves the simulator unavailable.
 */
export function preloadAccounting(): void {
	schemaRegistry.get(TAX_SCHEMA_NAME).catch((error: unknown) => {
		console.warn('[commerce] accounting could not be preloaded; the Tax Simulator may not render.', error);
	});
}
