import path from 'node:path';

import * as dotenv from 'dotenv';

import type { AppConfig, CookieConfig, HttpServerConfig, UpstreamConfig } from './types';


const FE_PREFIX = 'NIKKI_PUBLIC_';
const BFF_PREFIX = 'NIKKI_BFF_';
export const BFF_API_BASE_URL = '/api';
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_UPSTREAM_TIMEOUT_MS = 30000;

export function loadAppConfig(): AppConfig {
	const clientRootPath = getBffVar('CLIENT_ROOT_PATH');
	// The first value set for a variable wins.
	dotenv.config({
		path: [
			path.join(clientRootPath, '.env.local'),
			path.join(PACKAGE_ROOT, '.env.local'),
			path.join(PACKAGE_ROOT, '.env.default'),
		],
		quiet: true,
	});
	const nodeEnv = mustGetEnvVar('NODE_ENV');
	const http = parseHttpServer(clientRootPath);
	return Object.freeze({
		nodeEnv,
		isLocal: nodeEnv === 'local',
		clientRootPath,
		clientConfig: Object.freeze(parseClientConfig(nodeEnv)),
		http,
		upstream: parseUpstream(),
		cookie: parseCookie(http.httpsEnabled),
		corsOrigins: splitList(getBffVar('CORS_ORIGINS')),
	});
}

export function parseClientConfig(nodeEnv: string): Record<string, string> {
	const clientConfig: Record<string, string> = {};
	for (const [key, value] of Object.entries(process.env)) {
		if (key.startsWith(FE_PREFIX)) {
			clientConfig[key.substring(FE_PREFIX.length)] = value ?? '';
		}
	}
	clientConfig['BASE_API_URL'] = enforceBffApiBaseUrl(clientConfig['BASE_API_URL']);
	clientConfig['APP_ENV'] = nodeEnv;
	return clientConfig;
}

// Session cookies are host-only and scoped to the BFF's /api path, so a browser that calls the business
// service directly (e.g. a leftover absolute URL in a personal .env.local) can never authenticate.
function enforceBffApiBaseUrl(configured: string | undefined): string {
	if (configured && configured !== BFF_API_BASE_URL) {
		console.warn(`WARNING: ${FE_PREFIX}BASE_API_URL=${configured} is ignored; `
			+ `the browser always calls the BFF at ${BFF_API_BASE_URL}`);
	}
	return BFF_API_BASE_URL;
}

function parseHttpServer(clientRootPath: string): HttpServerConfig {
	const httpsEnabled = getBffVar('HTTPS_ENABLED') === 'true';
	if (!httpsEnabled) {
		return { host: getBffVar('HTTP_HOST'), port: mustGetBffVar('HTTP_PORT'), httpsEnabled,
			certificateFile: '', privateKeyFile: '' };
	}
	return {
		host: getBffVar('HTTP_HOST'),
		port: mustGetBffVar('HTTPS_PORT'),
		httpsEnabled,
		certificateFile: resolvePath(clientRootPath, mustGetBffVar('HTTPS_CERTIFICATE_FILE')),
		privateKeyFile: resolvePath(clientRootPath, mustGetBffVar('HTTPS_PRIVATE_KEY_FILE')),
	};
}

function parseUpstream(): UpstreamConfig {
	const timeout = Number(getBffVar('UPSTREAM_TIMEOUT_MS'));
	const certFile = getBffVar('UPSTREAM_CLIENT_CERT_FILE');
	const keyFile = getBffVar('UPSTREAM_CLIENT_KEY_FILE');
	return {
		baseUrl: new URL(mustGetBffVar('UPSTREAM_BASE_URL')),
		forwardHost: getBffVar('UPSTREAM_FORWARD_HOST') === 'true',
		timeoutMs: timeout > 0 ? timeout : DEFAULT_UPSTREAM_TIMEOUT_MS,
		tls: {
			caFiles: splitList(getBffVar('UPSTREAM_CA_FILE')).map((file) => resolvePath(PACKAGE_ROOT, file)),
			clientCertFile: certFile ? resolvePath(PACKAGE_ROOT, certFile) : undefined,
			clientKeyFile: keyFile ? resolvePath(PACKAGE_ROOT, keyFile) : undefined,
			insecure: getBffVar('UPSTREAM_TLS_INSECURE') === 'true',
		},
	};
}

export function parseCookieSecure(value: string, httpsEnabled: boolean): boolean {
	if (value === 'true') {
		return true;
	}
	if (value === 'false') {
		return false;
	}
	return httpsEnabled;
}

function parseCookie(httpsEnabled: boolean): CookieConfig {
	return { secure: parseCookieSecure(getBffVar('COOKIE_SECURE'), httpsEnabled) };
}

function splitList(value: string): string[] {
	return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function resolvePath(baseDir: string, value: string): string {
	return path.isAbsolute(value) ? value : path.join(baseDir, value);
}

function getBffVar(key: string): string {
	return process.env[`${BFF_PREFIX}${key}`] ?? '';
}

function mustGetBffVar(key: string): string {
	return mustGetEnvVar(`${BFF_PREFIX}${key}`);
}

function mustGetEnvVar(fullKey: string): string {
	const value = process.env[fullKey];
	if (!value) {
		throw new Error(`Missing required environment variable: ${fullKey}`);
	}
	return value;
}
