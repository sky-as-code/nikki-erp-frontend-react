import { describe, expect, it } from 'vitest';

import { splitDeletableOrgs } from './orgService';


describe('splitDeletableOrgs', () => {
	it('refuses the current org alone', () => {
		expect(splitDeletableOrgs(['O1'], 'O1')).toEqual({ deletable: [], refusesCurrent: true });
	});

	it('still deletes the other orgs of a bulk delete', () => {
		expect(splitDeletableOrgs(['O1', 'O2', 'O3'], 'O2'))
			.toEqual({ deletable: ['O1', 'O3'], refusesCurrent: true });
	});

	it('refuses nothing when no current org is resolved', () => {
		expect(splitDeletableOrgs(['O1'], null)).toEqual({ deletable: ['O1'], refusesCurrent: false });
	});
});
