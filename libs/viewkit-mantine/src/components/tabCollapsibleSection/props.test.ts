import { describe, expect, it } from 'vitest';

import { tabCollapsibleSectionNode } from '../../props';


describe('tabCollapsibleSectionNode', () => {
	const contentNode = { type: 'component', component: 'a.b.c.v1' } as const;
	const tabs = [
		{ key: 'general', header: 'form.general', content: contentNode },
		{ key: 'stock', header: 'form.stock', content: contentNode },
	];

	it('builds a JSON-serializable component node', () => {
		const node = tabCollapsibleSectionNode({ tabs, translationNs: 'iam' });

		expect(node.type).toBe('component');
		expect(node.component).toBe('nikkierp.mantine.components.tabCollapsibleSection.v1');
		expect(JSON.parse(JSON.stringify(node))).toEqual(node);
	});

	it('applies defaults', () => {
		const node = tabCollapsibleSectionNode({ tabs, translationNs: 'iam' });

		expect(node.props).toMatchObject({
			minBlockCountWithoutTabs: 2,
			titleVisibility: 'auto',
			expanded: true,
			collapsible: false,
		});
	});

	it('derives collapsible from header, like collapsibleSectionNode', () => {
		const withHeader = tabCollapsibleSectionNode({ tabs, translationNs: 'iam', header: 'form.title' });
		expect(withHeader.props?.collapsible).toBe(true);

		const withoutHeader = tabCollapsibleSectionNode({ tabs, translationNs: 'iam' });
		expect(withoutHeader.props?.collapsible).toBe(false);
	});

	it('rejects duplicate tab keys', () => {
		expect(() => tabCollapsibleSectionNode({
			tabs: [tabs[0], { key: 'general', header: 'form.other', content: contentNode }],
			translationNs: 'iam',
		})).toThrow(/unique/);
	});

	it('rejects collapsible: true without a header', () => {
		expect(() => tabCollapsibleSectionNode({
			tabs, translationNs: 'iam', collapsible: true,
		})).toThrow(/needs a `header`/);
	});

	it('rejects an unknown key, because the schema is strict', () => {
		expect(() => tabCollapsibleSectionNode({
			tabs, translationNs: 'iam', extra: true,
		} as never)).toThrow();
	});

	it('requires at least one tab', () => {
		expect(() => tabCollapsibleSectionNode({ tabs: [], translationNs: 'iam' })).toThrow();
	});
});
