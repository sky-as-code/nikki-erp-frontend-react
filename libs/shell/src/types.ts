export type ShellEnvVars = {
	APP_ENV: 'local' | 'dev' | 'prod';

	/**
	 * Base URL for all API calls made by the microfrontend (MFE) Shell.
	 * If a Micro-app doesn't define their own BASE_API_URL, they will reuse this one.
	 */
	BASE_API_URL: string;
	ROOT_DOMAIN: string;
	ROOT_PATH: string;
};
