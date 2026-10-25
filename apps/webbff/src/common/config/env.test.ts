import { afterEach, describe, expect, it, vi } from 'vitest';

import { BFF_API_BASE_URL, parseClientConfig } from './env';


const ENV_KEY = 'NIKKI_PUBLIC_BASE_API_URL';

describe('parseClientConfig', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it('always sends the BFF api prefix as BASE_API_URL', () => {
		vi.stubEnv(ENV_KEY, '');
		expect(parseClientConfig('local')['BASE_API_URL']).toBe(BFF_API_BASE_URL);
	});

	it('ignores an absolute business service url and warns', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.stubEnv(ENV_KEY, 'https://cityboi.extapi-local.coremart.local:4433');
		expect(parseClientConfig('local')['BASE_API_URL']).toBe('/api');
		expect(warn).toHaveBeenCalledOnce();
	});

	it('keeps other public variables and adds APP_ENV', () => {
		vi.stubEnv('NIKKI_PUBLIC_ROOT_DOMAIN', 'coremart.localhost');
		const config = parseClientConfig('prod');
		expect(config['ROOT_DOMAIN']).toBe('coremart.localhost');
		expect(config['APP_ENV']).toBe('prod');
	});
});
