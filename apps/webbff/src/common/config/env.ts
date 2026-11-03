import path from 'node:path';

import * as dotenv from 'dotenv';

import { DEFAULT_SERVICE_NAME, PROCESS_INSTANCE_ID, UNKNOWN_VERSION } from '../../telemetry/identity';

import type {
	AppConfig, BatchExportConfig, CookieConfig, HttpServerConfig, OtlpProtocol, TelemetryConfig, TracesExporterKind,
	UpstreamConfig,
} from './types';


const FE_PREFIX = 'NIKKI_PUBLIC_';
const BFF_PREFIX = 'NIKKI_BFF_';
export const BFF_API_BASE_URL = '/api';
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_UPSTREAM_TIMEOUT_MS = 30000;
const DEFAULT_SCHEMA_CACHE_TTL_MINS = 30;
const OTEL_PREFIX = 'OTEL_';
const DEFAULT_SHUTDOWN_FLUSH_MS = 3000;
// The process is force-exited 5s after a signal; the flush must end before that.
const MAX_SHUTDOWN_FLUSH_MS = 4000;
const RESOURCE_SERVICE_VERSION = 'service.version';
const RESOURCE_ENVIRONMENT = 'deployment.environment.name';
const RESERVED_RESOURCE_KEYS = new Set(['service.name', RESOURCE_SERVICE_VERSION, RESOURCE_ENVIRONMENT,
	'service.instance.id']);

/** Loads the `.env` chain into `process.env`; existing variables win, so it is safe to call more than once. */
export function loadEnvFiles(): void {
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
}

export function loadAppConfig(): AppConfig {
	const clientRootPath = getBffVar('CLIENT_ROOT_PATH');
	loadEnvFiles();
	const nodeEnv = mustGetEnvVar('NODE_ENV');
	const http = parseHttpServer(clientRootPath);
	return Object.freeze({
		nodeEnv,
		isLocal: nodeEnv === 'local',
		clientRootPath,
		clientConfig: Object.freeze(parseClientConfig(nodeEnv)),
		http,
		upstream: parseUpstream(clientRootPath),
		cookie: parseCookie(http.httpsEnabled),
		corsOrigins: splitList(getBffVar('CORS_ORIGINS')),
		schemaCacheTtlMins: parseSchemaCacheTtlMins(getBffVar('SCHEMA_CACHE_TTL_MINS')),
	});
}

