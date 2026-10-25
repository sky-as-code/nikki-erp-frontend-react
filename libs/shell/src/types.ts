export type ShellEnvVars = {
	APP_ENV: 'local' | 'dev' | 'prod' | null,

	/**
	 * Base URL for all API calls made by the microfrontend (MFE) Shell.
	 * If a Micro-app doesn't define their own BASE_API_URL, they will reuse this one.
	 *
	 * A same-origin path such as `/api` (the web BFF), never an absolute backend URL: the session
	 * cookies are host-only and path-scoped to it.
	 */
	BASE_API_URL: string,
	ROOT_DOMAIN: string,
	ROOT_PATH: string,
};
