import { describe, expect, it, vi } from 'vitest';

import { labelledPath, RestApi } from './restapi';

import type { RequestMaker } from '../request/request';


function fakeMaker() {
	const ok = () => Promise.resolve({ data: { etag: 'e2' }, clientErrors: [] });
	return { post: vi.fn(ok), patch: vi.fn(ok) };
}

function newApi(maker: ReturnType<typeof fakeMaker>): RestApi {
	return new RestApi({ resourcePath: 'v1/iam/iam_user', requestMaker: maker as unknown as RequestMaker });
}

type FormCall = [string, { body: FormData }];

describe('RestApi writes with files', () => {
	it('sends JSON when no file is chosen', async () => {
		const maker = fakeMaker();
		await newApi(maker).update({ id: 'U1', etag: 'E1', avatar_file_id: null }, undefined, {});

		expect(maker.patch).toHaveBeenCalledWith('v1/iam/iam_user/U1', { json: { etag: 'E1', avatar_file_id: null } });
	});

	it('sends the payload part first, with the file sizes, then each file under its field', async () => {
		const maker = fakeMaker();
		const file = new File(['png'], 'a.png', { type: 'image/png' });
		await newApi(maker).update({ id: 'U1', etag: 'E1', org_id: 'O1' }, undefined, { avatar_file_id: file });

		const [url, options] = maker.patch.mock.calls[0] as unknown as FormCall;
		expect(url).toBe('v1/iam/iam_user/U1');
		expect([...options.body.keys()]).toEqual(['payload', 'avatar_file_id']);
		expect(JSON.parse(options.body.get('payload') as string)).toEqual({
			etag: 'E1', org_id: 'O1', __file_sizes: { avatar_file_id: 3 },
		});
		expect((options.body.get('avatar_file_id') as File).name).toBe('a.png');
	});

	it('creates through the same multipart form', async () => {
		const maker = fakeMaker();
		const file = new File(['x'], 'm.mp4', { type: 'video/mp4' });
		await newApi(maker).create({ name: 'M' }, undefined, { media_file_id: file });

		const [url, options] = maker.post.mock.calls[0] as unknown as FormCall;
		expect(url).toBe('v1/iam/iam_user');
		expect([...options.body.keys()]).toEqual(['payload', 'media_file_id']);
	});
});

type GetCall = [string, { searchParams: URLSearchParams, dedupKey: string }];

function fakeReader() {
	const ok = () => Promise.resolve({ data: {}, clientErrors: [] });
	return { get: vi.fn(ok) };
}

describe('RestApi labelled reads', () => {
	it('maps a resource path onto the BFF list/detail prefixes', () => {
		expect(labelledPath('list', 'v1/iam/iam_user')).toBe('v1/list/iam/iam_user');
		expect(labelledPath('detail', 'v1/iam/iam_org/O1/iam_orgunit')).toBe('v1/detail/iam/iam_org/O1/iam_orgunit');
	});

	it('searches through list/ when with_edge_labels is set, without sending the flag', async () => {
		const maker = fakeReader();
		const api = new RestApi({ resourcePath: 'v1/iam/iam_user', requestMaker: maker as unknown as RequestMaker });
		await api.search({ page: 0, size: 10, with_edge_labels: true });
		await api.search({ page: 0, size: 10 });

		const [labelledUrl, labelled] = maker.get.mock.calls[0] as unknown as GetCall;
		const [plainUrl, plain] = maker.get.mock.calls[1] as unknown as GetCall;
		expect(labelledUrl).toBe('v1/list/iam/iam_user');
		expect(labelled.searchParams.has('with_edge_labels')).toBe(false);
		expect(plainUrl).toBe('v1/iam/iam_user');
		expect(labelled.dedupKey).not.toBe(plain.dedupKey);
	});

	it('reads by id through detail/ when with_edge_labels is set', async () => {
		const maker = fakeReader();
		const api = new RestApi({ resourcePath: 'v1/iam/iam_user', requestMaker: maker as unknown as RequestMaker });
		await api.getById({ id: 'U1', org_id: 'O1', with_edge_labels: true });

		const [url, options] = maker.get.mock.calls[0] as unknown as GetCall;
		expect(url).toBe('v1/detail/iam/iam_user/U1');
		expect([...options.searchParams.keys()]).toEqual(['org_id']);
	});
});
