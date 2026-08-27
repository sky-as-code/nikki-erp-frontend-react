import { definePage, PageNode } from '@nikkierp/viewengine/metadata';

import * as c from '../constants';
import { TaxCommands } from '../features/tax/commands';
import { TaxJurisdictionCommands } from '../features/taxJurisdiction/commands';
import { TaxProductClassificationCommands } from '../features/taxProductClassification/commands';
import { TaxRoundingPolicyCommands } from '../features/taxRoundingPolicy/commands';
import { taxSimulatorProps } from '../viewkit/props';


/**
 * The Tax Simulator (BR-TAX-ESS-051).
 *
 * Unlike the eight CRUD pages this one is served by the module's own view kit rather than by the
 * Mantine resource templates: it prices a hypothetical document and explains the reasoning, which
 * no resource template can express. The page definition is still plain JSON — every prop below is
 * a command name or a string, never a function.
 */
export function buildTaxSimulatorPages(): PageNode[] {
	const simulator = taxSimulatorProps({
		translationNs: c.ACCOUNTING_MODULE,
		titleKey: 'menu_taxSimulator',
		simulateCommand: TaxCommands.SIMULATE,
		taxSearchCommand: TaxCommands.SEARCH,
		jurisdictionSearchCommand: TaxJurisdictionCommands.SEARCH,
		classificationSearchCommand: TaxProductClassificationCommands.SEARCH,
		roundingPolicySearchCommand: TaxRoundingPolicyCommands.SEARCH,
	});

	return [definePage({
		routePath: 'tax_simulator',
		template: simulator.template,
		props: simulator.props,
	})];
}
