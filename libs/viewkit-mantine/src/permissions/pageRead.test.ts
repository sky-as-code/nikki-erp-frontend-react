import { describe, expect, it } from 'vitest';

import { pageReadRequirements } from './pageRead';

import type { PageNode } from '@nikkierp/viewengine/metadata';


describe('pageReadRequirements', () => {
	it('asks read on the template schema, and on both panes of a split view', () => {
		const page: PageNode = {
			type: 'page', routePath: 'x', template: 't',
			props: {
				primary: { template: 'list', props: { schemaName: 'iam_role' } },
				secondary: { template: 'detail', props: { schemaName: 'iam_role', relatedResources: [{ schemaName: 'iam_user' }] } },
			},
		};
		expect(pageReadRequirements(page)).toEqual([{ action: 'read', resource: 'iam_role', scope: 'org' }]);
	});

	it('asks nothing of a page bound to no resource', () => {
		expect(pageReadRequirements({ type: 'page', routePath: 'settings', props: { panes: [] } })).toEqual([]);
	});
});
