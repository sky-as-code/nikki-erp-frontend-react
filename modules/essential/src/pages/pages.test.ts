import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildUomPages } from './uom';
import { buildUomCatPages } from './uomcat';

import type { PageNode, TemplateRef } from '@nikkierp/viewengine/metadata';
import type { RelatedResource } from '@nikkierp/viewkit-mantine/props';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'uom', build: buildUomPages },
	{ name: 'uomcat', build: buildUomCatPages },
];

describe('Essential page metadata', () => {
	// Building runs each prop builder's zod `parse`, and every page schema is `.strict()`.
	it.each(allPages)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages nest a v2 list and a v2 detail in a split view', ({ build }) => {
		for (const page of build()) {
			const { primary, secondary } = page.props as { primary: TemplateRef, secondary: TemplateRef };

			expect(page.template).toContain('resourceSplitView');
			expect(primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
			expect(secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
		}
	});

	it('lists a category\'s units as a related resource filtered by the category id', () => {
		const [page] = buildUomCatPages();
		const props = page.props as { secondary: TemplateRef<{ relatedResources: RelatedResource[] }> };
		const [units] = props.secondary.props?.relatedResources ?? [];

		expect(units.label).toBe('uom_sections_uoms');
		expect(units.initialGraph).toEqual({ if: ['category_id', '=', '${id}'] });
		expect(units.linkRoutePath).toBe('essential_uom');
	});
});
