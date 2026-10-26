import { describe, expect, it, vi } from 'vitest';

import { collectContributions, collectFileFields, withFileFields } from './afterSave';
import { toStagedFile } from '../../components/resourceFileField/fileFieldHooks';


describe('collectContributions', () => {
	it('merges every pending contribution into one payload', () => {
		const contributions = collectContributions([
			{ build: () => ({ entitlements: { add: [], remove: ['e1'] } }) },
			{ build: () => undefined },
			{ build: () => ({ extra: 1 }) },
		]);
		expect(contributions.payload).toEqual({ entitlements: { add: [], remove: ['e1'] }, extra: 1 });
	});

	it('notifies only the contributors whose keys were sent', () => {
		const sent = vi.fn();
		const idle = vi.fn();
		const contributions = collectContributions([
			{ build: () => ({ key: 'value' }), onSaved: sent },
			{ build: () => undefined, onSaved: idle },
		]);
		expect(sent).not.toHaveBeenCalled();
		contributions.notifySaved();
		expect(sent).toHaveBeenCalledOnce();
		expect(idle).not.toHaveBeenCalled();
	});

	it('yields an empty payload without contributors', () => {
		expect(collectContributions([]).payload).toEqual({});
	});

	it('asks only the contributing sections to confirm, and stops at the first refusal', async () => {
		const declines = vi.fn(async () => false);
		const idle = vi.fn(async () => true);
		const never = vi.fn(async () => true);
		const contributions = collectContributions([
			{ build: () => ({ key: 1 }), confirm: declines },
			{ build: () => undefined, confirm: idle },
			{ build: () => ({ other: 2 }), confirm: never },
		]);
		await expect(contributions.confirm({ id: 'r1' })).resolves.toBe(false);
		expect(declines).toHaveBeenCalledWith({ id: 'r1' });
		expect(idle).not.toHaveBeenCalled();
		expect(never).not.toHaveBeenCalled();
		await expect(collectContributions([{ build: () => ({ key: 1 }) }]).confirm({})).resolves.toBe(true);
	});
});

describe('collectFileFields', () => {
	const file = new File(['x'], 'a.png');

	it('sends chosen files as files and removals as null, skipping untouched fields', () => {
		const contributions = collectFileFields([
			{ field: 'avatar_file_id', staged: () => ({ file }) },
			{ field: 'header_logo_file_id', staged: () => ({ removed: true }) },
			{ field: 'footer_logo_file_id', staged: () => undefined },
		]);
		expect(contributions).toEqual({ files: { avatar_file_id: file }, cleared: { header_logo_file_id: null } });
		expect(withFileFields({ id: 'U1' }, contributions)).toEqual({
			id: 'U1', header_logo_file_id: null, __files: { avatar_file_id: file },
		});
	});

	it('stages a removal only when a file is stored', () => {
		expect(toStagedFile(file, true, true)).toEqual({ file });
		expect(toStagedFile(null, true, true)).toEqual({ removed: true });
		expect(toStagedFile(null, true, false)).toBeUndefined();
		expect(toStagedFile(null, false, true)).toBeUndefined();
	});
});
