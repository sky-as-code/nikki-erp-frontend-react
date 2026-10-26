import { describe, expect, it, vi } from 'vitest';

import { RestApi } from './restapi';

import type { RequestMaker } from '../request/request';


function fakeMaker() {
	const ok = () => Promise.resolve({ data: { etag: 'e2' }, clientErrors: [] });
	return { post: vi.fn(ok), put: vi.fn(ok), delete: vi.fn(ok) };
}

function newApi(maker: ReturnType<typeof fakeMaker>): RestApi {
	return new RestApi({ resourcePath: 'v1/iam/iam_user', requestMaker: maker as unknown as RequestMaker });
}

describe('RestApi file fields', () => {
	it('uploads to the BFF route with etag and org in the query and the file as the last part', async () => {
		const maker = fakeMaker();
		const file = new File(['png'], 'a.png', { type: 'image/png' });
		await newApi(maker).uploadFile({ id: 'U1', field: 'avatar', file, replace: true, etag: 'E1', org_id: 'O1' });

		expect(maker.put).toHaveBeenCalledOnce();
		type PutCall = [string, { body: FormData, searchParams: unknown }];
		const [url, options] = maker.put.mock.calls[0] as unknown as PutCall;
		expect(url).toBe('v0/iam/iam_user/U1/files/avatar');
		expect(options.searchParams).toEqual({ etag: 'E1', org_id: 'O1' });
		expect([...options.body.keys()]).toEqual(['org_id', 'name', 'mime_type', 'size_bytes', 'file']);
		expect(options.body.get('size_bytes')).toBe('3');
	});

	it('clears a file through DELETE on the same route', async () => {
		const maker = fakeMaker();
		await newApi(maker).deleteFile({ id: 'U1', field: 'avatar', etag: 'E1' });

		expect(maker.delete).toHaveBeenCalledWith('v0/iam/iam_user/U1/files/avatar', { searchParams: { etag: 'E1' } });
	});
});
