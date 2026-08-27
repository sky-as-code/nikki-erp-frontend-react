import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `accounting` namespace, alongside the module's other labels, and must exist in
 * the backend's langJson files for both locales — a missing key renders as the raw `namespace:key`,
 * because there is deliberately no fallback locale.
 *
 * One top-level entry, well inside the five the Shell renders before collapsing the rest into an
 * overflow menu. Everything tax hangs beneath it: the module owns one subject, and nine siblings
 * competing at the top level would push whatever came last out of sight while telling a user
 * nothing about how the pieces relate.
 *
 * The order is the order an administrator sets them up in, not alphabetical. Jurisdictions,
 * groups and classifications are the vocabulary everything else refers to, so they come first;
 * taxes and their rates next; then the rules and mappings that decide which tax applies; then
 * rounding, which is a policy rather than a tax; and the simulator last, because it is the tool
 * for checking that all of the above came out right.
 *
 * Links use `_` between words, matching the route paths in `pages/`. Nothing validates that a link
 * resolves to a declared route, so the two are kept in step by hand — and `pages.test.ts` pins the
 * route list so a rename that misses this file is at least visible there.
 */
const ITEMS: MenuItem[] = [
	{
		labelKey: 'menu_tax',
		items: [
			{ labelKey: 'menu_taxJurisdictions', link: '/tax_jurisdictions' },
			{ labelKey: 'menu_taxGroups', link: '/tax_groups' },
			{ labelKey: 'menu_taxClassifications', link: '/tax_classifications' },
			{ labelKey: 'menu_taxes', link: '/taxes' },
			{ labelKey: 'menu_taxRates', link: '/tax_rates' },
			{ labelKey: 'menu_taxRules', link: '/tax_rules' },
			{ labelKey: 'menu_taxMappings', link: '/tax_mappings' },
			{ labelKey: 'menu_taxRoundingPolicies', link: '/tax_rounding_policies' },
			{ labelKey: 'menu_taxSimulator', link: '/tax_simulator' },
		],
	},
	// No entry for definition versions, components, rule conditions, rule results or mapping
	// lines. Each is a related record of the resource that owns it — a definition version is
	// edited from its tax, a condition from its rule — and a menu entry would offer a list of
	// fragments with no way to tell which parent each belongs to.
];

export function buildAccountingMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'accounting', items: ITEMS };
}
