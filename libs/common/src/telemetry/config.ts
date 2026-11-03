import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';


export type TelemetryExporterMode = 'none' | 'otlp';

/**
 * Browser telemetry settings. Every value comes from `window.__CLIENT_CONFIG__` at runtime (the BFF
 * serves each `NIKKI_PUBLIC_OTEL_*` variable without its prefix), so none of them needs a rebuild.
 */
export type TelemetryConfig = {
	serviceName: string,
	/** `none` (default) keeps a real provider and valid trace context, but sends nothing anywhere. */
	exporter: TelemetryExporterMode,
	/** OTLP/HTTP traces endpoint, used only when `exporter` is `otlp`. Never instrumented itself. */
	exporterUrl: string,
	/** Root sampling ratio in [0, 1]; a request with a parent follows the parent's decision. */
	samplerRatio: number,
	/**
	 * Where trace context and the idempotency ID may be sent. A path entry (`/api`) means that path on the
	 * page's own origin; an absolute entry (`https://partner.example/v1`) means that origin and path prefix.
	 */
	propagationOrigins: string[],
	/** Baggage keys allowed to leave the browser. Empty by default: no baggage is sent. */
	baggageAllowlist: string[],
	/** Extra processors, for tests (an in-memory exporter) or a deliberate development console. */
	spanProcessors?: SpanProcessor[],
};

export const DEFAULT_TELEMETRY_CONFIG: Readonly<TelemetryConfig> = Object.freeze({
	serviceName: 'coremart-webapp',
	exporter: 'none',
	exporterUrl: '',
	samplerRatio: 1,
	propagationOrigins: ['/api'],
	baggageAllowlist: [],
});

type ClientConfigWindow = {
	__CLIENT_CONFIG__?: Record<string, unknown> | string,
};

/** Reads the runtime config bag; an unset or still-templated bag (`$$CLIENT_CONFIG$$`) yields the defaults. */
export function readTelemetryConfig(source?: Record<string, unknown>): TelemetryConfig {
	const bag = source ?? readClientConfigBag();
	const exporterUrl = readString(bag, 'OTEL_EXPORTER_URL');
	const exporter = readString(bag, 'OTEL_EXPORTER') === 'otlp' && exporterUrl ? 'otlp' : 'none';
	const origins = splitList(readString(bag, 'OTEL_PROPAGATION_ORIGINS'));
	return {
		serviceName: readString(bag, 'OTEL_SERVICE_NAME') || DEFAULT_TELEMETRY_CONFIG.serviceName,
		exporter,
		exporterUrl: exporter === 'otlp' ? exporterUrl : '',
		samplerRatio: parseRatio(readString(bag, 'OTEL_SAMPLER_ARG')),
		propagationOrigins: origins.length > 0 ? origins : [...DEFAULT_TELEMETRY_CONFIG.propagationOrigins],
		baggageAllowlist: splitList(readString(bag, 'OTEL_BAGGAGE_ALLOWLIST')),
	};
}

/** A ratio outside [0, 1] or not a number is the default 1.0. */
export function parseRatio(value: string): number {
	const ratio = Number(value);
	if (value.trim() === '' || !Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
		return DEFAULT_TELEMETRY_CONFIG.samplerRatio;
	}
	return ratio;
}

function readClientConfigBag(): Record<string, unknown> {
	const bag = (globalThis as ClientConfigWindow).__CLIENT_CONFIG__;
	return bag && typeof bag === 'object' ? bag : {};
}

function readString(bag: Record<string, unknown>, key: string): string {
	const value = bag[key];
	return typeof value === 'string' ? value.trim() : '';
}

function splitList(value: string): string[] {
	return value.split(',').map((item) => item.trim()).filter(Boolean);
}
