import { createUpstreamClient } from '../http/upstream_client';
import { createConsoleLogger } from '../logging/logger';
import { createSessionCookies } from '../session/cookies';

import type { AppConfig } from '../config/types';
import type { UpstreamClient } from '../http/upstream_client';
import type { Logger } from '../logging/logger';
import type { SessionCookies } from '../session/cookies';


export type { AppConfig, Logger, SessionCookies, UpstreamClient };

/** Every shared dependency of the BFF. Modules receive it in their router factory and take what they need. */
export interface Container {
	readonly config: AppConfig;
	readonly logger: Logger;
	readonly upstream: UpstreamClient;
	readonly sessionCookies: SessionCookies;
}

export type ContainerOverrides = Partial<Omit<Container, 'config'>>;

export function createContainer(config: AppConfig, overrides: ContainerOverrides = {}): Container {
	const logger = overrides.logger ?? createConsoleLogger();
	return Object.freeze({
		config,
		logger,
		upstream: overrides.upstream ?? createUpstreamClient(config.upstream, logger),
		sessionCookies: overrides.sessionCookies ?? createSessionCookies(config.cookie),
	});
}
