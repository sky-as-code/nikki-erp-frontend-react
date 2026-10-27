import { createTestEngine } from '@nikkierp/viewengine/testing';
import { describe, expect, it } from 'vitest';

import * as ids from './ids';
import { mantineViewKit } from './kit';


/** Every contribution id this kit declares, derived from `ids.ts` rather than hand-listed. */
const DECLARED_IDS = Object.entries(ids)
	.filter(([name, value]) => typeof value === 'string' && name !== 'MANTINE_VIEW_KIT_ID')
	.map(([, value]) => value as string);

const TEMPLATE_IDS = DECLARED_IDS.filter(id => id.includes('.pages.templates.'));
/**
 * Left out rather than asserted, so this test stays strict about the ids that are meant to be
 * placeable as they are: `resourceFormTabs.tab` has no renderer and no caller (tabs are passed to
 * `resourceFormTabs` as props), and `resourceForm.column.v1` is only an authoring id that the
 * detail template retargets to `resourceForm.column.v2` before render.
 */
const UNREGISTERED_IDS: string[] = [ids.RESOURCE_FORM_TABS_TAB, ids.RESOURCE_FORM_COLUMN];

const COMPONENT_IDS = DECLARED_IDS
	.filter(id => id.includes('.components.'))
	.filter(id => !UNREGISTERED_IDS.includes(id));

describe('mantineViewKit', () => {
	it('registers every declared page template', () => {
		const engine = createTestEngine();
		engine.use(mantineViewKit);

		expect(TEMPLATE_IDS).toContain(ids.RESOURCE_IMPORT_TEMPLATE);
		for (const id of TEMPLATE_IDS) {
			expect(engine.getPageTemplate(id), `unregistered template: ${id}`).toBeDefined();
		}
	});

	// An id declared but never registered renders as `UnknownComponent` at runtime rather than
	// failing anywhere a test would notice, so the two lists are pinned to each other here.
	it('registers every declared component', () => {
		const engine = createTestEngine();
		engine.use(mantineViewKit);

		expect(COMPONENT_IDS).toContain(ids.EXCEL_DATA_TABLE_BODY);
		for (const id of COMPONENT_IDS) {
			expect(engine.getComponentRenderer(id), `unregistered component: ${id}`).toBeDefined();
		}
	});
});
