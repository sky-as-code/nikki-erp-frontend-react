import { describe, expect, it } from 'vitest';

import { thumbnailMode } from './thumbnailMode';


const open = { locked: false, missing: [] };
const locked = { locked: true, missing: ['update:iam_user.avatar_file_id:org'] };

describe('thumbnailMode', () => {
	it('only previews in view mode, whatever the update grant', () => {
		expect(thumbnailMode({ editable: false, updateLock: open, hasImage: true })).toBe('view');
		expect(thumbnailMode({ editable: false, updateLock: locked, hasImage: true })).toBe('view');
		expect(thumbnailMode({ editable: false, updateLock: open, hasImage: false })).toBe('none');
	});

	it('edits in update mode, or locks without the file field update grant', () => {
		expect(thumbnailMode({ editable: true, updateLock: open, hasImage: false })).toBe('edit');
		expect(thumbnailMode({ editable: true, updateLock: locked, hasImage: true })).toBe('locked');
	});
});
