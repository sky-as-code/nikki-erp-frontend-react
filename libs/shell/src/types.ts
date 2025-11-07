export type ShellEnvVars = {
	/**
	 * Base URL for all API calls made by the microfrontend (MFE) Shell.
	 * If a Micro-app doesn't define their own BASE_API_URL, they will reuse this one.
	 */
	BASE_API_URL: string;
};