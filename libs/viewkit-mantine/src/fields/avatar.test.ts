import { RequestMaker } from '@nikkierp/common/request';
import { beforeAll, describe, expect, it } from 'vitest';

import { avatarSpecSchema, pickAvatarSrc } from './avatar';


const DOWNLOAD_URL = '/api/v1/itstorage/files/download?path=org%2FF1.png';

beforeAll(() => {
	RequestMaker.initDefault({ baseUrl: '/api' });
});

describe('avatarSpecSchema', () => {
	it('accepts an optional pathField', () => {
		expect(avatarSpecSchema.parse({ renderer: 'avatar', pathField: 'avatar_file_path' }).pathField)
			.toBe('avatar_file_path');
		expect(avatarSpecSchema.parse({ renderer: 'avatar' }).pathField).toBeUndefined();
	});
});

describe('pickAvatarSrc', () => {
	it('prefers the download URL of the row\'s stored file', () => {
		expect(pickAvatarSrc('avatar_file_path', 'https://x/old.png', { avatar_file_path: 'org/F1.png' }))
			.toBe(DOWNLOAD_URL);
	});

	it('falls back to the column value, then to nothing', () => {
		expect(pickAvatarSrc('avatar_file_path', 'https://x/old.png', { avatar_file_path: '' }))
			.toBe('https://x/old.png');
		expect(pickAvatarSrc('avatar_file_path', null, {})).toBeUndefined();
		expect(pickAvatarSrc(undefined, 'https://x/old.png')).toBe('https://x/old.png');
	});
});
