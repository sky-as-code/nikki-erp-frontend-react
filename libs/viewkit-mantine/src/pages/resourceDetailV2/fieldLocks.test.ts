import { describe, expect, it } from 'vitest';

import { fieldLockView, updatablePayload, type FieldLockInput } from './fieldLocks';


const locked = (missing: string) => ({ locked: true, missing: [missing] });
const open = { locked: false, missing: [] };

function input(extra: Partial<FieldLockInput>): FieldLockInput {
	return {
		schemaName: 'iam_user', field: 'email', mode: 'read', editable: true, masked: false,
		readLock: open, updateLock: open, ...extra,
	};
}

describe('fieldLockView', () => {
	it('renders a readable field as usual', () => {
		expect(fieldLockView(input({}))).toBeNull();
		expect(fieldLockView(input({ mode: 'update' }))).toBeNull();
	});

	it('locks a read-denied field in view mode, explaining read', () => {
		expect(fieldLockView(input({ readLock: locked('read:iam_user.email:org/O1') })))
			.toEqual({ kind: 'read', missing: ['read:iam_user.email:org/O1'] });
	});

	it('locks a read-denied field in update mode, explaining update', () => {
		expect(fieldLockView(input({ mode: 'update', readLock: locked('read:iam_user.email:tenant') })))
			.toEqual({ kind: 'update', missing: ['read:iam_user.email:tenant'] });
		expect(fieldLockView(input({
			mode: 'update', readLock: locked('read:iam_user.email:tenant'), updateLock: locked('update:iam_user.email:tenant'),
		}))).toEqual({ kind: 'update', missing: ['update:iam_user.email:tenant'] });
	});

	it('shows an update-denied field in view mode and locks it in update mode', () => {
		const updateLock = locked('update:iam_user.email:tenant');
		expect(fieldLockView(input({ updateLock }))).toBeNull();
		expect(fieldLockView(input({ mode: 'update', updateLock })))
			.toEqual({ kind: 'update', missing: ['update:iam_user.email:tenant'] });
	});

	it('keeps a read-only field in update mode on the read explanation', () => {
		expect(fieldLockView(input({ mode: 'update', editable: false, readLock: locked('read:iam_user.email:tenant') })))
			.toEqual({ kind: 'read', missing: ['read:iam_user.email:tenant'] });
	});

	it('locks a field the server masked even when the client check allowed it', () => {
		expect(fieldLockView(input({ masked: true })))
			.toEqual({ kind: 'read', missing: ['read:iam_user.email:org'] });
	});

	it('locks a foreign key whose edge the server masked, on the destination read grant', () => {
		const masked = { field: 'org_unit_id', masked: true, maskedMissing: ['read:iam_orgunit:org'] };
		expect(fieldLockView(input(masked))).toEqual({ kind: 'read', missing: ['read:iam_orgunit:org'] });
		expect(fieldLockView(input({ ...masked, mode: 'update' })))
			.toEqual({ kind: 'update', missing: ['read:iam_orgunit:org'] });
	});

	it('decides nothing in create mode', () => {
		expect(fieldLockView(input({ mode: 'create', readLock: locked('read:iam_user.email:tenant') }))).toBeNull();
	});
});

describe('updatablePayload', () => {
	const schemaFields = new Set(['id', 'etag', 'display_name', 'email', 'status']);

	it('drops the fields the caller may not update and the masked ones', () => {
		const payload = { id: 'U1', etag: 'E1', display_name: 'x', email: 'y', status: null, extra: 1 };
		expect(updatablePayload(payload, schemaFields, { email: locked('update:iam_user.email:tenant') }, ['status']))
			.toEqual({ id: 'U1', etag: 'E1', display_name: 'x', extra: 1 });
	});

	it('keeps everything for a caller holding the resource grant', () => {
		const payload = { id: 'U1', display_name: 'x', email: 'y' };
		expect(updatablePayload(payload, schemaFields, {}, [])).toEqual(payload);
	});
});
