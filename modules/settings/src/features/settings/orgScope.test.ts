import { describe, expect, it, vi } from 'vitest';

import { resolveSettingsOrgId } from './orgScope';


describe('resolveSettingsOrgId', () => {
	it('sends the Shell current org for an org-level call', async () => {
		expect(await resolveSettingsOrgId({ level: 'org' }, async () => 'org-b')).toBe('org-b');
	});

	it('keeps an org the caller named', async () => {
		const current = vi.fn(async () => 'org-b');
		expect(await resolveSettingsOrgId({ level: 'org', orgId: 'org-a' }, current)).toBe('org-a');
		expect(current).not.toHaveBeenCalled();
	});

	it('sends none for the tenant and user levels', async () => {
		const current = vi.fn(async () => 'org-b');
		expect(await resolveSettingsOrgId({ level: 'tenant' }, current)).toBeNull();
		expect(await resolveSettingsOrgId({ level: 'user', orgId: 'org-a' }, current)).toBeNull();
		expect(current).not.toHaveBeenCalled();
	});

	it('sends none before the Shell resolves an org, leaving the backend fallback', async () => {
		expect(await resolveSettingsOrgId({ level: 'org' }, async () => null)).toBeNull();
	});
});
