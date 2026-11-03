export interface HttpServerConfig {
	readonly host: string;
	readonly port: string;
	readonly httpsEnabled: boolean;
	readonly certificateFile: string;
	readonly privateKeyFile: string;
}

export interface UpstreamTlsConfig {
	readonly caFiles: readonly string[];
	readonly clientCertFile?: string;
	readonly clientKeyFile?: string;
	readonly insecure: boolean;
}

export interface UpstreamConfig {
	readonly baseUrl: URL;
	readonly forwardHost: boolean;
	readonly timeoutMs: number;
	readonly tls: UpstreamTlsConfig;
	/**
	 * Hostnames that receive `traceparent`/`tracestate`/`baggage`/`X-Idempotency-ID`. Undefined means the base
	 * URL's hostname only.
	 */
	readonly propagationHosts?: readonly string[];
}

export interface CookieConfig {
	readonly secure: boolean;
}

export interface AppConfig {
	readonly nodeEnv: string;
	readonly isLocal: boolean;
	readonly clientRootPath: string;
	readonly clientConfig: Readonly<Record<string, string>>;
	readonly http: HttpServerConfig;
	readonly upstream: UpstreamConfig;
	readonly cookie: CookieConfig;
	readonly corsOrigins: readonly string[];
	/** Lifetime of a cached upstream schema or schema graph. */
	readonly schemaCacheTtlMins: number;
}

export type TracesExporterKind = 'none' | 'otlp' | 'console';

export type OtlpProtocol = 'http/json' | 'grpc';

export interface BatchExportConfig {
	readonly maxQueueSize: number;
	readonly maxExportBatchSize: number;
	readonly scheduledDelayMillis: number;
	readonly exportTimeoutMillis: number;
}

/** OpenTelemetry settings, read from the standard `OTEL_*` variables plus the Core Mart policy keys. */
export interface TelemetryConfig {
	readonly serviceName: string;
	readonly serviceVersion: string;
	readonly deploymentEnvironment: string;
	/** Unique per process: hostname, pid and a random suffix. Never a request id. */
	readonly serviceInstanceId: string;
	/** `OTEL_RESOURCE_ATTRIBUTES`, without the keys above. */
	readonly resourceAttributes: Readonly<Record<string, string>>;
	/** Subset of `tracecontext`, `baggage`. */
	readonly propagators: readonly string[];
	readonly sampler: string;
	/** Root ratio, 0 to 1. */
	readonly samplerArg: number;
	readonly exporter: TracesExporterKind;
	readonly otlpProtocol: OtlpProtocol;
	/** OTLP base endpoint; export stays off while it is empty. */
	readonly otlpEndpoint: string;
	readonly batch: BatchExportConfig;
	/** Baggage keys kept at the BFF boundary. Empty drops every entry. */
	readonly baggageAllowlist: readonly string[];
	/** Bound of the provider flush on shutdown, below the 5s forced exit. */
	readonly shutdownFlushMs: number;
}