export function parseClientConfig(nodeEnv: string): Record<string, string> {
	const clientConfig: Record<string, string> = {};
	for (const [key, value] of Object.entries(process.env)) {
		const configKey = key.substring(FE_PREFIX.length);
		if (key.startsWith(FE_PREFIX) && configKey !== 'BASE_API_URL') {
			clientConfig[configKey] = value ?? '';
		}
	}
	// Not configurable: session cookies are scoped to the BFF's own /api path, so the browser must call it.
	clientConfig['BASE_API_URL'] = BFF_API_BASE_URL;
	clientConfig['APP_ENV'] = nodeEnv;
	return clientConfig;
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

function parseUpstream(clientRootPath: string): UpstreamConfig {
	const timeout = Number(getBffVar('UPSTREAM_TIMEOUT_MS'));
	const certFile = getBffVar('UPSTREAM_CLIENT_CERT_FILE');
	const keyFile = getBffVar('UPSTREAM_CLIENT_KEY_FILE');
	const baseUrl = new URL(mustGetBffVar('UPSTREAM_BASE_URL'));
	return {
		baseUrl,
		forwardHost: getBffVar('UPSTREAM_FORWARD_HOST') === 'true',
		timeoutMs: timeout > 0 ? timeout : DEFAULT_UPSTREAM_TIMEOUT_MS,
		tls: {
			caFiles: splitList(getBffVar('UPSTREAM_CA_FILE')).map((file) => resolvePath(clientRootPath, file)),
			clientCertFile: certFile ? resolvePath(clientRootPath, certFile) : undefined,
			clientKeyFile: keyFile ? resolvePath(clientRootPath, keyFile) : undefined,
			insecure: getBffVar('UPSTREAM_TLS_INSECURE') === 'true',
		},
		propagationHosts: parsePropagationHosts(getBffVar('TELEMETRY_PROPAGATION_HOST_ALLOWLIST'), baseUrl),
	};
}

/** Lowercased hostnames; empty means the upstream base URL's hostname only. */
export function parsePropagationHosts(value: string, baseUrl: URL): string[] {
	const hosts = splitList(value).map((host) => host.toLowerCase());
	return hosts.length > 0 ? hosts : [baseUrl.hostname.toLowerCase()];
}

/**
 * Standard `OTEL_*` names, mapped explicitly: the SDK is never left to read the environment on its own. A non-empty
 * `NIKKI_BFF_OTEL_*` twin wins over the standard name, for a host whose `OTEL_*` belong to another service.
 */
export function loadTelemetryConfig(): TelemetryConfig {
	const attributes = parseResourceAttributes(getOtelVar('RESOURCE_ATTRIBUTES'));
	const resourceAttributes = Object.fromEntries(
		Object.entries(attributes).filter(([key]) => !RESERVED_RESOURCE_KEYS.has(key)),
	);
	return Object.freeze({
		serviceName: getOtelVar('SERVICE_NAME') || DEFAULT_SERVICE_NAME,
		serviceVersion: attributes[RESOURCE_SERVICE_VERSION] || UNKNOWN_VERSION,
		deploymentEnvironment: attributes[RESOURCE_ENVIRONMENT] || process.env.NODE_ENV || 'unknown',
		serviceInstanceId: PROCESS_INSTANCE_ID,
		resourceAttributes,
		propagators: splitList(getOtelVar('PROPAGATORS') || 'tracecontext,baggage').map((name) => name.toLowerCase()),
		sampler: (getOtelVar('TRACES_SAMPLER') || 'parentbased_traceidratio').toLowerCase(),
		samplerArg: parseRatio(getOtelVar('TRACES_SAMPLER_ARG')),
		exporter: parseExporterKind(getOtelVar('TRACES_EXPORTER')),
		otlpProtocol: parseOtlpProtocol(getOtelVar('EXPORTER_OTLP_PROTOCOL')),
		otlpEndpoint: getOtelVar('EXPORTER_OTLP_ENDPOINT').trim(),
		batch: parseBatchExport(),
		baggageAllowlist: splitList(getBffVar('TELEMETRY_BAGGAGE_ALLOWLIST')),
		shutdownFlushMs: Math.min(
			parsePositiveInt(getBffVar('TELEMETRY_SHUTDOWN_FLUSH_MS'), DEFAULT_SHUTDOWN_FLUSH_MS), MAX_SHUTDOWN_FLUSH_MS,
		),
	});
}

/** `k1=v1,k2=v2` with percent-encoded values; malformed pairs are skipped. */
export function parseResourceAttributes(value: string): Record<string, string> {
	const attributes: Record<string, string> = {};
	for (const pair of splitList(value)) {
		const separator = pair.indexOf('=');
		if (separator <= 0) {
			continue;
		}
		try {
			attributes[pair.substring(0, separator).trim()] = decodeURIComponent(pair.substring(separator + 1).trim());
		}
		catch {
			// Not percent-decodable: skipped like any other malformed pair.
		}
	}
	return attributes;
}

/** A number in [0, 1]; anything else is 1.0. */
export function parseRatio(value: string): number {
	const ratio = Number(value);
	return value.trim() !== '' && Number.isFinite(ratio) && ratio >= 0 && ratio <= 1 ? ratio : 1;
}

function parseExporterKind(value: string): TracesExporterKind {
	const kind = value.trim().toLowerCase();
	return kind === 'otlp' || kind === 'console' ? kind : 'none';
}

/** `grpc`, else OTLP/HTTP with a JSON body (`http/protobuf` included: no protobuf exporter is shipped). */
function parseOtlpProtocol(value: string): OtlpProtocol {
	return value.trim().toLowerCase() === 'grpc' ? 'grpc' : 'http/json';
}

function parseBatchExport(): BatchExportConfig {
	return {
		maxQueueSize: parsePositiveInt(getOtelVar('BSP_MAX_QUEUE_SIZE'), 2048),
		maxExportBatchSize: parsePositiveInt(getOtelVar('BSP_MAX_EXPORT_BATCH_SIZE'), 512),
		scheduledDelayMillis: parsePositiveInt(getOtelVar('BSP_SCHEDULE_DELAY'), 5000),
		exportTimeoutMillis: parsePositiveInt(getOtelVar('BSP_EXPORT_TIMEOUT'), 30000),
	};
}

function parsePositiveInt(value: string, fallback: number): number {
	const parsed = Number(value);
	return value.trim() !== '' && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getOtelVar(key: string): string {
	return process.env[`${BFF_PREFIX}${OTEL_PREFIX}${key}`] || process.env[`${OTEL_PREFIX}${key}`] || '';
}

/** A positive integer number of minutes; anything else (unset, zero, negative, fractional, text) is the default. */
export function parseSchemaCacheTtlMins(value: string): number {
	const minutes = Number(value);
	return value.trim() !== '' && Number.isInteger(minutes) && minutes > 0 ? minutes : DEFAULT_SCHEMA_CACHE_TTL_MINS;
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
