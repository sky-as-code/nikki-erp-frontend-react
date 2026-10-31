import { describe, expect, it } from 'vitest';

import { resourceDetailV2PropsSchema } from './props';
import { statusStripProps } from './statusStripProps';


describe('statusStripProps', () => {
	const badge = { statuses: ['draft', 'done', 'cancelled'], prefix: 'transfer_status.', alternativeEnds: ['cancelled'] };

	it('lists the statuses in order, labelled by the prefix, alternative ends marked, without colours', () => {
		expect(statusStripProps(badge).allStatuses).toEqual([
			{ value: 'draft', label: 'transfer_status.draft' },
			{ value: 'done', label: 'transfer_status.done' },
			{ value: 'cancelled', label: 'transfer_status.cancelled', alternativeEnd: true },
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
