import { findFirstMenuLink, isRibbonDropdown, menuItemsOf, RibbonMenuContribution } from '@nikkierp/ui/menu';
import { describe, expect, it } from 'vitest';

import { buildCommerceMenu } from './index';
import { buildAccountingPages } from '../bootstrap/accounting';
import { buildEssentialPages } from '../bootstrap/essential';
import { buildInventoryPages } from '../bootstrap/inventory';
import { buildPaymentInvoicePages } from '../bootstrap/paymentinvoice';
import { buildPurchasePages } from '../bootstrap/purchase';
import { buildSalesPages } from '../bootstrap/sales';


function ribbonLinks(menu: RibbonMenuContribution): string[] {
	return menu.tabs.flatMap(tab => tab.blocks.flatMap(block => block.items.flatMap(item => (
		isRibbonDropdown(item) ? item.items.map(link => link.link) : [item.link]
	))));
}

function allPages() {
	return [
		...buildInventoryPages(), ...buildPurchasePages(), ...buildSalesPages(),
		...buildPaymentInvoicePages(), ...buildAccountingPages(), ...buildEssentialPages(),
	];
}

describe('buildCommerceMenu', () => {
	const menu = buildCommerceMenu('commerce');

	it('is a ribbon with a tab per sub-module, in dependency order, then Setup', () => {
		expect(menu.type).toBe('ribbon');
		expect(menu.tabs.map(tab => tab.labelKey)).toEqual([
			'group_inventory', 'group_purchase', 'group_sales', 'group_setup',
		]);
	});

	it('gathers loose top-level links into a leading documents block', () => {
		const [, purchase, sales] = menu.tabs;

		expect(purchase.blocks[0].titleKey).toBe('block_documents');
		expect(purchase.blocks[0].items.map(item => item.labelKey)).toEqual([
			'purchase_menu_requestsForQuotation', 'purchase_menu_orders', 'purchase_menu_agreements',
		]);
		expect(sales.blocks.map(block => block.titleKey)).toEqual([
			'block_documents', 'sales_menu.billing', 'sales_menu.pricing', 'block_payment', 'block_configuration',
		]);
	});

	it('puts the payment pages in the Sales tab, before Configuration', () => {
		const payment = menu.tabs[2].blocks.find(block => block.titleKey === 'block_payment');

		expect(payment?.items.map(item => item.labelKey)).toEqual([
			'paymentinvoice_menu_orders', 'paymentinvoice_menu_transactions', 'paymentinvoice_menu_invoices',
		]);
	});

	it('fills the Setup tab with an Accounting and an Essential block of plain links', () => {
		const [accounting, essential] = menu.tabs[3].blocks;

		expect([accounting.titleKey, essential.titleKey]).toEqual(['block_accounting', 'block_essential']);
		expect(accounting.items).toHaveLength(9);
		expect(accounting.items.every(item => !isRibbonDropdown(item))).toBe(true);
		expect(essential.items.map(item => item.labelKey)).toEqual(['essential_menu_uoms', 'essential_menu_uomCategories']);
	});

	it('turns every group into a block, with no documents block when there are no loose links', () => {
		expect(menu.tabs[0].blocks.map(block => block.titleKey)).toEqual([
			'inventory_menu_products', 'inventory_menu_stock', 'inventory_menu_warehouse', 'inventory_menu_configuration',
		]);
	});

	it('links only to declared routes', () => {
		const routes = new Set(
			allPages().map(page => page.routePath),
		);
		const unresolved = ribbonLinks(menu).filter(link => !routes.has(link.replace(/^\//, '')));

		expect(unresolved).toEqual([]);
	});

	it('declares every route once across sub-modules and proxies', () => {
		const routes = allPages().map(page => page.routePath);

		expect(routes.filter((route, index) => routes.indexOf(route) !== index)).toEqual([]);
	});

	it('opens the module on the first inventory link', () => {
		expect(findFirstMenuLink(menuItemsOf(menu))).toBe('/inventory_product_template');
	});
});
