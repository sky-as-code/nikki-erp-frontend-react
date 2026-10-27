import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { BFF_API_BASE_URL, loadAppConfig, parseClientConfig, parseSchemaCacheTtlMins } from './env';


const CLIENT_ROOT = path.resolve('client-root-fixture');

describe('parseClientConfig', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('always sends the hard-coded BFF api prefix as BASE_API_URL', () => {
		vi.stubEnv('NIKKI_PUBLIC_BASE_API_URL', 'https://cityboi.extapi-local.coremart.local:4433');
		expect(parseClientConfig('local')['BASE_API_URL']).toBe(BFF_API_BASE_URL);
	});

	it('keeps other public variables and adds APP_ENV', () => {
		vi.stubEnv('NIKKI_PUBLIC_ROOT_DOMAIN', 'coremart.localhost');
		const config = parseClientConfig('prod');
		expect(config['ROOT_DOMAIN']).toBe('coremart.localhost');
		expect(config['APP_ENV']).toBe('prod');
	});
});

describe('loadAppConfig upstream TLS files', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	function stubUpstreamFiles(ca: string, cert: string, key: string): void {
		vi.stubEnv('NIKKI_BFF_CLIENT_ROOT_PATH', CLIENT_ROOT);
		vi.stubEnv('NODE_ENV', 'local');
		vi.stubEnv('NIKKI_BFF_HTTPS_ENABLED', 'false');
		vi.stubEnv('NIKKI_BFF_HTTP_PORT', '3000');
		vi.stubEnv('NIKKI_BFF_UPSTREAM_BASE_URL', 'https://upstream.local:4433');
		vi.stubEnv('NIKKI_BFF_UPSTREAM_CA_FILE', ca);
		vi.stubEnv('NIKKI_BFF_UPSTREAM_CLIENT_CERT_FILE', cert);
		vi.stubEnv('NIKKI_BFF_UPSTREAM_CLIENT_KEY_FILE', key);
	}

	it('resolves relative paths against the client root', () => {
		stubUpstreamFiles('certs/ca.crt, certs/root.crt', 'certs/client.crt', 'certs/client.key');
		const tls = loadAppConfig().upstream.tls;
		expect(tls.caFiles).toEqual([
			path.join(CLIENT_ROOT, 'certs/ca.crt'),
			path.join(CLIENT_ROOT, 'certs/root.crt'),
		]);
		expect(tls.clientCertFile).toBe(path.join(CLIENT_ROOT, 'certs/client.crt'));
		expect(tls.clientKeyFile).toBe(path.join(CLIENT_ROOT, 'certs/client.key'));
	});

	it('keeps absolute paths and leaves unset files undefined', () => {
		const absolute = path.resolve('elsewhere', 'client.crt');
		stubUpstreamFiles('', absolute, '');
		const tls = loadAppConfig().upstream.tls;
		expect(tls.caFiles).toEqual([]);
		expect(tls.clientCertFile).toBe(absolute);
		expect(tls.clientKeyFile).toBeUndefined();
	});
});

describe('parseSchemaCacheTtlMins', () => {
	it('accepts a positive integer number of minutes', () => {
		expect(parseSchemaCacheTtlMins('5')).toBe(5);
		expect(parseSchemaCacheTtlMins(' 120 ')).toBe(120);
	});

	it.each(['', '0', '-3', '1.5', 'abc'])('falls back to 30 for %j', (value) => {
		expect(parseSchemaCacheTtlMins(value)).toBe(30);
	});
});
