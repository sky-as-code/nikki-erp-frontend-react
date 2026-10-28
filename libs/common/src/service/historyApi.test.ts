import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchResourceHistory, RESOURCE_HISTORY_PATH } from './historyApi';
import { CommandBus } from '../commandBus';
import { get } from '../request/request';

import type { ICommandBus } from '../commandBus';


vi.mock('../request/request', () => ({
	get: vi.fn(async () => ({ data: { items: [], total: 0, page: 0, size: 20 }, clientErrors: [] })),
}));

const CURRENT_ORG = '01JWNY20G23KD4RV5VWYABQYHD';

function installBus(orgId: string | null): void {
	CommandBus.instance = {
		publish: vi.fn(async () => ({ result: { data: orgId } })),
	} as unknown as ICommandBus;
}

function sentParams(): URLSearchParams {
	const options = vi.mocked(get).mock.calls[0][1] as { searchParams: URLSearchParams };
	return options.searchParams;
}

afterEach(() => {
	vi.mocked(get).mockClear();
});

describe('fetchResourceHistory', () => {
	it('asks the history route for the record, in the current org', async () => {
		installBus(CURRENT_ORG);
		await fetchResourceHistory({ resourceCode: 'iam_user', resourceId: 'U1', page: 2, size: 20 });

		expect(vi.mocked(get).mock.calls[0][0]).toBe(RESOURCE_HISTORY_PATH);
		expect(Object.fromEntries(sentParams())).toEqual({
			org_id: CURRENT_ORG, resource_code: 'iam_user', resource_id: 'U1', page: '2', size: '20',
		});
	});

	it('sends no org or paging it does not have', async () => {
		installBus(null);
		await fetchResourceHistory({ resourceCode: 'iam_role', resourceId: 'R1' });

		expect(Object.fromEntries(sentParams())).toEqual({ resource_code: 'iam_role', resource_id: 'R1' });
	});
});
