import { describe, expect, it } from 'vitest';

import { resourceDetailV2PropsSchema } from './props';
import { statusStripProps } from './statusStripProps';


describe('statusStripProps', () => {
	const badge = { colorMap: { draft: 'gray', done: 'teal' }, prefix: 'transfer_status.' };

	it('lists the badge statuses in colour-map order, labelled by the badge prefix', () => {
		expect(statusStripProps(badge).allStatuses).toEqual([
			{ value: 'draft', color: 'gray', label: 'transfer_status.draft' },
			{ value: 'done', color: 'teal', label: 'transfer_status.done' },
		]);
	});

	it('reads `status` in the first section header unless told another field', () => {
		expect(statusStripProps(badge)).toMatchObject({
			currentStatus: { schemaField: 'status' }, statusPlacement: 'firstSectionHeader',
		});
		expect(statusStripProps(badge, 'lifecycle_status').currentStatus).toEqual({ schemaField: 'lifecycle_status' });
	});

	it('is accepted by the detail template schema', () => {
		const parsed = resourceDetailV2PropsSchema.parse({
			schemaName: 'x', translationNs: 'y', ...statusStripProps(badge),
		});
		expect(parsed.statusPlacement).toBe('firstSectionHeader');
	});
});
