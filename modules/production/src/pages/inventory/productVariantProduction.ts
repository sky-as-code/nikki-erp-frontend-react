// Proxy copy of commerce/src/pages/inventory/productVariantProduction.ts
// Kept identical by pages/proxyPages.test.ts; edit the owner, then copy it here.
import { resourceCommands } from '@nikkierp/common/dynamicModel';


/**
 * The Production module's records about a variant (BR production/01 §8, production/02 §10), shown as
 * read-only tabs of the variant page. Schemas and the search command are literals: Production is
 * another micro-app, which this module never imports; the Shell routes the `prod`, `mftr` and
 * `quality` prefixes to it and lazy-loads it on the first search. Rows open the record in Production.
 */
const PRODUCTION_MODULE = 'production';

type ProductionTab = {
	label: string,
	schemaName: string,
	filter: Record<string, unknown>,
	fields: string[],
	testId: string,
};

const TABS: ProductionTab[] = [
	{
		label: 'tabs.assemblies',
		schemaName: 'prod_assembly',
		filter: { if: ['product_variant_id', '=', '${id}'] },
		fields: ['code', 'serial_id', 'parent_assembly_id', 'status'],
		testId: 'inventory.variantAssemblies',
	},
	{
		label: 'tabs.used_in_assemblies',
		schemaName: 'prod_assembly_component',
		filter: { and: [{ if: ['product_variant_id', '=', '${id}'] }, { if: ['status', '=', 'installed'] }] },
		fields: ['assembly_id', 'lot_id', 'quantity', 'installed_at'],
		testId: 'inventory.variantUsedInAssemblies',
	},
	{
		label: 'tabs.boms',
		schemaName: 'mftr_bom',
		filter: { if: ['product_template_id', '=', '${product_template_id}'] },
		fields: ['code', 'product_variant_id', 'bom_type', 'quantity', 'active_version_id'],
		testId: 'inventory.variantBoms',
	},
	{
		label: 'tabs.used_in_boms',
		schemaName: 'mftr_bom_line',
		filter: { if: ['product_variant_id', '=', '${id}'] },
		fields: ['bom_version_id', 'quantity', 'uom_id'],
		testId: 'inventory.variantUsedInBoms',
	},
	{
		label: 'tabs.manufacturing_orders',
		schemaName: 'mftr_manufacturing_order',
		filter: { if: ['product_variant_id', '=', '${id}'] },
		fields: ['mo_number', 'quantity', 'deadline', 'status'],
		testId: 'inventory.variantManufacturingOrders',
	},
];

export function buildVariantProductionResources() {
	return TABS.map(tab => ({
		label: tab.label,
		schemaName: tab.schemaName,
		translationNs: PRODUCTION_MODULE,
		searchCommand: resourceCommands(tab.schemaName).SEARCH,
		initialGraph: tab.filter,
		fields: tab.fields,
		linkField: tab.schemaName === 'prod_assembly_component' ? 'assembly_id' : 'id',
		linkRoutePath: `/${PRODUCTION_MODULE}/${tab.schemaName === 'prod_assembly_component' ? 'prod_assembly' : tab.schemaName}`,
		testId: tab.testId,
	}));
}
