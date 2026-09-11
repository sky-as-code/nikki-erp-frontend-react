import { createTestEngine } from '@nikkierp/viewengine/testing';
import { describe, expect, it } from 'vitest';

import * as ids from './ids';
import { mantineViewKit } from './kit';


/** Every page template id this kit declares, derived from `ids.ts` rather than hand-listed. */
const TEMPLATE_IDS = Object.entries(ids)
	.filter(([name, value]) => typeof value === 'string' && name !== 'MANTINE_VIEW_KIT_ID')
	.map(([, value]) => value as string)
	.filter(id => id.includes('.pages.templates.'));

describe('mantineViewKit', () => {
	it('registers every declared page template', () => {
		const engine = createTestEngine();
		engine.use(mantineViewKit);

		expect(TEMPLATE_IDS).toContain(ids.RESOURCE_IMPORT_TEMPLATE);
		for (const id of TEMPLATE_IDS) {
			expect(engine.getPageTemplate(id), `unregistered template: ${id}`).toBeDefined();
		}
	});
});
