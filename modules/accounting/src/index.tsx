import { schemaRegistry } from '@nikkierp/common/dynamicModel';
import {
	defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps, MicroAppProvider,
} from '@nikkierp/ui/microApp';
import { ViewEngineRouter } from '@nikkierp/viewkit-mantine';
import React from 'react';

import * as c from './constants';
import { registerTaxCommands } from './features/tax/commands';
import { registerTaxComponentCommands } from './features/taxComponent/commands';
import { registerTaxDefinitionVersionCommands } from './features/taxDefinitionVersion/commands';
import { registerTaxGroupCommands } from './features/taxGroup/commands';
import { registerTaxJurisdictionCommands } from './features/taxJurisdiction/commands';
import { registerTaxMappingCommands } from './features/taxMapping/commands';
import { registerTaxMappingLineCommands } from './features/taxMappingLine/commands';
import { registerTaxProductClassificationCommands } from './features/taxProductClassification/commands';
import { registerTaxRateVersionCommands } from './features/taxRateVersion/commands';
import { registerTaxRoundingPolicyCommands } from './features/taxRoundingPolicy/commands';
import { registerTaxRuleCommands } from './features/taxRule/commands';
import { registerTaxRuleConditionCommands } from './features/taxRuleCondition/commands';
import { registerTaxRuleResultCommands } from './features/taxRuleResult/commands';
import { buildAccountingMenu } from './menu';
import { buildTaxPages } from './pages/tax';
import { buildTaxGroupPages } from './pages/taxGroup';
import { buildTaxJurisdictionPages } from './pages/taxJurisdiction';
import { buildTaxMappingPages } from './pages/taxMapping';
import { buildTaxProductClassificationPages } from './pages/taxProductClassification';
import { buildTaxRateVersionPages } from './pages/taxRateVersion';
import { buildTaxRoundingPolicyPages } from './pages/taxRoundingPolicy';
import { buildTaxRulePages } from './pages/taxRule';
import { buildTaxSimulatorPages } from './pages/taxSimulator';
import { contributeAccountingViewKit } from './viewkit/kit';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	/**
	 * Runs once per slug, synchronously, outside React.
	 *
	 * Everything registered here — schemas, the view kit, the menu, the command handlers — has to
	 * exist before the first render resolves a command or a template. Doing any of it in an effect
	 * would race the first page load, which fails as a page that never finishes loading rather
	 * than as an error.
	 */
	init({ htmlTag, slug, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// No `registerReducer`: this module keeps its state in its own store (`./store`), and
		// reaches the Shell only through the command and event buses.
		registerModelSchemas();
		// The simulator's template and its three components live in this module's own kit. `use`
		// is idempotent per kit id, so a re-run init is harmless.
		contributeAccountingViewKit(host.viewEngine);
		host.menuRegistry.register(buildAccountingMenu(slug));

		// Registration order mirrors `registerModelSchemas` — referenced before referencing — so a
		// missing entry is obvious with the two lists side by side.
		registerTaxJurisdictionCommands(host.commandBus);
		registerTaxGroupCommands(host.commandBus);
		registerTaxRoundingPolicyCommands(host.commandBus);
		registerTaxProductClassificationCommands(host.commandBus);
		registerTaxCommands(host.commandBus);
		registerTaxDefinitionVersionCommands(host.commandBus);
		registerTaxRateVersionCommands(host.commandBus);
		registerTaxComponentCommands(host.commandBus);
		registerTaxMappingCommands(host.commandBus);
		registerTaxMappingLineCommands(host.commandBus);
		registerTaxRuleCommands(host.commandBus);
		registerTaxRuleConditionCommands(host.commandBus);
		registerTaxRuleResultCommands(host.commandBus);

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const pages = React.useMemo(() => [
		...buildTaxJurisdictionPages(),
		...buildTaxGroupPages(),
		...buildTaxProductClassificationPages(),
		...buildTaxPages(),
		...buildTaxRateVersionPages(),
		...buildTaxRulePages(),
		...buildTaxMappingPages(),
		...buildTaxRoundingPolicyPages(),
		...buildTaxSimulatorPages(),
	], []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages, indexElement: <h1>Accounting</h1> }}
		/>
	);
}

/**
 * All thirteen schemas are registered, including the five with no page of their own.
 *
 * A relation select resolves its target through this registry, so a jurisdiction that is not
 * registered leaves the field on a tax showing a raw ULID; a rule condition that is not registered
 * leaves the related-records table on a rule unable to load at all.
 *
 * The order is referenced-before-referencing, matching the backend's own registration order: an
 * edge resolves against the registry as it is registered, so a schema must come after everything
 * it points at.
 */
function registerModelSchemas(): void {
	schemaRegistry.register([{
		// The tree every other resource sites itself in.
		schemaName: c.TAX_JURISDICTION_SCHEMA_NAME,
		resourcePath: c.TAX_JURISDICTION_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_GROUP_SCHEMA_NAME,
		resourcePath: c.TAX_GROUP_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_ROUNDING_POLICY_SCHEMA_NAME,
		resourcePath: c.TAX_ROUNDING_POLICY_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_PRODUCT_CLASSIFICATION_SCHEMA_NAME,
		resourcePath: c.TAX_PRODUCT_CLASSIFICATION_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_SCHEMA_NAME,
		resourcePath: c.TAX_RESOURCE_PATH,
	}, {
		// No page of its own: a definition version is edited from the tax that owns it, because a
		// list of versions without their taxes says nothing about which is which. Registered so
		// that table can load.
		schemaName: c.TAX_DEFINITION_VERSION_SCHEMA_NAME,
		resourcePath: c.TAX_DEFINITION_VERSION_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_RATE_VERSION_SCHEMA_NAME,
		resourcePath: c.TAX_RATE_VERSION_RESOURCE_PATH,
	}, {
		// Reached as a related record of the definition version that composes it.
		schemaName: c.TAX_COMPONENT_SCHEMA_NAME,
		resourcePath: c.TAX_COMPONENT_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_MAPPING_SCHEMA_NAME,
		resourcePath: c.TAX_MAPPING_RESOURCE_PATH,
	}, {
		// A line has no life outside the mapping that owns it.
		schemaName: c.TAX_MAPPING_LINE_SCHEMA_NAME,
		resourcePath: c.TAX_MAPPING_LINE_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_RULE_SCHEMA_NAME,
		resourcePath: c.TAX_RULE_RESOURCE_PATH,
	}, {
		// Conditions and results are the whole of what a rule does, and are edited from it.
		schemaName: c.TAX_RULE_CONDITION_SCHEMA_NAME,
		resourcePath: c.TAX_RULE_CONDITION_RESOURCE_PATH,
	}, {
		schemaName: c.TAX_RULE_RESULT_SCHEMA_NAME,
		resourcePath: c.TAX_RULE_RESULT_RESOURCE_PATH,
	}]);
}
