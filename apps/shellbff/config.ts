import * as dotenv from 'dotenv';

// The first value set for a variable will win
dotenv.config({ path: ['.env.local', '.env'] });

const FE_PREFIX = 'NIKKI_PUBLIC_';
const BFF_PREFIX = 'NIKKI_BFF_';

/**
 * Parse frontend configuration from environment variables.
 */
export function parseFrontend(): Record<string, string> {
	const frontendConfig: Record<string, string> = {};

	// Iterate through all environment variables
	for (const [key, value] of Object.entries(process.env)) {
		if (key.startsWith(FE_PREFIX)) {
			const configKey = key.substring(FE_PREFIX.length);
			frontendConfig[configKey] = value ?? '';
		}
	}

	frontendConfig['APP_ENV'] = mustGetNodeEnv();
	return frontendConfig;
}

/**
 * Gets a specific BFF configuration value. Throws an error if the value is not set.
 */
export function mustGetBffConfig(key: string): string {
	const fullKey = `${BFF_PREFIX}${key}`;
	return mustGetEnvVar(fullKey);
}

/**
 * Gets a specific BFF configuration value. Returns an empty string if the value is not set.
 */
export function getBffConfig(key: string): string {
	const fullKey = `${BFF_PREFIX}${key}`;
	return process.env[fullKey] ?? '';
}

export function mustGetNodeEnv(): string {
	return mustGetEnvVar('NODE_ENV');
}

export function mustGetHttpPort(): string {
	return mustGetEnvVar('PORT');
}

export function mustGetEnvVar(fullKey: string): string {
	const value = process.env[fullKey];
	if (!value) {
		throw new Error(`Missing required environment variable: ${fullKey}`);
	}
	return value;
}
