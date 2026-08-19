import { describe, expect, it } from 'vitest';

import { resourceFormTabsNode } from '../../props';


describe('resourceFormTabsNode', () => {
	const tabs = [{ key: 'general', header: 'form.general' }, { key: 'stock', header: 'form.stock' }];

	it('builds a JSON-serializable component node', () => {
		const node = resourceFormTabsNode({ tabs, translationNs: 'iam' }, []);

		expect(node.type).toBe('component');
		expect(node.component).toBe('nikkierp.mantine.components.resourceFormTabs.v1');
		expect(JSON.parse(JSON.stringify(node))).toEqual(node);
	});

	it('keeps children positional, one per tab', () => {
		const children = [
			{ type: 'component', component: 'a.b.c.v1' } as const,
			{ type: 'component', component: 'd.e.f.v1' } as const,
		];
		const node = resourceFormTabsNode({ tabs, translationNs: 'iam' }, [...children]);

		expect(node.children).toEqual(children);
	});

	it('rejects duplicate tab keys', () => {
		expect(() => resourceFormTabsNode(
			{ tabs: [tabs[0], { key: 'general', header: 'form.other' }], translationNs: 'iam' }, [],
		)).toThrow(/unique/);
	});

	it('rejects a defaultTab that names no tab', () => {
		expect(() => resourceFormTabsNode(
			{ tabs, translationNs: 'iam', defaultTab: 'nope' }, [],
		)).toThrow(/must name one of the tabs/);
	});

	it('rejects an unknown key, because the schema is strict', () => {
		expect(() => resourceFormTabsNode(
			{ tabs, translationNs: 'iam', expanded: true } as never, [],
		)).toThrow();
	});

	it('requires at least one tab', () => {
		expect(() => resourceFormTabsNode({ tabs: [], translationNs: 'iam' }, [])).toThrow();
	});
});
