import { describe, expect, it } from 'vitest';

import { dottedColumnFields } from './dottedFields';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


function node(props: Record<string, unknown>, children?: ComponentNode[]): ComponentNode {
	return { type: 'component', component: 'test.node', props, ...(children ? { children } : {}) };
}

describe('dottedColumnFields', () => {
	it('collects the edge.leaf fields of every column, groups and tabs included', () => {
		const tree = [
			node({ header: 'a' }, [
				node({ fields: ['setting_id', 'setting.ui_mode', { fields: ['@@setting.theme_id', 'text'] }] }),
				node({ tabs: [node({ fields: ['setting.ui_mode', 'model.code'] })] }),
			]),
		];
		expect(dottedColumnFields(tree)).toEqual(['model.code', 'setting.theme_id', 'setting.ui_mode']);
	});

	it('finds none on a page of plain fields', () => {
		expect(dottedColumnFields([node({ fields: ['code', 'name'] })])).toEqual([]);
		expect(dottedColumnFields(undefined)).toEqual([]);
	});
});
