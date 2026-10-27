import { findFirstMenuLink, isRibbonDropdown, menuItemsOf } from '@nikkierp/ui/menu';
import { describe, expect, it } from 'vitest';

import { buildIdentityMenu } from './menu';
import { buildGroupPages } from './pages/group';
import { buildOrganizationPages } from './pages/organization';
import { buildRolePages } from './pages/role';
import { buildServicePages } from './pages/service';
import { buildUserPages } from './pages/user';


describe('buildIdentityMenu', () => {
	const menu = buildIdentityMenu('iam');

	it('is a ribbon with an Identity and an Authorization tab', () => {
		expect(menu.type).toBe('ribbon');
		expect(menu.tabs.map(tab => tab.labelKey)).toEqual(['menu.identity', 'menu.authorization']);
		expect(menu.tabs[0].blocks.map(block => block.titleKey)).toEqual(['menu.users', 'menu.organizations']);
		expect(menu.tabs[1].blocks.map(block => block.titleKey)).toEqual(['menu.roles']);
	});

	it('links only to declared routes', () => {
		const routes = new Set(
			[
				...buildUserPages(), ...buildServicePages(), ...buildGroupPages(), ...buildOrganizationPages(),
				...buildRolePages(),
			]
				.map(page => page.routePath),
		);
		const links = menu.tabs.flatMap(tab => tab.blocks.flatMap(block => block.items.flatMap(item => (
			isRibbonDropdown(item) ? item.items.map(link => link.link) : [item.link]
		))));

		expect(links.filter(link => !routes.has(link.replace(/^\//, '')))).toEqual([]);
	});

	it('lists services beside users', () => {
		const items = menu.tabs[0].blocks[0].items;

		expect(items.map(item => ('link' in item ? item.link : undefined))).toEqual(['/iam_user', '/iam_service', '/iam_group']);
	});

	it('opens the module on users', () => {
		expect(findFirstMenuLink(menuItemsOf(menu))).toBe('/iam_user');
	});
});
