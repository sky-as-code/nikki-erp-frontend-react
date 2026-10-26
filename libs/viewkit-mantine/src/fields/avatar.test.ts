import { RequestMaker } from '@nikkierp/common/request';
import { beforeAll, describe, expect, it } from 'vitest';

import { avatarSpecSchema, pickAvatarSrc } from './avatar';


const DOWNLOAD_URL = '/api/v1/itstorage/files/F1/download';

beforeAll(() => {
	RequestMaker.initDefault({ baseUrl: '/api' });
});

describe('avatarSpecSchema', () => {
	it('accepts an optional fileIdField', () => {
		expect(avatarSpecSchema.parse({ renderer: 'avatar', fileIdField: 'avatar_file_id' }).fileIdField)
			.toBe('avatar_file_id');
		expect(avatarSpecSchema.parse({ renderer: 'avatar' }).fileIdField).toBeUndefined();
	});
});

describe('pickAvatarSrc', () => {
	it('prefers the download URL of the row\'s stored file', () => {
		expect(pickAvatarSrc('avatar_file_id', 'https://x/old.png', { avatar_file_id: 'F1' }))
			.toBe(DOWNLOAD_URL);
	});

	it('falls back to the column value, then to nothing', () => {
		expect(pickAvatarSrc('avatar_file_id', 'https://x/old.png', { avatar_file_id: '' }))
			.toBe('https://x/old.png');
		expect(pickAvatarSrc('avatar_file_id', null, {})).toBeUndefined();
		expect(pickAvatarSrc(undefined, 'https://x/old.png')).toBe('https://x/old.png');
	});
});
