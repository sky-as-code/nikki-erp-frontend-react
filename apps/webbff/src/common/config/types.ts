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
}
