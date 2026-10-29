import { buildAccountingMenu } from './accounting';
import { buildEssentialMenu } from './essential';
import { buildInventoryMenu } from './inventory';
import { buildPaymentInvoiceMenu } from './paymentinvoice';
import { buildPurchaseMenu } from './purchase';
import { buildSalesMenu } from './sales';

import type {
	MenuItem, RibbonBlock, RibbonItem, RibbonLinkItem, RibbonMenuContribution, RibbonTab,
} from '@nikkierp/ui/menu';


/** Title of the block that gathers a sub-module's top-level links, which belong to no group. */
const DOCUMENTS_BLOCK_KEY = 'block_documents';
/** Sales' own setup group, shown as Configuration so it does not read like the Setup tab. */
const SALES_SETUP_GROUP_KEY = 'sales_menu.setup';
const CONFIGURATION_BLOCK_KEY = 'block_configuration';

/**
 * One ribbon for the whole module, with a tab per sub-module. Each sub-module group becomes a
 * block of its links; its loose top-level links (orders, quotations, ...) share a leading block.
 * The proxy sub-modules have no tab of their own: payments join Sales, and accounting and essential
 * fill a trailing Setup tab.
 *
 * A contribution carries a single `translationNs`, so the sub-module keys are re-homed in the
 * `commerce` namespace as `<sub>_<originalKey>` (e.g. `inventory_menu_stock`, `sales_menu.orders`);
 * the sub-module menus keep their own namespaces and keys untouched.
 */
export function buildCommerceMenu(slug: string): RibbonMenuContribution {
	return {
		slug,
		translationNs: 'commerce',
		type: 'ribbon',
		tabs: [
			subModuleTab('inventory', buildInventoryMenu(slug).items),
			subModuleTab('purchase', buildPurchaseMenu(slug).items),
			salesTab(slug),
			setupTab(slug),
		],
	};
}

/** Sales, with the payment pages in a block of their own just before its configuration. */
function salesTab(slug: string): RibbonTab {
	const tab = subModuleTab('sales', buildSalesMenu(slug).items);
	const blocks = tab.blocks.map(block => (
		block.titleKey === SALES_SETUP_GROUP_KEY ? { ...block, titleKey: CONFIGURATION_BLOCK_KEY } : block
	));
	const configurationAt = blocks.findIndex(block => block.titleKey === CONFIGURATION_BLOCK_KEY);
	const paymentBlock: RibbonBlock = {
		titleKey: 'block_payment',
		items: prefixLabelKeys('paymentinvoice', buildPaymentInvoiceMenu(slug).items).map(toRibbonItem),
	};
	blocks.splice(configurationAt < 0 ? blocks.length : configurationAt, 0, paymentBlock);
	return { ...tab, blocks };
}

/** Module-wide setup owned by other modules: a block each, their groups flattened into links. */
function setupTab(slug: string): RibbonTab {
	return {
		labelKey: 'group_setup',
		blocks: [
			flatBlock('block_accounting', 'accounting', buildAccountingMenu(slug).items),
			flatBlock('block_essential', 'essential', buildEssentialMenu(slug).items),
		],
	};
}

function flatBlock(titleKey: string, subModule: string, items: MenuItem[]): RibbonBlock {
	return { titleKey, items: flattenLinks(prefixLabelKeys(subModule, items)) };
}

function flattenLinks(items: MenuItem[]): RibbonLinkItem[] {
	return items.flatMap(item => (item.items ? flattenLinks(item.items) : [toRibbonLink(item)]));
}

function subModuleTab(subModule: string, items: MenuItem[]): RibbonTab {
	const prefixed = prefixLabelKeys(subModule, items);
	const looseLinks = prefixed.filter(item => !item.items).map(toRibbonLink);
	const groups = prefixed.filter(item => item.items).map(toRibbonBlock);
	const blocks = looseLinks.length > 0 ? [{ titleKey: DOCUMENTS_BLOCK_KEY, items: looseLinks }, ...groups] : groups;
	return { labelKey: `group_${subModule}`, blocks };
}

function toRibbonBlock(group: MenuItem): RibbonBlock {
	return { titleKey: group.labelKey, items: (group.items ?? []).map(toRibbonItem) };
}

function toRibbonItem(item: MenuItem): RibbonItem {
	return item.items
		? { labelKey: item.labelKey, items: item.items.map(toRibbonLink), ...rowspanOf(item) }
		: toRibbonLink(item);
}

function toRibbonLink(item: MenuItem): RibbonLinkItem {
	return {
		labelKey: item.labelKey, link: item.link ?? '/', requiredEntitlements: item.requiredEntitlements, ...rowspanOf(item),
	};
}

/** Only when set, so an ordinary entry keeps its exact shape. */
function rowspanOf(item: MenuItem): { rowspan?: boolean } {
	return item.rowspan ? { rowspan: true } : {};
}

function prefixLabelKeys(subModule: string, items: MenuItem[]): MenuItem[] {
	return items.map(item => ({
		...item,
		labelKey: `${subModule}_${item.labelKey}`,
		items: item.items ? prefixLabelKeys(subModule, item.items) : undefined,
	}));
}
