import { describe, expect, it } from 'vitest';

import { avatarSpecSchema, pickAvatarSrc } from './avatar';


describe('avatarSpecSchema', () => {
	it('accepts an optional urlField', () => {
		expect(avatarSpecSchema.parse({ renderer: 'avatar', urlField: 'avatar_file_url' }).urlField)
			.toBe('avatar_file_url');
		expect(avatarSpecSchema.parse({ renderer: 'avatar' }).urlField).toBeUndefined();
	});
});

describe('pickAvatarSrc', () => {
	it('prefers the row\'s url field', () => {
		expect(pickAvatarSrc('avatar_file_url', 'https://x/old.png', { avatar_file_url: 'https://x/new.png' }))
			.toBe('https://x/new.png');
	});

	it('falls back to the column value, then to nothing', () => {
		expect(pickAvatarSrc('avatar_file_url', 'https://x/old.png', { avatar_file_url: '' })).toBe('https://x/old.png');
		expect(pickAvatarSrc('avatar_file_url', null, {})).toBeUndefined();
		expect(pickAvatarSrc(undefined, 'https://x/old.png')).toBe('https://x/old.png');
	});
});
