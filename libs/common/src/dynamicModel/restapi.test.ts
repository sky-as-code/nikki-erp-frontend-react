import { describe, expect, it, vi } from 'vitest';

import { RestApi } from './restapi';

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
