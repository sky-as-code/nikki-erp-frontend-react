import { describe, expect, it } from 'vitest';

import { resolveModuleKey, schemaPrefix } from './module_key_resolver';


describe('resolveModuleKey', () => {
	it('prefers an explicit module key from the schema JSON', () => {
		expect(resolveModuleKey('vdmc_kiosks', { explicitModuleKey: 'custom' })).toBe('custom');
	});

	it('ignores a non-string or empty explicit key', () => {
		expect(resolveModuleKey('iam_users', { explicitModuleKey: 42 })).toBe('iam');
		expect(resolveModuleKey('iam_users', { explicitModuleKey: '' })).toBe('iam');
	});

	it('uses the root module when the target shares the root prefix', () => {
		const hint = { rootModuleKey: 'headquarters', rootSchemaName: 'hq_branches' };
		expect(resolveModuleKey('hq_regions', hint)).toBe('headquarters');
		expect(resolveModuleKey('iam_users', hint)).toBe('iam');
	});

	it('maps prefixes that differ from the module key', () => {
		expect(resolveModuleKey('vdmc_kiosk_models')).toBe('vendingmachine');
	});

	it('defaults to the prefix before the first underscore', () => {
		expect(resolveModuleKey('essential_uom_categories')).toBe('essential');
	});

	it('cannot resolve a schema name without a prefix', () => {
		expect(resolveModuleKey('orphan')).toBeUndefined();
		expect(resolveModuleKey('_leading')).toBeUndefined();
		expect(schemaPrefix('orphan')).toBeUndefined();
	});
});
